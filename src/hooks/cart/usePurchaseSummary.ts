import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { calculateTotal } from "@/lib/purchase-form-utils";

export function usePurchaseSummary() {
  const { cart, negotiatedDiscount } = useCart();

  return useMemo(() => {
    if (cart.type !== "purchase" || cart.items.length === 0) {
      return { deliveryFee: 0, subtotal: 0, totalAmount: 0, totalQuantity: 0 };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
      return sum + price * item.quantity;
    }, 0);

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Delivery fee is set to 0 by default - will be added manually after customer discussion
    const deliveryFee = 0;

    // Calculate total with discount
    const totalBeforeDiscount = calculateTotal(subtotal, deliveryFee);
    const totalAmount = Math.max(
      0,
      totalBeforeDiscount - (negotiatedDiscount || 0),
    );

    return { deliveryFee, subtotal, totalAmount, totalQuantity };
  }, [cart.type, cart.items, negotiatedDiscount]);
}
