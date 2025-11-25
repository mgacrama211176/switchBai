import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "@/models/Game";
import { generateDocumentEmbedding } from "@/lib/embeddings/generator";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

if (!process.env.COHERE_API_KEY) {
  throw new Error("Please define COHERE_API_KEY in .env.local");
}

/**
 * Combine game fields into a searchable text string
 */
function createGameText(game: any): string {
  const platform = Array.isArray(game.gamePlatform)
    ? game.gamePlatform.join(", ")
    : game.gamePlatform;

  return `${game.gameTitle} ${game.gameDescription} ${game.gameCategory} ${platform}`.trim();
}

/**
 * Batch index games with vector embeddings
 */
async function indexGames() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Fetch all games
    const games = await Game.find({}).select("+vector"); // Include vector field
    console.log(`Found ${games.length} games to index`);

    if (games.length === 0) {
      console.log("No games found. Exiting.");
      await mongoose.disconnect();
      return;
    }

    let indexed = 0;
    let errors = 0;
    const batchSize = 10; // Process 10 games at a time to avoid rate limits

    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      console.log(
        `\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(games.length / batchSize)} (games ${i + 1}-${Math.min(i + batchSize, games.length)})`,
      );

      // Process batch in parallel
      const promises = batch.map(async (game) => {
        try {
          // Skip if already has vector (optional - remove if you want to re-index)
          // if (game.vector && game.vector.length > 0) {
          //   console.log(`⏭️  Skipping ${game.gameTitle} (already has vector)`);
          //   return;
          // }

          const gameText = createGameText(game);
          console.log(`  Generating embedding for: ${game.gameTitle}`);

          const embedding = await generateDocumentEmbedding(gameText);

          // Update game with vector
          await Game.updateOne(
            { _id: game._id },
            { $set: { vector: embedding } },
          );

          indexed++;
          console.log(`  ✅ Indexed: ${game.gameTitle}`);
        } catch (error: any) {
          errors++;
          console.error(
            `  ❌ Error indexing ${game.gameTitle}:`,
            error.message,
          );
        }
      });

      await Promise.all(promises);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < games.length) {
        console.log("  Waiting 1 second before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Indexing complete!`);
    console.log(`   Total games: ${games.length}`);
    console.log(`   Successfully indexed: ${indexed}`);
    console.log(`   Errors: ${errors}`);
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error indexing games:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
indexGames();
