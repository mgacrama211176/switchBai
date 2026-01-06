import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { calculateRentalPrice } from "@/lib/rental-pricing";

interface RentalDates {
  rentalDays: number;
}

export function useRentalSummary(rentalDates: RentalDates) {
  const { cart } = useCart();

  return useMemo(() => {
    if (
      cart.type !== "rental" ||
      cart.items.length === 0 ||
      rentalDates.rentalDays === 0
    ) {
      return { totalRentalFee: 0, totalDeposit: 0, totalDue: 0, items: [] };
    }

    const items = cart.items.map((item) => {
      const price =
        item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
      const calculation = calculateRentalPrice(price, rentalDates.rentalDays);
      return {
        ...item,
        rentalFee: calculation.rentalFee * item.quantity,
        deposit: calculation.deposit * item.quantity,
        totalDue: calculation.totalDue * item.quantity,
        calculation,
      };
    });

    const totalRentalFee = items.reduce((sum, item) => sum + item.rentalFee, 0);
    const totalDeposit = items.reduce((sum, item) => sum + item.deposit, 0);
    const totalDue = items.reduce((sum, item) => sum + item.totalDue, 0);

    return { totalRentalFee, totalDeposit, totalDue, items };
  }, [cart.type, cart.items, rentalDates.rentalDays]);
}
