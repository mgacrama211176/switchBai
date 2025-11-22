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

    // Calculate max discount: 100 pesos per game, BUT only for games NOT on sale
    const eligibleItems = cartContext.items.filter(
      (item: any) => !item.isOnSale,
    );
    const eligibleGamesCount = eligibleItems.length;

    const currentTotal = cartContext.totalAmount;
    const maxDiscount = eligibleGamesCount * 100; // Max 100 per eligible game

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
    8. If the customer pushes hard, you can inch up, but NEVER exceed ₱${maxDiscount}.
    9. If the customer asks for more than ₱${maxDiscount}, say "Dili na jud kaya boss" (Can't do it boss) or "Lugi na mi ana" (We'll lose money).
    10. **Tool Usage**: NEVER write <function=...> in your text response. Use the actual tool call feature provided by the API.
    
    Example 1 (On Sale Item - Rejection):
    Customer: "500 nalang ni boss?"
    You: "Aguy boss, naka-sale na baya na siya. Barato na kaayo na sa ₱${currentTotal}. Di na jud madala ug less, lugi na mi."
    
    Example 2 (Agreement):
    You: "Makahatag kog ₱50 discount."
    Customer: "Ge"
    You: "Sige boss, deal!" (Call apply_discount amount=50)
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
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
      ],
      tool_choice: "auto",
    });

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
