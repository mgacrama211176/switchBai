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
 * - Always charges ₱200 trading fee (since prices are based on pricing database)
 * - Cash difference = (valueReceived - valueGiven) + ₱200
 * - Customer always pays at least ₱200 (the trading fee)
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
  const tradeFee = 200;

  // Calculate cash difference: (valueReceived - valueGiven) + ₱200
  // Ensure customer always pays at least ₱200 (the trading fee)
  const cashDifference = Math.max(200, rawDifference + tradeFee);

  // Determine trade type for informational purposes
  let tradeType: "even" | "trade_up" | "trade_down";
  if (rawDifference === 0) {
    tradeType = "even";
  } else if (rawDifference > 0) {
    tradeType = "trade_up";
  } else {
    tradeType = "trade_down";
  }

  return {
    cashDifference,
    tradeFee,
    tradeType,
  };
}
