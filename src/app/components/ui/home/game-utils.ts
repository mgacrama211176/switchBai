// Helper functions that are used in both HeroSection and ComparisonModal
export function formatPrice(price: number): string {
  return `₱${price.toLocaleString()}`;
}

export function calculateSavings(
  price: number,
  gameBarcode: string,
  game?: { isOnSale?: boolean; salePrice?: number; gamePrice?: number },
) {
  // If game is on sale, use actual sale data
  if (game?.isOnSale && game.salePrice && game.gamePrice) {
    const originalPrice = game.gamePrice;
    const salePrice = game.salePrice;
    const savings = originalPrice - salePrice;
    const savingsPercentage = Math.round((savings / originalPrice) * 100);
    return {
      original: originalPrice,
      savings,
      percentage: savingsPercentage,
    };
  }

  // Fallback to default 10% calculation
  const savingsPercentage = 10;
  const originalPrice = Math.round(price / (1 - savingsPercentage / 100));
  const savings = originalPrice - price;
  return { original: originalPrice, savings, percentage: savingsPercentage };
}

export function getPlatformInfo(platform: string | string[]) {
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

export function getStockUrgency(stock: number) {
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
