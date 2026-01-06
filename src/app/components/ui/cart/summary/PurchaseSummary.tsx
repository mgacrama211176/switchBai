"use client";

import React from "react";
import { CartItem as CartItemType } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/purchase-form-utils";
import { calculateSavings } from "@/app/components/ui/home/game-utils";
import CartItem from "../items/CartItem";
import { HiChatAlt2 } from "react-icons/hi";

interface PurchaseSummaryProps {
  items: CartItemType[];
  subtotal: number;
  totalAmount: number;
  totalQuantity: number;
  deliveryFee: number;
  negotiatedDiscount: number;
  isHydrated: boolean;
  onRemove: (barcode: string) => void;
  onQuantityChange: (barcode: string, quantity: number) => void;
  onNegotiateClick: () => void;
}

export default function PurchaseSummary({
  items,
  subtotal,
  totalAmount,
  totalQuantity,
  deliveryFee,
  negotiatedDiscount,
  isHydrated,
  onRemove,
  onQuantityChange,
  onNegotiateClick,
}: PurchaseSummaryProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={`${item.gameBarcode}-${item.variant || "withCase"}`}
          item={item}
          onRemove={onRemove}
          onQuantityChange={onQuantityChange}
        />
      ))}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Items:</span>
          <span className="font-semibold">
            {items.length} unique, {totalQuantity} total
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee:</span>
          <span className="font-semibold text-gray-500">₱0</span>
        </div>

        {isHydrated && negotiatedDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold">
            <span>Negotiated Discount:</span>
            <span>-{formatPrice(negotiatedDiscount)}</span>
          </div>
        )}

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between mb-4">
            <span className="text-base font-bold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-funBlue">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <button
            onClick={onNegotiateClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg mb-2"
          >
            <HiChatAlt2 className="w-5 h-5" />
            Negotiate Price
          </button>
          <p className="text-xs text-center text-gray-500">
            Talk to our AI shopkeeper for a better deal!
          </p>
        </div>
      </div>
    </div>
  );
}
