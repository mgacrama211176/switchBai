import mongoose from "mongoose";
import dotenv from "dotenv";
import KnowledgeBase from "@/models/KnowledgeBase";
import { generateDocumentEmbedding } from "@/lib/embeddings/generator";
import { faqData } from "@/lib/knowledge-base/faq-data";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

if (!process.env.COHERE_API_KEY) {
  throw new Error("Please define COHERE_API_KEY in .env.local");
}

/**
 * Combine FAQ question and answer into searchable text
 */
function createFAQText(faq: { question: string; answer: string }): string {
  return `${faq.question} ${faq.answer}`.trim();
}

/**
 * Batch index knowledge base with vector embeddings
 */
async function indexKnowledgeBase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    console.log(`Found ${faqData.length} FAQ entries to index`);

    if (faqData.length === 0) {
      console.log("No FAQ data found. Exiting.");
      await mongoose.disconnect();
      return;
    }

    // Clear existing knowledge base (optional - comment out if you want to keep existing)
    const existingCount = await KnowledgeBase.countDocuments();
    if (existingCount > 0) {
      console.log(`\nFound ${existingCount} existing entries. Clearing...`);
      await KnowledgeBase.deleteMany({});
      console.log("✅ Cleared existing entries");
    }

    let indexed = 0;
    let errors = 0;
    const batchSize = 10; // Process 10 FAQs at a time

    for (let i = 0; i < faqData.length; i += batchSize) {
      const batch = faqData.slice(i, i + batchSize);
      console.log(
        `\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(faqData.length / batchSize)} (entries ${i + 1}-${Math.min(i + batchSize, faqData.length)})`,
      );

      // Process batch in parallel
      const promises = batch.map(async (faq) => {
        try {
          const faqText = createFAQText(faq);
          console.log(
            `  Generating embedding for: ${faq.question.substring(0, 50)}...`,
          );

          const embedding = await generateDocumentEmbedding(faqText);

          // Create knowledge base entry
          const kbEntry = new KnowledgeBase({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            vector: embedding,
            metadata: faq.metadata || {},
          });

          await kbEntry.save();

          indexed++;
          console.log(`  ✅ Indexed: ${faq.question.substring(0, 50)}...`);
        } catch (error: any) {
          errors++;
          console.error(
            `  ❌ Error indexing "${faq.question.substring(0, 50)}...":`,
            error.message,
          );
        }
      });

      await Promise.all(promises);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < faqData.length) {
        console.log("  Waiting 1 second before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Indexing complete!`);
    console.log(`   Total FAQs: ${faqData.length}`);
    console.log(`   Successfully indexed: ${indexed}`);
    console.log(`   Errors: ${errors}`);
    console.log("=".repeat(50));

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error indexing knowledge base:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
indexKnowledgeBase();
