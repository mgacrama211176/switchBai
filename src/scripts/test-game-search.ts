import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "@/models/Game";
import { retrieveContext } from "@/lib/rag/retriever";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

async function testGameSearch() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB\n");

    // Test 1: Direct database query for "Mario Kart World"
    console.log("=".repeat(60));
    console.log("TEST 1: Direct Database Query");
    console.log("=".repeat(60));
    const directQuery = await Game.find({
      gameTitle: { $regex: /mario kart world/i },
    })
      .select("gameTitle gameBarcode gamePrice gameAvailableStocks")
      .lean();

    console.log(
      `Found ${directQuery.length} games with "Mario Kart World" in title:`
    );
    directQuery.forEach((game: any) => {
      console.log(
        `  - ${game.gameTitle} (Barcode: ${game.gameBarcode}, Price: ₱${game.gamePrice}, Stock: ${game.gameAvailableStocks})`
      );
    });
    console.log();

    // Test 2: Search by barcode
    console.log("=".repeat(60));
    console.log("TEST 2: Search by Barcode (4902370553284)");
    console.log("=".repeat(60));
    const barcodeQuery = await Game.findOne({
      gameBarcode: "4902370553284",
    })
      .select("gameTitle gameBarcode gamePrice gameAvailableStocks")
      .lean();

    if (barcodeQuery) {
      console.log(`Found game: ${(barcodeQuery as any).gameTitle}`);
      console.log(`  Barcode: ${(barcodeQuery as any).gameBarcode}`);
      console.log(`  Price: ₱${(barcodeQuery as any).gamePrice}`);
      console.log(`  Stock: ${(barcodeQuery as any).gameAvailableStocks}`);
    } else {
      console.log("❌ No game found with barcode 4902370553284");
    }
    console.log();

    // Test 3: Partial match search
    console.log("=".repeat(60));
    console.log("TEST 3: Partial Match Search (mario + kart)");
    console.log("=".repeat(60));
    const partialQuery = await Game.find({
      $or: [
        { gameTitle: { $regex: /mario.*kart|kart.*mario/i } },
        {
          $and: [
            { gameTitle: { $regex: /mario/i } },
            { gameTitle: { $regex: /kart/i } },
          ],
        },
      ],
    })
      .select("gameTitle gameBarcode")
      .limit(10)
      .lean();

    console.log(`Found ${partialQuery.length} games with "mario" and "kart":`);
    partialQuery.forEach((game: any) => {
      console.log(`  - ${game.gameTitle} (Barcode: ${game.gameBarcode})`);
    });
    console.log();

    // Test 4: RAG retrieval test
    console.log("=".repeat(60));
    console.log("TEST 4: RAG Retrieval Test");
    console.log("=".repeat(60));
    const testQueries = [
      "mario kart world",
      "do you have mario kart world",
      "Mario Kart World",
    ];

    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      try {
        const { games, faqs } = await retrieveContext(query);
        console.log(`  Found ${games.length} games, ${faqs.length} FAQs`);
        if (games.length > 0) {
          games.forEach((game, idx) => {
            console.log(
              `    ${idx + 1}. "${game.gameTitle}" (Score: ${game.score.toFixed(3)})`
            );
          });
        } else {
          console.log(`    ⚠️ No games found`);
        }
      } catch (error: any) {
        console.error(`    ❌ Error: ${error.message}`);
      }
    }

    await mongoose.disconnect();
    console.log("\n✅ Tests complete. Disconnected from MongoDB.");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testGameSearch();
