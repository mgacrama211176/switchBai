"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import CartItem from "../items/CartItem";

export default function PurchaseCart() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <p className="text-center text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Items</h2>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <CartItem
            key={`${item.gameBarcode}-${item.variant || "withCase"}`}
            item={item}
            onRemove={removeFromCart}
            onQuantityChange={updateQuantity}
          />
        ))}
      </div>
    </div>
  );
}
