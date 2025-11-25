import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import connectDB from "@/lib/mongodb";
import { generateQueryEmbedding } from "@/lib/embeddings/generator";
import Game from "@/models/Game";
import KnowledgeBase from "@/models/KnowledgeBase";

export interface RetrievedGame {
  _id: string;
  gameTitle: string;
  gameDescription: string;
  gameCategory: string;
  gamePlatform: string | string[];
  gamePrice: number;
  isOnSale?: boolean;
  salePrice?: number;
  gameAvailableStocks: number;
  score: number;
}

export interface RetrievedFAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  score: number;
}

/**
 * Search games using vector search with text search fallback
 */
export async function searchGames(
  queryEmbedding: number[],
  queryText: string,
  limit: number = 5,
): Promise<RetrievedGame[]> {
  try {
    await connectDB();

    const client = await mongoose.connection.getClient();
    const db = client.db();
    const collection = db.collection("games");

    // Use $vectorSearch aggregation
    const pipeline = [
      {
        $vectorSearch: {
          index: "switchBaiVector",
          path: "vector",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit,
        },
      },
      {
        $project: {
          _id: 1,
          gameTitle: 1,
          gameDescription: 1,
          gameCategory: 1,
          gamePlatform: 1,
          gamePrice: 1,
          isOnSale: 1,
          salePrice: 1,
          gameAvailableStocks: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    console.log(`✅ Vector search found ${results.length} games`);

    if (results.length > 0) {
      return results.map((doc) => ({
        _id: doc._id.toString(),
        gameTitle: doc.gameTitle,
        gameDescription: doc.gameDescription,
        gameCategory: doc.gameCategory,
        gamePlatform: doc.gamePlatform,
        gamePrice: doc.gamePrice,
        isOnSale: doc.isOnSale || false,
        salePrice: doc.salePrice,
        gameAvailableStocks: doc.gameAvailableStocks,
        score: doc.score || 0,
      }));
    }

    // If vector search returns no results, try text search as fallback
    console.log(
      `⚠️ [Vector Search] Returned no results for "${queryText}", trying text search fallback...`,
    );
    return await searchGamesTextFallback(queryText, limit);
  } catch (error: any) {
    console.error(
      `❌ [Vector Search] Error for query "${queryText}":`,
      error.message,
    );
    console.error("Full error:", error);
    // If vector search fails, fallback to text search
    console.log(
      `🔄 [Vector Search] Falling back to text search for "${queryText}"`,
    );
    return await searchGamesTextFallback(queryText, limit);
  }
}

/**
 * Text search fallback for games
 */
async function searchGamesTextFallback(
  queryText: string,
  limit: number = 5,
): Promise<RetrievedGame[]> {
  try {
    // Clean and prepare search query
    const cleanQuery = queryText.trim().toLowerCase();

    // Extract potential barcode (if query contains only digits)
    const barcodeMatch = cleanQuery.match(/^\d{10,13}$/);

    // Build search conditions
    const searchConditions: any[] = [];

    // If it looks like a barcode, search by barcode
    if (barcodeMatch) {
      searchConditions.push({ gameBarcode: cleanQuery });
    }

    // Extract meaningful search terms (remove common words)
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "do",
      "does",
      "did",
      "have",
      "has",
      "had",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "what",
      "which",
      "who",
      "where",
      "when",
      "why",
      "how",
    ]);

    const searchTerms = cleanQuery
      .split(/\s+/)
      .filter((term) => term.length > 2 && !commonWords.has(term));

    // Create regex patterns for better matching
    if (searchTerms.length > 0) {
      // Try exact phrase match first
      searchConditions.push({
        gameTitle: {
          $regex: cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        },
      });

      // Try all words must be present (AND search)
      const allWordsPattern = searchTerms
        .map((term) => `(?=.*${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)
        .join("");
      searchConditions.push({
        gameTitle: { $regex: allWordsPattern, $options: "i" },
      });

      // Try individual word matches (OR search) - lower priority
      const wordPattern = searchTerms
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      searchConditions.push({
        $or: [
          { gameTitle: { $regex: wordPattern, $options: "i" } },
          { gameDescription: { $regex: wordPattern, $options: "i" } },
          { gameCategory: { $regex: wordPattern, $options: "i" } },
        ],
      });
    }

    if (searchConditions.length === 0) {
      return [];
    }

    // Try searches in order of specificity
    let games: any[] = [];

    for (const condition of searchConditions) {
      const results = await Game.find(condition)
        .limit(limit)
        .select(
          "gameTitle gameDescription gameCategory gamePlatform gamePrice isOnSale salePrice gameAvailableStocks gameBarcode",
        )
        .lean();

      if (results.length > 0) {
        games = results;
        console.log(
          `✅ Text search found ${games.length} games with condition:`,
          Object.keys(condition)[0],
        );
        break; // Use the first successful search
      }
    }

    // If still no results, try a more lenient search
    if (games.length === 0 && searchTerms.length > 0) {
      const lenientPattern = searchTerms
        .slice(0, 2) // Use first 2 words
        .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");

      const lenientResults = await Game.find({
        gameTitle: { $regex: lenientPattern, $options: "i" },
      })
        .limit(limit)
        .select(
          "gameTitle gameDescription gameCategory gamePlatform gamePrice isOnSale salePrice gameAvailableStocks gameBarcode",
        )
        .lean();

      if (lenientResults.length > 0) {
        games = lenientResults;
        console.log(`✅ Lenient text search found ${games.length} games`);
      }
    }

    console.log(`✅ [Text Search] Found ${games.length} games total`);
    if (games.length > 0) {
      console.log(
        `   Game titles: ${games.map((g: any) => `"${g.gameTitle}"`).join(", ")}`,
      );
    }

    return games.map((game: any) => ({
      _id: game._id.toString(),
      gameTitle: game.gameTitle,
      gameDescription: game.gameDescription,
      gameCategory: game.gameCategory,
      gamePlatform: game.gamePlatform,
      gamePrice: game.gamePrice,
      isOnSale: game.isOnSale || false,
      salePrice: game.salePrice,
      gameAvailableStocks: game.gameAvailableStocks,
      score: 0.5, // Default score for fallback
    }));
  } catch (fallbackError: any) {
    console.error(
      "❌ Text search fallback also failed:",
      fallbackError.message,
    );
    return [];
  }
}

/**
 * Search knowledge base using vector search
 */
export async function searchKnowledgeBase(
  queryEmbedding: number[],
  limit: number = 3,
): Promise<RetrievedFAQ[]> {
  try {
    await connectDB();

    const client = await mongoose.connection.getClient();
    const db = client.db();
    // Use the model's collection name (Mongoose pluralizes "KnowledgeBase" to "knowledgebases")
    const collection = db.collection("knowledgebases");

    // Use $vectorSearch aggregation
    const pipeline = [
      {
        $vectorSearch: {
          index: "switchBaiVector", // Same index or create separate one for knowledge base
          path: "vector",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: limit,
        },
      },
      {
        $project: {
          _id: 1,
          question: 1,
          answer: 1,
          category: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results.map((doc) => ({
      _id: doc._id.toString(),
      question: doc.question,
      answer: doc.answer,
      category: doc.category,
      score: doc.score || 0,
    }));
  } catch (error: any) {
    console.error("Error searching knowledge base:", error);
    // If vector search fails, fallback to text search
    try {
      const faqs = await KnowledgeBase.find({
        $or: [
          { question: { $regex: new RegExp(error.message || "", "i") } },
          { answer: { $regex: new RegExp(error.message || "", "i") } },
        ],
      })
        .limit(limit)
        .select("question answer category");

      return faqs.map((faq) => ({
        _id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        score: 0.5, // Default score for fallback
      }));
    } catch (fallbackError) {
      console.error("Fallback search also failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Retrieve relevant context for a user query
 */
export async function retrieveContext(query: string): Promise<{
  games: RetrievedGame[];
  faqs: RetrievedFAQ[];
}> {
  try {
    console.log(`🔍 Retrieving context for query: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log(
      `✅ Generated query embedding (${queryEmbedding.length} dimensions)`,
    );

    // Search both games and knowledge base in parallel
    const [games, faqs] = await Promise.all([
      searchGames(queryEmbedding, query, 5),
      searchKnowledgeBase(queryEmbedding, 3),
    ]);

    console.log(`📊 Retrieved ${games.length} games and ${faqs.length} FAQs`);
    if (games.length > 0) {
      console.log(`   Games: ${games.map((g) => g.gameTitle).join(", ")}`);
    }

    return { games, faqs };
  } catch (error: any) {
    console.error("❌ Error retrieving context:", error.message);
    console.error("Full error:", error);
    return { games: [], faqs: [] };
  }
}
