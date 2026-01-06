"use client";

import React from "react";
import { CartItem } from "@/contexts/CartContext";
import { Game } from "@/app/types/games";
import SafeImage from "@/app/components/ui/SafeImage";
import { HiTrash, HiMinus, HiPlus } from "react-icons/hi";

interface TradeCartItemProps {
  item: CartItem;
  side: "given" | "received";
  game?: Game;
  onRemove: (barcode: string, side: "given" | "received") => void;
  onQuantityChange: (
    barcode: string,
    quantity: number,
    side: "given" | "received",
  ) => void;
  onVariantChange?: (
    item: CartItem,
    newVariant: "withCase" | "cartridgeOnly",
  ) => void;
}

export default function TradeCartItem({
  item,
  side,
  game,
  onRemove,
  onQuantityChange,
  onVariantChange,
}: TradeCartItemProps) {
  const lineTotal = item.gamePrice * item.quantity;
  const isGiven = side === "given";
  const borderColor = isGiven
    ? "border-orange-200 bg-orange-50/30 hover:border-orange-300"
    : item.tradable === false
      ? "border-red-300 bg-red-50"
      : "border-green-200 bg-green-50/30 hover:border-green-300";
  const quantityButtonClass = isGiven
    ? "p-1.5 hover:bg-orange-100 rounded transition-colors"
    : "p-1.5 hover:bg-green-100 rounded transition-colors";
  const quantityIconClass = isGiven
    ? "w-4 h-4 text-orange-600"
    : "w-4 h-4 text-green-600";
  const quantityBorderClass = isGiven
    ? "flex items-center gap-2 bg-white rounded-lg border border-orange-200 p-1"
    : "flex items-center gap-2 bg-white rounded-lg border border-green-200 p-1";
  const priceColor = isGiven ? "text-orange-700" : "text-green-700";
  const variantFocusClass = isGiven
    ? "w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
    : "w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";

  const stockWithCase = game ? (game.stockWithCase ?? 0) : 0;
  const stockCartridgeOnly = game ? (game.stockCartridgeOnly ?? 0) : 0;

  // Auto-select available variant if current variant has 0 stock
  const currentVariant = (() => {
    const itemVariant = item.variant || "withCase";
    if (
      itemVariant === "withCase" &&
      stockWithCase === 0 &&
      stockCartridgeOnly > 0
    ) {
      return "cartridgeOnly";
    }
    if (
      itemVariant === "cartridgeOnly" &&
      stockCartridgeOnly === 0 &&
      stockWithCase > 0
    ) {
      return "withCase";
    }
    return itemVariant;
  })();

  const hasVariantSupport =
    game &&
    (stockWithCase > 0 ||
      stockCartridgeOnly > 0 ||
      game.stockWithCase !== undefined ||
      game.stockCartridgeOnly !== undefined);

  return (
    <div
      className={`flex items-center gap-3 p-4 border-2 rounded-lg relative ${borderColor} transition-colors`}
    >
      {!isGiven && item.tradable === false && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
          Not Tradable
        </div>
      )}
      <div
        className={`relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
          isGiven ? "border-orange-200" : "border-green-200"
        } bg-gray-100`}
      >
        <SafeImage
          src={item.gameImageURL}
          alt={item.gameTitle}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate mb-1">
          {item.gameTitle}
        </h4>
        <p className="text-xs text-gray-500 font-mono mb-2">
          {item.gameBarcode}
        </p>
        {!isGiven && item.tradable === false && (
          <div className="flex items-center gap-1 text-red-600 text-xs font-semibold mb-2 bg-red-100 px-2 py-1 rounded">
            <span>⚠️</span>
            <span>This game is not tradable</span>
          </div>
        )}
        {/* Variant Selector */}
        {hasVariantSupport && onVariantChange && (
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Variant
            </label>
            <select
              value={currentVariant}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newVariant = e.target.value as
                  | "withCase"
                  | "cartridgeOnly";
                if (newVariant !== currentVariant) {
                  onVariantChange(item, newVariant);
                }
              }}
              className={variantFocusClass}
            >
              <option value="withCase" disabled={stockWithCase === 0}>
                With Case
                {stockWithCase > 0
                  ? ` (${stockWithCase} available)`
                  : " (out of stock)"}
              </option>
              <option value="cartridgeOnly" disabled={stockCartridgeOnly === 0}>
                Cartridge Only
                {stockCartridgeOnly > 0
                  ? ` (${stockCartridgeOnly} available)`
                  : " (out of stock)"}
              </option>
            </select>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">
              ₱{item.gamePrice.toLocaleString()}
            </span>{" "}
            × {item.quantity}
          </p>
          <p className={`text-sm font-bold ${priceColor}`}>
            Line Total: ₱{lineTotal.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={quantityBorderClass}>
          <button
            type="button"
            onClick={() =>
              onQuantityChange(item.gameBarcode, item.quantity - 1, side)
            }
            className={quantityButtonClass}
            title="Decrease quantity"
          >
            <HiMinus className={quantityIconClass} />
          </button>
          <span className="text-center font-semibold text-gray-900">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              onQuantityChange(item.gameBarcode, item.quantity + 1, side)
            }
            className={quantityButtonClass}
            title="Increase quantity"
          >
            <HiPlus className={quantityIconClass} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.gameBarcode, side)}
          className="p-2 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
          title="Remove game"
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
