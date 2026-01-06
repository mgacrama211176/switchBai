import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { retrieveContext } from "@/lib/rag/retriever";
import { formatContextForPrompt } from "@/lib/rag/context-formatter";
import connectDB from "@/lib/mongodb";
import SupportChat from "@/models/SupportChat";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const startTime = Date.now();
  let ragResults: { games: any[]; faqs: any[] } = { games: [], faqs: [] };
  let modelUsed = "";
  let responseTime = 0;
  let chatId: string | undefined;
  let messages: any[] = [];

  try {
    const body = await request.json();
    messages = body.messages || [];
    chatId = body.chatId;

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

    // Detect conversation end signals
    const endKeywords = [
      "thanks",
      "thank you",
      "bye",
      "goodbye",
      "that's all",
      "no more questions",
      "all set",
      "done",
      "finished",
      "okay thanks",
      "ok thanks",
      "ty",
      "thank you so much",
      "thanks a lot",
    ];
    const conversationEnded =
      lastUserMessage?.content &&
      endKeywords.some((keyword) =>
        lastUserMessage.content.toLowerCase().includes(keyword),
      );

    // Retrieve relevant context using RAG
    let retrievedContext = "";
    if (lastUserMessage?.content) {
      try {
        console.log(
          `\n🔍 [RAG] Starting retrieval for query: "${lastUserMessage.content}"`,
        );
        ragResults = await retrieveContext(lastUserMessage.content);
        const { games, faqs } = ragResults;
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

    responseTime = Date.now() - startTime;

    if (!result) {
      // Log failed request
      logConversation(
        chatId,
        messages,
        ragResults,
        null,
        responseTime,
        "none",
        retrievedContext.length,
        false,
      ).catch((err) => console.error("Error logging conversation:", err));

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
    modelUsed = result.model;

    // Log conversation asynchronously (don't block response)
    logConversation(
      chatId,
      [...messages, responseMessage],
      ragResults,
      result,
      responseTime,
      modelUsed,
      retrievedContext.length,
      conversationEnded,
    ).catch((err) => console.error("Error logging conversation:", err));

    return NextResponse.json({
      message: responseMessage,
      conversationEnded: conversationEnded || false,
    });
  } catch (error) {
    console.error("Error in support API:", error);

    // Try to log error case
    if (chatId) {
      logConversation(
        chatId,
        messages,
        { games: [], faqs: [] },
        null,
        Date.now() - startTime,
        "error",
        0,
        false,
      ).catch((err) => console.error("Error logging error conversation:", err));
    }

    return NextResponse.json(
      { error: "Failed to process support request" },
      { status: 500 },
    );
  }
}

/**
 * Log conversation to SupportChat model (non-blocking)
 */
async function logConversation(
  chatId: string | undefined,
  messages: any[],
  ragResults: { games: any[]; faqs: any[] },
  completionResult: any,
  responseTime: number,
  modelUsed: string,
  contextLength: number,
  conversationEnded: boolean = false,
) {
  if (!chatId) {
    console.warn("⚠️ No chatId provided, skipping conversation log");
    return;
  }

  try {
    await connectDB();

    const { games, faqs } = ragResults;

    // Calculate RAG metrics
    const avgGameScore =
      games.length > 0
        ? games.reduce((sum, g) => sum + (g.score || 0), 0) / games.length
        : 0;
    const avgFAQScore =
      faqs.length > 0
        ? faqs.reduce((sum, f) => sum + (f.score || 0), 0) / faqs.length
        : 0;

    // Gap detection: no results OR low confidence
    const hasNoResults = games.length === 0 && faqs.length === 0;
    const hasLowConfidence =
      (games.length > 0 && avgGameScore < 0.5) ||
      (faqs.length > 0 && avgFAQScore < 0.5) ||
      (games.length > 0 && faqs.length === 0) ||
      (games.length === 0 && faqs.length > 0);
    const needsReview = hasNoResults || hasLowConfidence;

    // Get the last user message for query
    const lastUserMessage = messages
      .filter((msg: any) => msg.role === "user")
      .pop();

    // Find or create chat session
    const existingChat = await SupportChat.findOne({ chatId });

    const chatMessage = {
      role: "assistant" as const,
      content: completionResult
        ? completionResult.completion.choices[0].message.content
        : "Error: No response generated",
      timestamp: new Date(),
    };

    const ragMetrics = {
      query: lastUserMessage?.content || "",
      gamesRetrieved: games.length,
      faqsRetrieved: faqs.length,
      avgGameScore,
      avgFAQScore,
      hasLowConfidence,
      contextLength,
    };

    const responseMetrics = {
      modelUsed,
      responseTime,
      tokenCount: completionResult?.completion?.usage?.total_tokens,
    };

    if (existingChat) {
      // Update existing chat
      existingChat.messages.push(chatMessage);
      existingChat.ragMetrics = ragMetrics;
      existingChat.responseMetrics = responseMetrics;
      existingChat.needsReview = needsReview;
      existingChat.conversationEnded =
        conversationEnded || existingChat.conversationEnded;
      existingChat.metadata = {
        ...existingChat.metadata,
        messageCount: existingChat.messages.length,
      };
      await existingChat.save();
    } else {
      // Create new chat
      const newChat = new SupportChat({
        chatId,
        messages: [...messages, chatMessage],
        ragMetrics,
        responseMetrics,
        needsReview,
        conversationEnded,
        metadata: {
          messageCount: messages.length + 1,
          sessionStart: new Date(),
        },
      });
      await newChat.save();
    }

    if (needsReview) {
      console.log(
        `📌 [Learning] Flagged chat ${chatId} for review (no results: ${hasNoResults}, low confidence: ${hasLowConfidence})`,
      );
    }
  } catch (error: any) {
    console.error("Error logging conversation:", error);
    // Don't throw - logging failures shouldn't break the API
  }
}
