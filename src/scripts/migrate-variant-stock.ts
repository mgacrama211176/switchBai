/**
 * Migration script to populate stockWithCase and stockCartridgeOnly fields
 * from existing gameAvailableStocks data.
 *
 * Run with: npx ts-node src/scripts/migrate-variant-stock.ts
 */

import mongoose from "mongoose";
import GameModel from "../models/Game";
import connectDB from "../lib/mongodb";

async function migrateVariantStock() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Find all games
    const games = await GameModel.find({});
    console.log(`Found ${games.length} games to process\n`);

    let migrated = 0; // Games that didn't have variant fields
    let fixed = 0; // Games that had variant fields but wrong gameAvailableStocks
    let alreadyCorrect = 0; // Games that are already correct

    for (const game of games) {
      const hasVariantFields =
        game.stockWithCase !== undefined ||
        game.stockCartridgeOnly !== undefined;

      let stockWithCase: number;
      let stockCartridgeOnly: number;

      if (!hasVariantFields) {
        // Migrate: set stockWithCase = gameAvailableStocks, stockCartridgeOnly = 0
        stockWithCase = game.gameAvailableStocks || 0;
        stockCartridgeOnly = 0;

        await GameModel.findByIdAndUpdate(game._id, {
          $set: {
            stockWithCase,
            stockCartridgeOnly,
            gameAvailableStocks: stockWithCase + stockCartridgeOnly,
          },
        });

        migrated++;
        console.log(
          `✓ Migrated ${game.gameTitle}: WC=${stockWithCase}, CO=${stockCartridgeOnly}, Total=${stockWithCase + stockCartridgeOnly}`,
        );
      } else {
        // Game already has variant fields, check if gameAvailableStocks is correct
        stockWithCase = game.stockWithCase || 0;
        stockCartridgeOnly = game.stockCartridgeOnly || 0;
        const computedStock = stockWithCase + stockCartridgeOnly;
        const currentStock = game.gameAvailableStocks || 0;

        if (currentStock !== computedStock) {
          // Fix gameAvailableStocks to match variant sum
          await GameModel.findByIdAndUpdate(game._id, {
            $set: {
              gameAvailableStocks: computedStock,
            },
          });

          fixed++;
          console.log(
            `✓ Fixed ${game.gameTitle}: Updated gameAvailableStocks from ${currentStock} to ${computedStock} (WC=${stockWithCase}, CO=${stockCartridgeOnly})`,
          );
        } else {
          alreadyCorrect++;
        }
      }
    }

    console.log(`\n=== Migration Summary ===`);
    console.log(`Total games processed: ${games.length}`);
    console.log(`Migrated (new variant fields): ${migrated}`);
    console.log(`Fixed (corrected gameAvailableStocks): ${fixed}`);
    console.log(`Already correct: ${alreadyCorrect}`);
    console.log(`\nMigration complete!`);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateVariantStock();
