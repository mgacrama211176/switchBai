/**
 * Financial calculation utilities
 */

export function calculateGrossProfit(revenue: number, costs: number): number {
  return revenue - costs;
}

export function calculateProfitMargin(revenue: number, profit: number): number {
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

export function getStatusColor(profit: number): "green" | "red" | "yellow" {
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

/**
 * Price update profit calculation utilities
 */

export interface ProfitMetrics {
  profit: number;
  profitMargin: number;
  isBelowCost: boolean;
  isNegativeMargin: boolean;
  isLowMargin: boolean;
  status: "safe" | "warning" | "danger";
}

const MINIMUM_MARGIN_THRESHOLD = 10; // 10% minimum margin

/**
 * Calculate profit metrics for a price update
 */
export function calculateProfitMetrics(
  newPrice: number,
  costPrice: number,
): ProfitMetrics {
  const profit = newPrice - costPrice;
  const profitMargin = newPrice > 0 ? (profit / newPrice) * 100 : 0;
  const isBelowCost = newPrice < costPrice;
  const isNegativeMargin = profit < 0;
  const isLowMargin = profitMargin < MINIMUM_MARGIN_THRESHOLD;

  let status: "safe" | "warning" | "danger" = "safe";
  if (isBelowCost || isNegativeMargin) {
    status = "danger";
  } else if (isLowMargin) {
    status = "warning";
  }

  return {
    profit,
    profitMargin,
    isBelowCost,
    isNegativeMargin,
    isLowMargin,
    status,
  };
}

/**
 * Get warning message for price update
 */
export function getPriceUpdateWarning(
  metrics: ProfitMetrics,
  currentPrice: number,
  newPrice: number,
  costPrice: number,
): string | null {
  if (metrics.isBelowCost) {
    return `Warning: New price (${formatCurrency(newPrice)}) is below cost price (${formatCurrency(costPrice)}). You will lose money on each sale.`;
  }
  if (metrics.isNegativeMargin) {
    return `Warning: This price change results in a negative profit margin. You will lose money.`;
  }
  if (metrics.isLowMargin) {
    return `Warning: Profit margin (${formatPercentage(metrics.profitMargin)}) is below the minimum threshold of ${MINIMUM_MARGIN_THRESHOLD}%.`;
  }
  return null;
}

/**
 * Calculate price change impact
 */
export function calculatePriceChangeImpact(
  currentPrice: number,
  newPrice: number,
  stock: number,
): {
  priceDifference: number;
  totalRevenueChange: number;
  priceChangePercentage: number;
} {
  const priceDifference = newPrice - currentPrice;
  const totalRevenueChange = priceDifference * stock;
  const priceChangePercentage =
    currentPrice > 0 ? (priceDifference / currentPrice) * 100 : 0;

  return {
    priceDifference,
    totalRevenueChange,
    priceChangePercentage,
  };
}
