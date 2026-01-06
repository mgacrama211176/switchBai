"use client";

import React from "react";
import { CartItem as CartItemType } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/purchase-form-utils";
import { calculateSavings } from "@/app/components/ui/home/game-utils";
import { HiTrash, HiMinus, HiPlus } from "react-icons/hi";
import CartItemImage from "./CartItemImage";

interface CartItemProps {
  item: CartItemType;
  onRemove: (barcode: string) => void;
  onQuantityChange: (barcode: string, quantity: number) => void;
}

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
  const price =
    item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
  const savings = calculateSavings(price, item.gameBarcode, {
    isOnSale: item.isOnSale,
    salePrice: item.salePrice,
    gamePrice: item.gamePrice,
  });

  const saleBadge =
    item.isOnSale && savings.percentage > 0 ? (
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1 py-0.5 rounded-full text-[9px] font-bold shadow-lg">
        🏷️
      </div>
    ) : null;

  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
      <CartItemImage
        src={item.gameImageURL}
        alt={item.gameTitle}
        badge={saleBadge}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 pr-2">
            {item.gameTitle}
          </h3>
          <button
            onClick={() => onRemove(item.gameBarcode)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 -mr-1"
            title="Remove item"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mb-2 font-mono">
          {item.gameBarcode}
        </p>

        {item.variant === "cartridgeOnly" && (
          <span className="inline-block text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full mb-2">
            Cartridge Only
          </span>
        )}

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() =>
                onQuantityChange(item.gameBarcode, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <HiMinus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onQuantityChange(item.gameBarcode, item.quantity + 1)
              }
              disabled={item.quantity >= item.maxStock}
              className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <HiPlus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            {item.isOnSale && item.salePrice ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(item.gamePrice * item.quantity)}
                </span>
                <span className="text-sm font-semibold text-funBlue">
                  {formatPrice(price * item.quantity)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-funBlue">
                {formatPrice(price * item.quantity)}
              </span>
            )}
          </div>
        </div>

        {item.isOnSale && savings.percentage > 0 && (
          <p className="text-[10px] font-semibold text-green-600 text-right mt-1">
            Save ₱{(savings.savings * item.quantity).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
