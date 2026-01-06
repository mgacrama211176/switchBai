"use client";

import React from "react";
import { CartItem } from "@/contexts/CartContext";
import { Game } from "@/app/types/games";
import TradeCartItem from "../items/TradeCartItem";

interface TradeGameListProps {
  items: CartItem[];
  side: "given" | "received";
  availableGames: Game[];
  fetchedGames: Map<string, Game>;
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
  emptyMessage: {
    icon: string;
    title: string;
    subtitle: string;
  };
}

export default function TradeGameList({
  items,
  side,
  availableGames,
  fetchedGames,
  onRemove,
  onQuantityChange,
  onVariantChange,
  emptyMessage,
}: TradeGameListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-4xl mb-2">{emptyMessage.icon}</div>
        <p className="text-sm text-gray-500 font-medium">
          {emptyMessage.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{emptyMessage.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const game =
          availableGames.find((g) => g.gameBarcode === item.gameBarcode) ||
          fetchedGames.get(item.gameBarcode);

        return (
          <TradeCartItem
            key={`${item.gameBarcode}-${item.variant || "withCase"}`}
            item={item}
            side={side}
            game={game}
            onRemove={onRemove}
            onQuantityChange={onQuantityChange}
            onVariantChange={onVariantChange}
          />
        );
      })}
    </div>
  );
}
