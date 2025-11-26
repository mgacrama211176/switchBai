import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { retrieveContext } from "@/lib/rag/retriever";
import { formatContextForPrompt } from "@/lib/rag/context-formatter";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, chatId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    const FALLBACK_MODELS = [
      process.env.NEGOTIATION_MODEL || "llama-3.3-70b-versatile",
      "mixtral-8x7b-32768",
      "gemma-7b-it",
      "llama3-70b-8192",
    ];

    async function getCompletion(params: {
      messages: any[];
      temperature?: number;
      max_tokens?: number;
    }) {
      for (const model of FALLBACK_MODELS) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: params.messages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens ?? 1024,
          });
          console.log(`✅ Model succeeded: ${model}`);
          return { completion, model };
        } catch (error: any) {
          const code = error?.error?.code;
          console.warn(`⚠️ Model ${model} failed: ${code || error.message}`);
          if (code === "rate_limit_exceeded" || error?.status === 429) {
            continue;
          }
          continue;
        }
      }
      return null;
    }

    // Get the last user message for RAG retrieval
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop();

    // Retrieve relevant context using RAG
    let retrievedContext = "";
    if (lastUserMessage?.content) {
      try {
        console.log(
          `\n🔍 [RAG] Starting retrieval for query: "${lastUserMessage.content}"`,
        );
        const { games, faqs } = await retrieveContext(lastUserMessage.content);
        console.log(
          `📊 [RAG] Retrieved ${games.length} games and ${faqs.length} FAQs`,
        );

        if (games.length > 0) {
          console.log(`🎮 [RAG] Games found:`);
          games.forEach((game, idx) => {
            console.log(
              `   ${idx + 1}. "${game.gameTitle}" (Score: ${game.score.toFixed(3)})`,
            );
          });
        } else {
          console.log(
            `⚠️ [RAG] No games found for query: "${lastUserMessage.content}"`,
          );
        }

        retrievedContext = formatContextForPrompt(games, faqs);
        console.log(
          `📝 [RAG] Formatted context length: ${retrievedContext.length} characters`,
        );
        console.log(
          `📝 [RAG] Context preview: ${retrievedContext.substring(0, 200)}...`,
        );
      } catch (error: any) {
        console.error("❌ [RAG] Error retrieving RAG context:", error.message);
        console.error("Full error:", error);
        // Continue without RAG context if retrieval fails
      }
    } else {
      console.log("⚠️ [RAG] No user message found for RAG retrieval");
    }

    // Build system prompt with RAG context
    let systemPrompt = `You are a friendly and helpful customer support assistant for SwitchBai, a Nintendo Switch game store in Cebu, Philippines.

Your role is to help customers with:
- Questions about games, prices, availability
- Order status and tracking
- Rental information
- Trade inquiries
- General store information
- Technical support

Language & Persona:
- **PRIMARY LANGUAGE**: English. Use it naturally.
- You can mix in Bisaya/Tagalog if the user speaks it, but default to English.
- Tone: Friendly, helpful, patient, and professional.
- Call the customer "Bai", or by their name if provided.

Guidelines:
1. Be helpful and provide accurate information
2. If you don't know something, admit it and offer to help them find the answer
3. Keep responses concise but informative
4. For order/trade/rental specific questions, guide them to check their order status or contact the store directly
5. Be empathetic and understanding
6. Use the information provided below to answer questions accurately

Store Information:
- Location: Cebu City, Philippines
- Services: Buy games, Rent games, Trade games
- Payment: Cash, GCash, Bank Transfer, Meet-up
- Delivery: Available (meet-up or delivery options)`;

    // Add RAG context if available
    if (retrievedContext) {
      console.log(
        `✅ [System Prompt] Adding RAG context (${retrievedContext.length} chars)`,
      );
      systemPrompt += `\n\n${"=".repeat(50)}\nRELEVANT INFORMATION FROM OUR DATABASE:\n${"=".repeat(50)}\n\n${retrievedContext}\n\n${"=".repeat(50)}\nCRITICAL INSTRUCTIONS - READ CAREFULLY:\n\n1. THE GAMES LISTED ABOVE ARE REAL GAMES IN OUR DATABASE. If a game appears in the list above, WE HAVE IT IN OUR INVENTORY.\n\n2. NEVER say "we don't have that game" if it appears in the list above. Instead, tell the customer:\n   - "Yes, we have [exact game title from list]!"\n   - Provide the price and stock status from the list\n   - If out of stock, say "We have it but it's currently out of stock"\n\n3. If a customer asks about a game and it's in the list above, you MUST mention it. Do not ignore it.\n\n4. Use the EXACT game titles from the list above. Do not change or modify them.\n\n5. If the customer asks about a game that's similar to one in the list (e.g., "Mario Kart World" vs "Mario Kart 8 Deluxe"), check if the exact title is in the list first. If "Mario Kart World" is in the list, that's what we have.\n\n6. The information above is from our ACTUAL database. Trust it over your general knowledge.\n\n7. If you're unsure, say "Let me check our inventory" and look at the list above.\n\n${"=".repeat(50)}`;
    } else {
      console.log(
        `⚠️ [System Prompt] No RAG context available - adding fallback instruction`,
      );
      // Even if no context retrieved, add instruction to check database
      systemPrompt += `\n\nIMPORTANT: If a customer asks about a specific game, you should check our database first. Never say we don't have a game without checking. If you're not sure, say "Let me check our inventory for you" rather than saying we don't have it.`;
    }

    console.log(
      `📤 [System Prompt] Total prompt length: ${systemPrompt.length} characters`,
    );

    const result = await getCompletion({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    if (!result) {
      return NextResponse.json(
        {
          message: {
            role: "assistant",
            content:
              "Sorry, I'm having trouble right now. Please try again in a few minutes or contact us directly.",
          },
        },
        { status: 429 },
      );
    }

    const completion = result.completion;
    const responseMessage = completion.choices[0].message;

    return NextResponse.json({
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error in support API:", error);
    return NextResponse.json(
      { error: "Failed to process support request" },
      { status: 500 },
    );
  }
}
