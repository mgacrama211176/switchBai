"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/CartContext";
import { usePurchaseSummary } from "@/hooks/cart/usePurchaseSummary";
import { useRentalSummary } from "@/hooks/cart/useRentalSummary";
import { useTradeSummary } from "@/hooks/cart/useTradeSummary";

// Dynamic imports for code splitting
const PurchaseSummary = dynamic(() => import("./PurchaseSummary"), {
  ssr: false,
});
const RentalSummary = dynamic(() => import("./RentalSummary"), { ssr: false });
const TradeSummarySidebar = dynamic(() => import("./TradeSummarySidebar"), {
  ssr: false,
});

interface OrderSummaryProps {
  rentalDays: number;
  onRemove: (barcode: string) => void;
  onQuantityChange: (barcode: string, quantity: number) => void;
  onNegotiateClick: () => void;
}

export default function OrderSummary({
  rentalDays,
  onRemove,
  onQuantityChange,
  onNegotiateClick,
}: OrderSummaryProps) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    negotiatedDiscount,
    isHydrated,
  } = useCart();
  const purchaseSummary = usePurchaseSummary();
  const rentalSummary = useRentalSummary({ rentalDays });
  const tradeSummary = useTradeSummary();

  if (cart.type === "trade") {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <TradeSummarySidebar
            gamesGiven={cart.gamesGiven || []}
            gamesReceived={cart.items}
            totalValueGiven={tradeSummary.totalValueGiven}
            totalValueReceived={tradeSummary.totalValueReceived}
            cashDifference={tradeSummary.cashDifference}
            tradeFee={tradeSummary.tradeFee}
          />
        </Suspense>
      </div>
    );
  }

  if (cart.type === "purchase") {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <PurchaseSummary
            items={cart.items}
            subtotal={purchaseSummary.subtotal}
            totalAmount={purchaseSummary.totalAmount}
            totalQuantity={purchaseSummary.totalQuantity}
            deliveryFee={purchaseSummary.deliveryFee}
            negotiatedDiscount={negotiatedDiscount}
            isHydrated={isHydrated}
            onRemove={onRemove || removeFromCart}
            onQuantityChange={onQuantityChange || updateQuantity}
            onNegotiateClick={onNegotiateClick}
          />
        </Suspense>
      </div>
    );
  }

  // Rental
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <RentalSummary
          items={rentalSummary.items}
          totalRentalFee={rentalSummary.totalRentalFee}
          totalDeposit={rentalSummary.totalDeposit}
          totalDue={rentalSummary.totalDue}
          rentalDays={rentalDays}
        />
      </Suspense>
    </div>
  );
}
