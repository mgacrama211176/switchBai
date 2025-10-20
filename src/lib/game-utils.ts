export function formatPrice(price: number): string {
  return `₱${price.toLocaleString()}`;
}

export interface PlatformInfo {
  display: string;
  color: string;
  icon: string;
}

export function getPlatformInfo(platform: string | string[]): PlatformInfo {
  const platforms = Array.isArray(platform) ? platform : [platform];

  if (platforms.length === 1) {
    if (platforms[0] === "Nintendo Switch") {
      return {
        display: "Nintendo Switch",
        color: "bg-gradient-to-r from-red-500 to-blue-500 text-white",
        icon: "🎮",
      };
    } else if (platforms[0] === "Nintendo Switch 2") {
      return {
        display: "Switch 2",
        color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        icon: "✨",
      };
    }
  }

  if (
    platforms.includes("Nintendo Switch") &&
    platforms.includes("Nintendo Switch 2")
  ) {
    return {
      display: "Switch & Switch 2",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
      icon: "🎮✨",
    };
  }

  return {
    display: platforms.join(", "),
    color: "bg-gray-100 text-gray-700",
    icon: "🎮",
  };
}

export interface StockUrgency {
  text: string;
  color: string;
  bgColor: string;
}

export function getStockUrgency(stock: number): StockUrgency {
  if (stock === 0) {
    return {
      text: "Out of Stock",
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
    };
  } else if (stock <= 3) {
    return {
      text: `Only ${stock} left!`,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
    };
  } else if (stock <= 8) {
    return {
      text: `${stock} in stock`,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
    };
  } else {
    return {
      text: `${stock} available`,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
    };
  }
}

export interface RentalPricing {
  weeklyRate: number;
  twoWeeks: number;
  oneMonth: number;
  deposit: number;
}

export function calculateRentalPrice(gamePrice: number): RentalPricing {
  // Weekly rates based on game price
  let weeklyRate: number;

  if (gamePrice === 1200) {
    weeklyRate = 300;
  } else if (gamePrice === 1500) {
    weeklyRate = 350;
  } else if (gamePrice === 1900) {
    weeklyRate = 400;
  } else {
    // Default fallback for any other price
    weeklyRate = Math.round(gamePrice * 0.25);
  }

  const twoWeeks = weeklyRate * 2;
  const oneMonth = weeklyRate * 4;
  const deposit = gamePrice - weeklyRate;

  return {
    weeklyRate,
    twoWeeks,
    oneMonth,
    deposit,
  };
}

export interface DepositBreakdown {
  rentalCost: number;
  deposit: number;
  upfrontTotal: number;
  refundAmount: number;
}

export function calculateDepositBreakdown(
  gamePrice: number,
  weeks: number
): DepositBreakdown {
  const pricing = calculateRentalPrice(gamePrice);
  const rentalCost = pricing.weeklyRate * weeks;
  const deposit = gamePrice - pricing.weeklyRate;
  const upfrontTotal = rentalCost + deposit;
  const refundAmount = deposit;

  return {
    rentalCost,
    deposit,
    upfrontTotal,
    refundAmount,
  };
}
