import { RetrievedGame, RetrievedFAQ } from "./retriever";

/**
 * Format retrieved context for AI prompt
 */
export function formatContextForPrompt(
  games: RetrievedGame[],
  faqs: RetrievedFAQ[],
): string {
  let context = "";

  // Add FAQs section
  if (faqs.length > 0) {
    context += "Based on our knowledge base:\n\n";
    faqs.forEach((faq, index) => {
      context += `${index + 1}. Q: ${faq.question}\n`;
      context += `   A: ${faq.answer}\n\n`;
    });
  }

  // Add games section
  if (games.length > 0) {
    context += "Available games that might be relevant:\n\n";
    games.forEach((game, index) => {
      const platform = Array.isArray(game.gamePlatform)
        ? game.gamePlatform.join(", ")
        : game.gamePlatform;
      const price =
        game.isOnSale && game.salePrice
          ? `₱${game.salePrice} (on sale, was ₱${game.gamePrice})`
          : `₱${game.gamePrice}`;
      const stockStatus =
        game.gameAvailableStocks > 0
          ? `In stock (${game.gameAvailableStocks} available)`
          : "Out of stock";

      context += `${index + 1}. ${game.gameTitle}\n`;
      context += `   Category: ${game.gameCategory}\n`;
      context += `   Platform: ${platform}\n`;
      context += `   Price: ${price}\n`;
      context += `   Status: ${stockStatus}\n`;
      context += `   Description: ${game.gameDescription.substring(0, 150)}${game.gameDescription.length > 150 ? "..." : ""}\n\n`;
    });
  }

  // If no context found
  if (context === "") {
    context =
      "No specific information found in our knowledge base or game catalog for this query.";
  }

  return context.trim();
}

/**
 * Format context more concisely for system prompt
 */
export function formatContextConcise(
  games: RetrievedGame[],
  faqs: RetrievedFAQ[],
): string {
  const parts: string[] = [];

  if (faqs.length > 0) {
    parts.push(
      `Relevant FAQs:\n${faqs.map((f) => `- ${f.question}: ${f.answer}`).join("\n")}`,
    );
  }

  if (games.length > 0) {
    parts.push(
      `Relevant Games:\n${games
        .map((g) => {
          const price =
            g.isOnSale && g.salePrice
              ? `₱${g.salePrice} (sale)`
              : `₱${g.gamePrice}`;
          return `- ${g.gameTitle} (${g.gameCategory}) - ${price}`;
        })
        .join("\n")}`,
    );
  }

  return parts.length > 0
    ? parts.join("\n\n")
    : "No relevant information found.";
}
