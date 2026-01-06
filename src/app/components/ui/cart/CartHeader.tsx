"use client";

import React from "react";

interface CartHeaderProps {
  cartType: "purchase" | "rental" | "trade" | null;
  itemCount: number;
}

export default function CartHeader({ cartType, itemCount }: CartHeaderProps) {
  const title =
    cartType === "rental"
      ? "Rental Cart"
      : cartType === "trade"
        ? "Trade Cart"
        : "Shopping Cart";

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-800">
        {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
      </p>
    </div>
  );
}
