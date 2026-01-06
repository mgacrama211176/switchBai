"use client";

import React from "react";
import { formatPrice } from "@/lib/purchase-form-utils";
import { calculateSavings } from "@/app/components/ui/home/game-utils";
import CartItemImage from "../items/CartItemImage";

interface RentalSummaryItem {
  gameBarcode: string;
  gameTitle: string;
  gameImageURL: string;
  quantity: number;
  variant?: "withCase" | "cartridgeOnly";
  rentalFee: number;
  deposit: number;
  totalDue: number;
  isOnSale?: boolean;
  salePrice?: number;
  gamePrice: number;
}

interface RentalSummaryProps {
  items: RentalSummaryItem[];
  totalRentalFee: number;
  totalDeposit: number;
  totalDue: number;
  rentalDays: number;
}

export default function RentalSummary({
  items,
  totalRentalFee,
  totalDeposit,
  totalDue,
  rentalDays,
}: RentalSummaryProps) {
  if (rentalDays === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const savings = calculateSavings(
          item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice,
          item.gameBarcode,
          {
            isOnSale: item.isOnSale,
            salePrice: item.salePrice,
            gamePrice: item.gamePrice,
          },
        );

        const saleBadge =
          item.isOnSale && savings.percentage > 0 ? (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1 py-0.5 rounded-full text-[9px] font-bold shadow-lg">
              🏷️
            </div>
          ) : null;

        return (
          <div
            key={`${item.gameBarcode}-${item.variant || "withCase"}`}
            className="flex items-start gap-3"
          >
            <CartItemImage
              src={item.gameImageURL}
              alt={item.gameTitle}
              badge={saleBadge}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {item.gameTitle}
              </h3>
              {item.variant === "cartridgeOnly" && (
                <span className="inline-block text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full mb-1">
                  Cartridge Only
                </span>
              )}
              <p className="text-xs text-gray-500 mb-1">
                {item.quantity} × {rentalDays} days
              </p>
              <p className="text-xs text-gray-600">
                Rental: {formatPrice(item.rentalFee)}
              </p>
              <p className="text-xs text-gray-600">
                Deposit: {formatPrice(item.deposit)}
              </p>
            </div>
          </div>
        );
      })}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Rental Fee:</span>
          <span className="font-semibold">{formatPrice(totalRentalFee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Deposit:</span>
          <span className="font-semibold">{formatPrice(totalDeposit)}</span>
        </div>
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-bold text-gray-900">
              Total Due:
            </span>
            <span className="text-lg font-bold text-funBlue">
              {formatPrice(totalDue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
