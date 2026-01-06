import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import {
  calculateTradeCashDifference,
  calculateGamesValue,
} from "@/lib/trade-utils";

export function useTradeSummary() {
  const { cart } = useCart();

  return useMemo(() => {
    if (cart.type !== "trade") {
      return {
        totalValueGiven: 0,
        totalValueReceived: 0,
        cashDifference: 0,
        tradeFee: 0,
        tradeType: "even" as const,
      };
    }

    const valueGiven = calculateGamesValue(cart.gamesGiven || []);
    const valueReceived = calculateGamesValue(cart.items);
    const { cashDifference, tradeFee, tradeType } =
      calculateTradeCashDifference(valueGiven, valueReceived);

    return {
      totalValueGiven: valueGiven,
      totalValueReceived: valueReceived,
      cashDifference,
      tradeFee,
      tradeType,
    };
  }, [cart.type, cart.items, cart.gamesGiven]);
}
