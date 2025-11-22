import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/mongodb";
import Negotiation from "@/models/Negotiation";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    await connectDB();
    const { messages, cartContext, negotiationId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    // Save user message
    const userMessage = messages[messages.length - 1];

    let negotiation;
    if (negotiationId) {
      negotiation = await Negotiation.findOne({ negotiationId });
      if (!negotiation) {
        negotiation = new Negotiation({
          negotiationId,
          cartItems: cartContext.items,
          totalAmount: cartContext.totalAmount,
          messages: [],
        });
      }

      // Add user message
      negotiation.messages.push({
        role: userMessage.role,
        content: userMessage.content,
        timestamp: new Date(),
      });
    }

    // Calculate max discount with dynamic strategies
    const eligibleItems = cartContext.items.filter(
      (item: any) => !item.isOnSale,
    );
    const eligibleGamesCount = eligibleItems.length;
    const currentTotal = cartContext.totalAmount;

    // Time-based strategy (off-peak hours get better deals)
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21);
    const timeMultiplier = isPeakHour ? 1.0 : 1.2; // 20% more generous off-peak

    // Single-item aggression (be stricter ONLY with exactly 1 item)
    const singleItemPenalty = cartContext.items.length === 1 ? 0.5 : 1.0;

    // Bundle discount (reward buying 3+ games)
    const bundleBonus = cartContext.items.length >= 3 ? 50 : 0;

    // Loyalty bonus will be determined by AI asking for customer name
    let loyaltyBonus = 0;
    
    // Check if loyalty was already verified in this negotiation
    if (negotiation && negotiation.customerName) {
      try {
        const PurchaseModel = (await import("@/models/Purchase")).default;
        const previousPurchase = await PurchaseModel.findOne({
          customerName: { $regex: new RegExp(negotiation.customerName, "i") },
          status: { $in: ["pending", "confirmed", "completed"] },
        }).limit(1);
        
        if (previousPurchase) {
          loyaltyBonus = 50;
        }
      } catch (error) {
        console.error("Failed to check loyalty status:", error);
      }
    }

    // Calculate max discount
    // Base: 100 per eligible game (not on sale)
    // For 1 game: base * 0.5 (stricter) * time multiplier
    // For 2+ games: base * 1.0 * time multiplier + bundle bonus (if 3+) + loyalty bonus (if verified)
    const baseDiscount = eligibleGamesCount * 100;
    const maxDiscount = Math.floor(baseDiscount * timeMultiplier * singleItemPenalty) + bundleBonus + loyaltyBonus;

    // Response variety
    const greetings = [
      "Hi boss! Unsay atoa run?",
      "Kumusta boss! Unsa imong gusto?",
      "Uy boss! Naa kay gusto?",
      "Maayong adlaw boss! Unsa akong matabang?",
    ];
    
    const rejections = [
      "Dili kaya ang {price} boss, pero makahatag kog {offer} discount.",
      "Aguy boss, dili na jud kaya ang {price}. Pero {offer} discount, pwede pa.",
      "Lugi na mi ana boss. Pero sige, {offer} nalang akong ihatag.",
    ];

    const agreements = [
      "Sige boss, deal!",
      "Ge, okay na!",
      "Cge boss, para nimo!",
      "Deal boss! Salamat!",
    ];

    // Generate item details string
    const itemsList = cartContext.items
      .map((item: any) => {
        const priceInfo = item.isOnSale
          ? `₱${item.salePrice} (ON SALE - Original: ₱${item.gamePrice})`
          : `₱${item.gamePrice} (Regular Price)`;
        return `- ${item.gameTitle}: ${priceInfo}`;
      })
      .join("\n    ");

    // Fetch past successful negotiations (RAG - Memory)
    const successfulNegotiations = await Negotiation.find({ status: "success" })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const pastDeals = successfulNegotiations
      .map((neg, index) => {
        return `Deal ${index + 1}: Sold for ₱${neg.totalAmount - neg.finalDiscount} (Discount: ₱${neg.finalDiscount})`;
      })
      .join("\n    ");

    // Fetch analytics for pattern-based learning
    let analyticsInsights = "";
    try {
      const analyticsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/analytics`,
      );
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success && analyticsData.analytics) {
          const { analytics } = analyticsData;
          analyticsInsights = `
    Success Rate: ${analytics.successRate}%
    Average Discount Given: ₱${analytics.averageDiscount}
    First Offer Acceptance: ${analytics.firstOfferAcceptanceRate}%
    
    Key Insights:
    ${analytics.insights.map((i: any) => `- ${i.message}`).join("\n    ")}`;
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }

    const FALLBACK_MODELS = [
      process.env.NEGOTIATION_MODEL || "llama-3.3-70b-versatile",
      "mixtral-8x7b-32768",
      "gemma-7b-it",
      "llama3-70b-8192",
      "gpt-4o-mini",
    ];

    /**
     * Try to get a completion using the list of fallback models.
     * Returns the first successful completion or null if all fail.
     */
    async function getCompletion(params: {
      messages: any[];
      temperature?: number;
      max_tokens?: number;
      response_format?: any;
    }) {
      for (const model of FALLBACK_MODELS) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: params.messages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens ?? 1024,
            ...(params.response_format ? { response_format: params.response_format } : {}),
          });
          console.log(`✅ Model succeeded: ${model}`);
          return { completion, model };
        } catch (error: any) {
          const code = error?.error?.code;
          console.warn(`⚠️ Model ${model} failed: ${code || error.message}`);
          // If rate limit or token limit, try next model
          if (code === "rate_limit_exceeded" || error?.status === 429) {
            continue; // try next fallback
          }
          // For other errors, also continue to next model
          continue;
        }
      }
      return null;
    }
    const systemPrompt = `You are a friendly but shrewd shopkeeper at SwitchBai, a Nintendo Switch game store in Cebu.
    You are negotiating with a customer who wants a discount on their purchase.
    
    Current Cart Details:
    - Total Items: ${cartContext.items.length}
    - Items Eligible for Discount (Not on Sale): ${eligibleGamesCount}
    - Current Total: ₱${currentTotal}
    - Max Allowed Discount Budget: ₱${maxDiscount} (This is your ABSOLUTE HARD LIMIT)
    
    Items in Cart:
    ${itemsList}

    Past Successful Deals (Use these as a reference for what is acceptable):
    ${pastDeals || "None yet."}

    Learning from Past Patterns:${analyticsInsights || "\n    Not enough data yet."}

    Dynamic Pricing Active:
    - Time: ${isPeakHour ? "Peak hours (standard pricing)" : "Off-peak hours (20% more generous)"}
    - Cart Size: ${cartContext.items.length} items ${cartContext.items.length === 1 ? "(Single item - be stricter!)" : cartContext.items.length >= 3 ? "(Bundle bonus: +₱50!)" : ""}
    - Loyalty: ${loyaltyBonus > 0 ? "Returning customer! (+₱50 bonus)" : "New customer"}
    - Strategy: ${cartContext.items.length === 1 ? "Protect margins on single items" : cartContext.items.length >= 3 ? "Reward bulk buyers" : "Standard negotiation"}
    ${loyaltyBonus > 0 ? "- **Note**: This customer has bought from us before! Show appreciation and mention the loyalty bonus if they push for more discount." : ""}
    
    Your Goal: Protect the profit margin. Give as little discount as possible while keeping the customer happy.
    
    Language & Persona:
    - **PRIMARY LANGUAGE**: Bisaya/Cebuano (Cebuano). Use it naturally.
    - You can mix in English/Tagalog if the user speaks it, but default to Bisaya.
    - Tone: Direct, friendly, street-smart ("Kanto" style but polite).
    - Call the customer "Boss", "Lods", "Bai", "Master", or "Idol".
    
    Rules:
    1. **IMPORTANT**: Games already on sale are NOT eligible for further discounts. 
       - Check the "Items in Cart" list. If the customer asks for a discount on an item marked "ON SALE", explain: "Naka-sale na na siya boss. From [Original Price] nahimo na lang [Sale Price]. Di na madala ug less."
    2. **"Nalang" Logic**: If the user says "500 nalang" (make it 500), they mean they want the **Total Price** to be 500. Calculate the discount needed (Current Total - 500).
    3. **Agreement Detection**: If the user says "Ge", "Cge", "Sige", "Oks", "K", "Deal", "Go", or "Payts", they are ACCEPTING your last offer.
       - **ACTION**: Immediately call 'apply_discount' with the agreed amount. Do NOT offer more discount. Do NOT ask "Sure ka?". Just do it.
    4. **No Misleading "Deals"**: Do NOT say "Deal" or "Sige" unless you are agreeing to the User's EXACT terms.
    5. **Counter-Offers**: If you cannot meet their price, explicitly say: "Dili kaya ang [User's Price] boss, pero makahatag kog [Your Offer] discount." (Can't do [User's Price], but I can give [Your Offer] discount).
    6. **Zero Discount**: If you can't give a discount (e.g., item is on sale), NEVER mention the number "0" or say "0 discount". Just say "Wala na koy mahatag nga discount" (I can't give any discount) or "Fixed price na jud na boss".
    7. Treat the "Max Allowed Discount Budget" as a hard ceiling.
    8. **Gradual Escalation**: Start with 30-40% of max discount. Only increase if customer pushes back.
    9. **Detect Unhappiness**: Customer is unhappy if they say: "grabe", "mahal", "taas", "ubosa", "dili", "ayaw", "kulang", etc.
    10. **Escalation Strategy**:
        - First pushback: Offer 50-60% of max discount
        - Second pushback: Offer 70-80% of max discount
        - Third pushback (1-2 items): Suggest adding more games for bundle discount
        - Fourth pushback OR customer claims previous purchase: Check loyalty
        - Final: Give max discount only if all else fails
    11. **Upselling (for 1-2 items)**: When customer rejects 70%+ of max discount, say: "Boss, kung magdugang ka ug games (3 or more), makahatag kog extra ₱50 discount! Naa kay gusto idugang?"
    12. **Loyalty Check**: If customer claims they've purchased before ("nakapalit naman ko", "customer nako", "loyal customer", etc.) OR still unhappy after upsell attempt, ask: "Unsa imong ngalan boss? Macheck nako sa sistema kung naa kay previous purchase para mahatagan tika ug extra discount." Then call check_loyalty tool.
    13. **Tool Usage**: NEVER write <function=...> in your text response. Use the actual tool call feature provided by the API.

    
    Example 1 (On Sale Item - Rejection):
    Customer: "500 nalang ni boss?"
    You: "Aguy boss, naka-sale na baya na siya. Barato na kaayo na sa ₱${currentTotal}. Di na jud madala ug less, lugi na mi."
    
    Example 2 (Agreement):
    You: "Makahatag kog ₱50 discount."
    Customer: "Ge"
    You: "Sige boss, deal!" (Call apply_discount amount=50)
    `;

    // STRATEGY AGENT: Analyze conversation and decide next action
    const strategyPrompt = `You are a negotiation strategist analyzing a conversation between a shopkeeper and customer.

