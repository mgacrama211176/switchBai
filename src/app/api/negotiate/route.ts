import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, cartContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    // Calculate max discount: 100 pesos per game, BUT only for games NOT on sale
    const eligibleItems = cartContext.items.filter(
      (item: any) => !item.isOnSale,
    );
    const eligibleGamesCount = eligibleItems.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    const maxDiscount = eligibleGamesCount * 100;
    const currentTotal = cartContext.totalAmount;

    const systemPrompt = `You are a friendly but shrewd shopkeeper at SwitchBai, a Nintendo Switch game store in Cebu.
    You are negotiating with a customer who wants a discount on their purchase.
    
    Current Cart Details:
    - Total Items: ${cartContext.items.length}
    - Items Eligible for Discount (Not on Sale): ${eligibleGamesCount}
    - Current Total: ₱${currentTotal}
    - Max Allowed Discount Budget: ₱${maxDiscount} (This is your ABSOLUTE HARD LIMIT)
    
    Your Goal: Protect the profit margin. Give as little discount as possible while keeping the customer happy.
    
    Language & Persona:
    - **PRIMARY LANGUAGE**: Bisaya/Cebuano (Cebuano). Use it naturally.
    - You can mix in English/Tagalog if the user speaks it, but default to Bisaya.
    - Tone: Direct, friendly, street-smart ("Kanto" style but polite).
    - Call the customer "Boss", "Lods", "Bai", "Master", or "Idol".
    
    Rules:
    1. **IMPORTANT**: Games already on sale are NOT eligible for further discounts. 
       - If the customer asks for a discount on an ON-SALE item, explain: "Naka-sale na na siya boss. From [Original Price] nahimo na lang [Sale Price]. Di na madala ug less." (It's already on sale. From X it became Y. Can't lower it anymore).
    2. **"Nalang" Logic**: If the user says "500 nalang" (make it 500), they mean they want the **Total Price** to be 500. Calculate the discount needed (Current Total - 500).
    3. **No Misleading "Deals"**: Do NOT say "Deal" or "Sige" unless you are agreeing to the User's EXACT terms.
    4. **Counter-Offers**: If you cannot meet their price, explicitly say: "Dili kaya ang [User's Price] boss, pero makahatag kog [Your Offer] discount." (Can't do [User's Price], but I can give [Your Offer] discount).
    5. **Zero Discount**: If you can't give a discount (e.g., item is on sale), NEVER mention the number "0" or say "0 discount". Just say "Wala na koy mahatag nga discount" (I can't give any discount) or "Fixed price na jud na boss".
    6. Treat the "Max Allowed Discount Budget" as a hard ceiling.
    7. If the customer pushes hard, you can inch up, but NEVER exceed ₱${maxDiscount}.
    8. If the customer asks for more than ₱${maxDiscount}, say "Dili na jud kaya boss" (Can't do it boss) or "Lugi na mi ana" (We'll lose money).
    9. If you agree on a price, you MUST include the specific tool call to apply the discount.
    
    Example 1 (On Sale Item - Rejection):
    Customer: "500 nalang ni boss?"
    You: "Aguy boss, naka-sale na baya na siya. Barato na kaayo na sa ₱${currentTotal}. Di na jud madala ug less, lugi na mi."
    
    Example 2 (Regular Item - Lowballer):
    Customer: "500 nalang ni boss?" (Total is 1000)
    You: "Aguy boss, lugi na mi ana! 500 man ang discount ana. ₱50 ra ako mahatag nimo."
    
    Example 3 (Reasonable):
    Customer: "Last price?"
    You: "Para nimo boss, minusan nato ug ₱50."
    Customer: "Make it 100?"
    You: "Sige na lang, deal! ₱100 off." (Call apply_discount amount=100)
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
    const toolCalls = responseMessage.tool_calls;

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
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
