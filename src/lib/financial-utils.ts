/**
 * Financial calculation utilities
 */

export function calculateGrossProfit(revenue: number, costs: number): number {
  return revenue - costs;
}

export function calculateProfitMargin(
  revenue: number,
  profit: number,
): number {
  if (revenue === 0) return 0;
  return (profit / revenue) * 100;
}

export function calculateProjectedRevenue(
  historicalData: Array<{ revenue: number; date: string }>,
  period: "day" | "week" | "month" | "bi-annual" | "annual",
): number {
  if (historicalData.length === 0) return 0;

  // Calculate average daily revenue
  const totalRevenue = historicalData.reduce(
    (sum, data) => sum + data.revenue,
    0,
  );
  const days = historicalData.length;

  if (days === 0) return 0;

  const averageDailyRevenue = totalRevenue / days;

  // Project based on period
  switch (period) {
    case "day":
      return averageDailyRevenue;
    case "week":
      return averageDailyRevenue * 7;
    case "month":
      return averageDailyRevenue * 30;
    case "bi-annual":
      return averageDailyRevenue * 180;
    case "annual":
      return averageDailyRevenue * 365;
    default:
      return 0;
  }
}

export function calculateGrowthRate(
  currentPeriod: number,
  previousPeriod: number,
): number {
  if (previousPeriod === 0) {
    return currentPeriod > 0 ? 100 : 0;
  }
  return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getStatusColor(
  profit: number,
): "green" | "red" | "yellow" {
  if (profit > 0) return "green";
  if (profit < 0) return "red";
  return "yellow";
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function getTrendIndicator(
  current: number,
  previous: number,
): "up" | "down" | "neutral" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

