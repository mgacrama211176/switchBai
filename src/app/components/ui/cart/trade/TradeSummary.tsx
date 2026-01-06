"use client";

import React from "react";
import { HiArrowLeft, HiArrowRight, HiInformationCircle } from "react-icons/hi";

interface TradeSummaryProps {
  totalValueGiven: number;
  totalValueReceived: number;
  cashDifference: number;
  tradeFee: number;
  tradeType: "even" | "trade_up" | "trade_down";
}

export default function TradeSummary({
  totalValueGiven,
  totalValueReceived,
  cashDifference,
  tradeFee,
  tradeType,
}: TradeSummaryProps) {
  return (
    <div className="mt-6 pt-6 border-t-2 border-gray-300">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">💰</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Trade Summary</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <HiArrowLeft className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">
                Total Value Given:
              </span>
            </div>
            <span className="text-base font-bold text-orange-700">
              ₱{totalValueGiven.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <HiArrowRight className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">
                Total Value Received:
              </span>
            </div>
            <span className="text-base font-bold text-green-700">
              ₱{totalValueReceived.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <span className="text-sm font-semibold text-gray-700">
                Trade Fee:
              </span>
            </div>
            <span className="text-base font-bold text-gray-700">
              ₱{tradeFee.toLocaleString()}
            </span>
          </div>

          {tradeType !== "even" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <HiInformationCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">
                  {tradeType === "trade_up"
                    ? "You're trading up (receiving more value)"
                    : "You're trading down (giving more value)"}
                </span>
              </div>
            </div>
          )}

          {tradeType === "trade_down" && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">
                    Great Trade Value!
                  </p>
                  <p className="text-sm text-amber-800 mb-2">
                    You're trading in more value than you're receiving. Consider
                    adding another game to make the most of your trade!
                  </p>
                  {totalValueGiven - totalValueReceived > 0 && (
                    <p className="text-xs text-amber-700 font-medium">
                      You have approximately ₱
                      {(totalValueGiven - totalValueReceived).toLocaleString()}{" "}
                      in additional value you could use for another game.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-funBlue to-blue-600 rounded-lg border-2 border-blue-400 shadow-lg">
            <div>
              <p className="text-sm text-blue-100 mb-1">Cash Difference</p>
              <p className="text-xs text-blue-200">
                {cashDifference > 0 ? "Amount you need to pay" : "Even trade"}
              </p>
            </div>
            <span className="text-2xl font-black text-white">
              ₱{cashDifference.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
