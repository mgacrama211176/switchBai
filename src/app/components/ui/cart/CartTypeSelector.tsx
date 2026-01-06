"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";

export default function CartTypeSelector() {
  const { cart, setCartType } = useCart();

  if (!cart.type) return null;

  const handleTypeChange = (newType: "purchase" | "rental" | "trade") => {
    if (confirm("Changing cart type will clear your cart. Are you sure?")) {
      setCartType(newType);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Cart Type:{" "}
            <span className="text-funBlue">
              {cart.type === "purchase"
                ? "Purchase"
                : cart.type === "rental"
                  ? "Rental"
                  : "Trade"}
            </span>
          </h2>
          <p className="text-sm text-gray-600">
            {cart.type === "purchase"
              ? "You're purchasing these games"
              : cart.type === "rental"
                ? "You're renting these games"
                : "You're trading games"}
          </p>
        </div>
        <div className="flex gap-2">
          {cart.type !== "purchase" && (
            <button
              onClick={() => handleTypeChange("purchase")}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Switch to Purchase
            </button>
          )}
          {cart.type !== "rental" && (
            <button
              onClick={() => handleTypeChange("rental")}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Switch to Rental
            </button>
          )}
          {cart.type !== "trade" && (
            <button
              onClick={() => handleTypeChange("trade")}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
            >
              Switch to Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