Conversation History:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Context:
- Cart: ${cartContext.items.length} items
- Total: ₱${currentTotal}
- Max Discount Budget: ₱${maxDiscount}
- Items Eligible for Discount: ${eligibleGamesCount}

Your job: Analyze the conversation and decide the NEXT ACTION.

Detect:
1. Customer sentiment: "happy" | "neutral" | "unhappy" | "very_unhappy"
   - Unhappy keywords: "grabe", "mahal", "taas", "ubosa", "dili", "ayaw", "kulang", "expensive"
   - Happy keywords: "ge", "cge", "sige", "oks", "deal", "go", "payts"
2. Count customer rejections/pushbacks (how many times they expressed displeasure)
3. If customer claims previous purchase: "nakapalit", "customer nako", "loyal"

Decision Rules:
- If customer says agreement words (ge, cge, sige, deal, etc): action = "apply_discount"
- If rejections = 0 (first request): offer 30-40% of max
- If rejections = 1: offer 50-60% of max
- If rejections = 2: offer 70-80% of max
- If rejections = 3 AND cart has 1-2 items: action = "upsell"
- If customer claims previous purchase OR rejections >= 4: action = "check_loyalty"
- If rejections >= 5: offer 100% of max (final offer)

Return ONLY valid JSON:
{
  "action": "offer_discount" | "upsell" | "check_loyalty" | "apply_discount" | "hold_firm",
  "discountAmount": <number or null>,
  "customerSentiment": "happy" | "neutral" | "unhappy" | "very_unhappy",
  "rejectionCount": <number>,
  "reasoning": "<brief explanation>"
}`;

    let strategyDecision;
    try {
      const strategyResult = await getCompletion({
        messages: [{ role: "system", content: strategyPrompt }],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      if (!strategyResult) {
        // All models failed – return a polite retry message
        return NextResponse.json(
          {
            message: { role: "assistant", content: "Sorry boss, I’m a bit busy right now. Please try again in a few minutes." },
          },
          { status: 429 }
        );
      }

      const strategyCompletion = strategyResult.completion;

      strategyDecision = JSON.parse(
        strategyCompletion.choices[0].message.content || "{}",
      );
      console.log("Strategy Decision:", strategyDecision);
    } catch (error) {
      console.error("Strategy Agent error:", error);
      // Fallback to simple logic
      strategyDecision = {
        action: "offer_discount",
        discountAmount: Math.floor(maxDiscount * 0.5),
        customerSentiment: "neutral",
        rejectionCount: 0,
        reasoning: "Fallback strategy",
      };
    }

    // CONVERSATION AGENT: Generate natural response based on strategy decision
    let conversationInstruction = "";
    
    if (strategyDecision.action === "apply_discount") {
      // Customer accepted - apply the discount
      const lastOffer = strategyDecision.discountAmount || Math.floor(maxDiscount * 0.5);
      
      if (negotiation) {
        negotiation.finalDiscount = lastOffer;
        negotiation.status = "success";
        negotiation.messages.push({
          role: "assistant",
          content: `Applied ₱${lastOffer} discount`,
          timestamp: new Date(),
        });
        await negotiation.save();
      }
      
      return NextResponse.json({
        message: {
          role: "assistant",
          content: `Sige boss, deal! ₱${lastOffer} discount para nimo!`,
        },
        toolCalls: [{
          type: "function",
          function: {
            name: "apply_discount",
            arguments: JSON.stringify({ amount: lastOffer }),
          },
        }],
      });
      
    } else if (strategyDecision.action === "offer_discount") {
      conversationInstruction = `Offer exactly ₱${strategyDecision.discountAmount} discount. Be friendly but firm. Explain this is a good deal.`;
      
    } else if (strategyDecision.action === "upsell") {
      conversationInstruction = `Customer rejected your offers. Suggest adding more games (3+) to get extra ₱50 bundle discount. Ask: "Boss, kung magdugang ka ug games (3 or more), makahatag kog extra ₱50 discount! Naa kay gusto idugang?"`;
      
    } else if (strategyDecision.action === "check_loyalty") {
      conversationInstruction = `Ask for customer's name to check if they have previous purchases: "Unsa imong ngalan boss? Macheck nako sa sistema kung naa kay previous purchase para mahatagan tika ug extra discount."`;
      
    } else {
      conversationInstruction = `Hold firm at your last offer. Explain you cannot go lower without losing money.`;
    }

    const finalSystemPrompt = systemPrompt + `\n\nSTRATEGY INSTRUCTION: ${conversationInstruction}\n\nIMPORTANT: Follow the strategy instruction above. Do NOT decide discount amounts yourself.`;

    const finalResult = await getCompletion({
      messages: [{ role: "system", content: finalSystemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
      // Include tools only when we need to call check_loyalty
      ...(strategyDecision.action === "check_loyalty"
        ? {
            tools: [
              {
                type: "function",
                function: {
                  name: "apply_discount",
                  description: "Apply a discount to the cart total",
                  parameters: {
                    type: "object",
                    properties: {
                      amount: {
                        type: "number",
                        description: "The discount amount in Pesos",
                      },
                    },
                    required: ["amount"],
                  },
                },
              },
              {
                type: "function",
                function: {
                  name: "check_loyalty",
                  description: "Check if a customer has purchased from us before by their full name",
                  parameters: {
                    type: "object",
                    properties: {
                      customerName: {
                        type: "string",
                        description: "The customer's full name to check in our purchase records",
                      },
                    },
                    required: ["customerName"],
                  },
                },
              },
            ],
            tool_choice: "auto",
          }
        : {}),
    });

    if (!finalResult) {
      return NextResponse.json(
        {
          message: { role: "assistant", content: "Sorry boss, I’m a bit overloaded. Please try again shortly." },
        },
        { status: 429 }
      );
    }

    const completion = finalResult.completion;

    const responseMessage = completion.choices[0].message;
    let toolCalls = responseMessage.tool_calls;

    // Save assistant message
    if (negotiation) {
      negotiation.messages.push({
        role: "assistant",
        content: responseMessage.content || (toolCalls ? "Tool Call" : ""),
        timestamp: new Date(),
      });

      if (toolCalls) {
        const toolCall = toolCalls[0];
        if (toolCall.function.name === "apply_discount") {
          const args = JSON.parse(toolCall.function.arguments);
          negotiation.finalDiscount = args.amount;
          negotiation.status = "success";
        } else if (toolCall.function.name === "check_loyalty") {
          const args = JSON.parse(toolCall.function.arguments);
          negotiation.customerName = args.customerName;
          
          // Check if customer exists in Purchase database
          try {
            const PurchaseModel = (await import("@/models/Purchase")).default;
            const previousPurchase = await PurchaseModel.findOne({
              customerName: { $regex: new RegExp(args.customerName, "i") },
              status: { $in: ["pending", "confirmed", "completed"] },
            }).limit(1);
            
            // Add loyalty status to messages for AI context
            const loyaltyMessage = previousPurchase
              ? `SYSTEM: Customer "${args.customerName}" is a RETURNING CUSTOMER! They have purchased from us before. You can now offer up to ₱50 extra loyalty discount. Thank them for coming back and offer the extra discount!`
              : `SYSTEM: Customer "${args.customerName}" is a NEW CUSTOMER. No previous purchases found. Apologize and explain you checked but they don't have previous purchases in the system.`;
            
            // Add system message to conversation
            if (negotiation) {
              negotiation.messages.push({
                role: "system",
                content: loyaltyMessage,
                timestamp: new Date(),
              });
              await negotiation.save();
            }
            
            // Continue conversation with loyalty context
            const followUpCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
                { role: "system", content: loyaltyMessage },
              ],
              model: "llama-3.3-70b-versatile",
              temperature: 0.7,
              max_tokens: 1024,
            });
            
            const followUpMessage = followUpCompletion.choices[0].message;
            
            if (negotiation) {
              negotiation.messages.push({
                role: "assistant",
                content: followUpMessage.content || "",
                timestamp: new Date(),
              });
              await negotiation.save();
            }
            
            return NextResponse.json({
              message: followUpMessage,
            });
          } catch (error) {
            console.error("Failed to check loyalty:", error);
          }
        }
      }

      await negotiation.save();
    }

    if (toolCalls) {
      // If tool call exists, return it specifically
      return NextResponse.json({
        message: responseMessage,
        toolCalls: toolCalls,
      });
    }

    return NextResponse.json({
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error in negotiation API:", error);
    return NextResponse.json(
      { error: "Failed to process negotiation" },
      { status: 500 },
    );
  }
}
