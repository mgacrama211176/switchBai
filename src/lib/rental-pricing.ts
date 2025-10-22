/**
 * Dynamic Rental Pricing System for SwitchBai
 *
 * Calculates rental costs based on game value tier and rental duration.
 * Automatically applies the best rate for any given number of days.
 */

export interface RentalPricingConfig {
  gamePrice: number;
  dailyRate: number;
  weeklyRate: number;
  biWeeklyRate: number;
  monthlyRate: number;
}

export interface RentalCalculation {
  rentalFee: number;
  deposit: number;
  totalDue: number;
  appliedPlan: string;
  promoMessage: string;
  gameValue: number;
  days: number;
}

// Pricing configurations for each game tier
const PRICING_CONFIGS: Record<number, RentalPricingConfig> = {
  1200: {
    gamePrice: 1200,
    dailyRate: 60,
    weeklyRate: 300,
    biWeeklyRate: 550,
    monthlyRate: 950,
  },
  1500: {
    gamePrice: 1500,
    dailyRate: 70,
    weeklyRate: 350,
    biWeeklyRate: 650,
    monthlyRate: 1100,
  },
  1900: {
    gamePrice: 1900,
    dailyRate: 80,
    weeklyRate: 400,
    biWeeklyRate: 750,
    monthlyRate: 1300,
  },
};

// Note: Deposit is now calculated as Game Price - Rental Fee

/**
 * Get the pricing configuration for a given game price
 */
export function getRentalPricingConfig(gamePrice: number): RentalPricingConfig {
  // Find the closest tier (round to nearest tier)
  const tiers = Object.keys(PRICING_CONFIGS)
    .map(Number)
    .sort((a, b) => a - b);

  // If exact match, return that config
  if (PRICING_CONFIGS[gamePrice]) {
    return PRICING_CONFIGS[gamePrice];
  }

  // Find the closest tier
  const closestTier = tiers.reduce((prev, curr) =>
    Math.abs(curr - gamePrice) < Math.abs(prev - gamePrice) ? curr : prev,
  );

  return PRICING_CONFIGS[closestTier];
}

/**
 * Round amount to the nearest ₱10
 */
export function roundToNearest10(amount: number): number {
  return Math.round(amount / 10) * 10;
}

/**
 * Determine the applied plan name based on days
 */
export function determineAppliedPlan(days: number): string {
  if (days >= 1 && days <= 6) {
    return "Daily";
  } else if (days === 7) {
    return "Weekly";
  } else if (days >= 8 && days <= 13) {
    return "Weekly (Pro-rated)";
  } else if (days === 14) {
    return "Bi-Weekly";
  } else if (days >= 15 && days <= 29) {
    return "Bi-Weekly (Pro-rated)";
  } else if (days === 30) {
    return "Monthly";
  }

  return "Daily";
}

/**
 * Calculate rental price based on game price and number of days
 */
export function calculateRentalPrice(
  gamePrice: number,
  days: number,
): RentalCalculation {
  if (days < 1) {
    throw new Error("Rental duration must be at least 1 day");
  }

  if (days > 30) {
    throw new Error("Maximum rental duration is 30 days");
  }

  const config = getRentalPricingConfig(gamePrice);
  let rentalFee = 0;

  // Apply calculation logic based on duration
  if (days >= 1 && days <= 6) {
    // Daily rate for 1-6 days
    rentalFee = config.dailyRate * days;
  } else if (days === 7) {
    // Weekly flat rate for exactly 7 days
    rentalFee = config.weeklyRate;
  } else if (days >= 8 && days <= 13) {
    // Pro-rated weekly rate for 8-13 days
    rentalFee = (config.weeklyRate / 7) * days;
  } else if (days === 14) {
    // Bi-weekly flat rate for exactly 14 days
    rentalFee = config.biWeeklyRate;
  } else if (days >= 15 && days <= 29) {
    // Pro-rated bi-weekly rate for 15-29 days
    rentalFee = (config.biWeeklyRate / 14) * days;
  } else if (days === 30) {
    // Monthly flat rate for exactly 30 days
    rentalFee = config.monthlyRate;
  }

  // Round to nearest ₱10
  rentalFee = roundToNearest10(rentalFee);

  // New deposit formula: Game Price - Rental Fee
  const deposit = gamePrice - rentalFee;
  const totalDue = gamePrice; // Always equals game price
  const appliedPlan = determineAppliedPlan(days);

  return {
    rentalFee,
    deposit,
    totalDue,
    appliedPlan,
    promoMessage: "Promo automatically applied — best rate given!",
    gameValue: config.gamePrice,
    days,
  };
}

/**
 * Get available game tiers for selection
 */
export function getAvailableGameTiers(): Array<{
  value: number;
  label: string;
  config: RentalPricingConfig;
}> {
  return Object.values(PRICING_CONFIGS).map((config) => ({
    value: config.gamePrice,
    label: `₱${config.gamePrice.toLocaleString()} Games`,
    config,
  }));
}

/**
 * Format price for display
 */
export function formatRentalPrice(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

/**
 * Get rental duration options for UI
 */
export function getRentalDurationOptions(): Array<{
  value: number;
  label: string;
  popular?: boolean;
}> {
  return [
    { value: 1, label: "1 day" },
    { value: 3, label: "3 days" },
    { value: 7, label: "1 week", popular: true },
    { value: 14, label: "2 weeks", popular: true },
    { value: 30, label: "1 month" },
  ];
}
