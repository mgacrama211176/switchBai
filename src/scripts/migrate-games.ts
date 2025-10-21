import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import connectDB from "../lib/mongodb";
import GameModel from "../models/Game";

interface GameData {
  games: Array<{
    gameTitle: string;
    gamePlatform: string | string[];
    gameRatings: string;
    gameBarcode: string;
    gameDescription: string;
    gameImageURL: string;
    gameAvailableStocks: number;
    gamePrice: number;
    gameCategory: string;
    gameReleaseDate: string;
    createdAt: string;
    updatedAt: string;
    numberOfSold?: number;
    rentalAvailable?: boolean;
    rentalWeeklyRate?: number;
    class?: string;
    tradable?: boolean;
  }>;
}

async function migrateGames() {
  try {
    console.log("🚀 Starting games migration...");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Read games.json
    const gamesPath = path.join(process.cwd(), "src/app/data/games.json");
    const gamesData: GameData = JSON.parse(fs.readFileSync(gamesPath, "utf8"));

    console.log(`📁 Found ${gamesData.games.length} games in JSON file`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each game
    for (const game of gamesData.games) {
      try {
        // Check if game already exists
        const existingGame = await GameModel.findOne({
          gameBarcode: game.gameBarcode,
        });

        if (existingGame) {
          console.log(`⏭️  Skipped: ${game.gameTitle} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create new game document
        const gameDoc = new GameModel({
          gameTitle: game.gameTitle,
          gamePlatform: game.gamePlatform,
          gameRatings: game.gameRatings,
          gameBarcode: game.gameBarcode,
          gameDescription: game.gameDescription,
          gameImageURL: game.gameImageURL,
          gameAvailableStocks: game.gameAvailableStocks,
          gamePrice: game.gamePrice,
          gameCategory: game.gameCategory,
          gameReleaseDate: game.gameReleaseDate,
          numberOfSold: game.numberOfSold || 0,
          rentalAvailable: game.rentalAvailable || false,
          rentalWeeklyRate: game.rentalWeeklyRate || 0,
          class: game.class || "",
          tradable: game.tradable ?? true,
          createdAt: new Date(game.createdAt),
          updatedAt: new Date(game.updatedAt),
        });

        await gameDoc.save();
        console.log(`✅ Migrated: ${game.gameTitle}`);
        successCount++;
      } catch (error) {
        const errorMsg = `❌ Failed to migrate ${game.gameTitle}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        errorCount++;
      }
    }

    // Print summary
    console.log("\n📊 Migration Summary:");
    console.log(`✅ Successfully migrated: ${successCount} games`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} games`);
    console.log(`❌ Failed: ${errorCount} games`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Verify migration
    const totalGames = await GameModel.countDocuments();
    console.log(`\n📈 Total games in database: ${totalGames}`);

    console.log("\n🎉 Migration completed!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateGames();
}

export default migrateGames;
