/**
 * Generate a unique purchase reference number
 * Format: BUY-YYYYMMDD-XXX
 * Example: BUY-20240115-001
 *
 * Note: The sequential number (XXX) will be determined by the API
 * by querying existing purchases for the same date.
 */
export function generatePurchaseReference(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate a temporary reference - the API will ensure sequential numbering
  // by checking existing purchases for the same date
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `BUY-${year}${month}${day}-${random}`;
}

/**
 * Calculate financial metrics for a purchase
 */
export function calculatePurchaseMetrics(
  games: Array<{ sellingPrice: number; quantity: number }>,
  totalCost: number,
): {
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  profitMargin: number;
} {
  const totalExpectedRevenue = games.reduce(
    (sum, game) => sum + game.sellingPrice * game.quantity,
    0,
  );

  const totalExpectedProfit = totalExpectedRevenue - totalCost;

  const profitMargin =
    totalExpectedRevenue > 0
      ? (totalExpectedProfit / totalExpectedRevenue) * 100
      : 0;

  return {
    totalExpectedRevenue,
    totalExpectedProfit,
    profitMargin,
  };
}
