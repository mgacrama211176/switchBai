import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

/**
 * Generate embeddings using Cohere's multilingual model
 * @param texts Array of texts to embed
 * @returns Array of embedding vectors (1024 dimensions each)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  try {
    const response = await cohere.embed({
      texts,
      model: "embed-multilingual-v3.0",
      inputType: "search_document", // Use "search_query" for queries
      truncate: "END",
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("No embeddings returned from Cohere");
    }

    return response.embeddings;
  } catch (error: any) {
    console.error("Error generating embeddings:", error);

    // Handle rate limits
    if (error?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    throw new Error(`Failed to generate embeddings: ${error.message || error}`);
  }
}

/**
 * Generate a single embedding for a query
 * @param text Text to embed
 * @returns Embedding vector (1024 dimensions)
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-multilingual-v3.0",
      inputType: "search_query", // Use "search_query" for queries
      truncate: "END",
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("No embedding returned from Cohere");
    }

    return response.embeddings[0];
  } catch (error: any) {
    console.error("Error generating query embedding:", error);

    // Handle rate limits
    if (error?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    throw new Error(
      `Failed to generate query embedding: ${error.message || error}`,
    );
  }
}

/**
 * Generate embedding for a document (for indexing)
 * @param text Text to embed
 * @returns Embedding vector (1024 dimensions)
 */
export async function generateDocumentEmbedding(
  text: string,
): Promise<number[]> {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not set in environment variables");
  }

  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-multilingual-v3.0",
      inputType: "search_document", // Use "search_document" for documents
      truncate: "END",
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("No embedding returned from Cohere");
    }

    return response.embeddings[0];
  } catch (error: any) {
    console.error("Error generating document embedding:", error);

    // Handle rate limits
    if (error?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    throw new Error(
      `Failed to generate document embedding: ${error.message || error}`,
    );
  }
}
