/**
 * Generate a unique trade reference number
 * Format: TRADE-YYYYMMDD-XXXX
 * Example: TRADE-20250122-1A2B
 */
export function generateTradeReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate 4 random alphanumeric characters
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `TRADE-${year}${month}${day}-${randomPart}`;
}

/**
 * Calculate total value of games
 */
export function calculateGamesValue(
  games: Array<{ gamePrice: number; quantity: number }>,
): number {
  return games.reduce((sum, game) => sum + game.gamePrice * game.quantity, 0);
}

/**
 * Calculate trade cash difference and fee
 * Returns: { cashDifference, tradeFee, tradeType }
 *
 * Rules:
 * - Even trade (values equal): ₱200 trade fee
 * - Trade up (receives more): Customer pays the difference
 * - Trade down (gives more): Customer pays ₱0 (no compensation)
 */
export function calculateTradeCashDifference(
  valueGiven: number,
  valueReceived: number,
): {
  cashDifference: number;
  tradeFee: number;
  tradeType: "even" | "trade_up" | "trade_down";
} {
  const rawDifference = valueReceived - valueGiven;

  if (rawDifference === 0) {
    // Even trade: ₱200 trade fee
    return {
      cashDifference: 200,
      tradeFee: 200,
      tradeType: "even",
    };
  } else if (rawDifference > 0) {
    // Trade up: Customer pays the difference
    return {
      cashDifference: rawDifference,
      tradeFee: 0,
      tradeType: "trade_up",
    };
  } else {
    // Trade down: Customer pays ₱0 (no cash back)
    return {
      cashDifference: 0,
      tradeFee: 0,
      tradeType: "trade_down",
    };
  }
}
