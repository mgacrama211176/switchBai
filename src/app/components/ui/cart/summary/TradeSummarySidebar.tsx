"use client";

import React from "react";
import { CartItem } from "@/contexts/CartContext";
import SafeImage from "@/app/components/ui/SafeImage";

interface TradeSummarySidebarProps {
  gamesGiven: CartItem[];
  gamesReceived: CartItem[];
  totalValueGiven: number;
  totalValueReceived: number;
  cashDifference: number;
  tradeFee: number;
}

export default function TradeSummarySidebar({
  gamesGiven,
  gamesReceived,
  totalValueGiven,
  totalValueReceived,
  cashDifference,
  tradeFee,
}: TradeSummarySidebarProps) {
  return (
    <div className="space-y-4">
      {gamesGiven.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Games You're Trading In
          </h3>
          {gamesGiven.map((item) => (
            <div
              key={item.gameBarcode}
              className="flex items-start gap-3 pb-3 mb-3 border-b border-gray-100"
            >
              <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <SafeImage
                  src={item.gameImageURL}
                  alt={item.gameTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {item.gameTitle}
                </h3>
                <p className="text-[10px] text-gray-400 mb-2 font-mono">
                  {item.gameBarcode}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{(item.gamePrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {gamesReceived.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Games You Want to Receive
          </h3>
          {gamesReceived.map((item) => (
            <div
              key={`${item.gameBarcode}-${item.variant || "withCase"}`}
              className="flex items-start gap-3 pb-3 mb-3 border-b border-gray-100"
            >
              <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <SafeImage
                  src={item.gameImageURL}
                  alt={item.gameTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {item.gameTitle}
                </h3>
                <p className="text-[10px] text-gray-400 mb-2 font-mono">
                  {item.gameBarcode}
                </p>
                {item.variant === "cartridgeOnly" && (
                  <span className="inline-block text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full mb-2">
                    Cartridge Only
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm font-semibold">
                    ₱{(item.gamePrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Value Given:</span>
          <span className="font-semibold">
            ₱{totalValueGiven.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Value Received:</span>
          <span className="font-semibold">
            ₱{totalValueReceived.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Trade Fee:</span>
          <span className="font-semibold">₱{tradeFee.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-bold text-gray-900">
              Cash Difference:
            </span>
            <span className="text-lg font-bold text-funBlue">
              ₱{cashDifference.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
