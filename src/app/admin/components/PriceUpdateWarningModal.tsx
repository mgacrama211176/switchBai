"use client";

import { Game } from "@/app/types/games";
import { HiX, HiExclamation } from "react-icons/hi";
import {
  calculateProfitMetrics,
  formatCurrency,
  formatPercentage,
  getPriceUpdateWarning,
} from "@/lib/financial-utils";
import { formatPrice } from "@/lib/game-utils";

interface PriceUpdateWarningModalProps {
  game: Game;
  currentPrice: number;
  newPrice: number;
  metrics: ReturnType<typeof calculateProfitMetrics>;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PriceUpdateWarningModal({
  game,
  currentPrice,
  newPrice,
  metrics,
  onConfirm,
  onCancel,
}: PriceUpdateWarningModalProps) {
  const costPrice = game.costPrice || 0;
  const currentMetrics = calculateProfitMetrics(currentPrice, costPrice);
  const warning = getPriceUpdateWarning(
    metrics,
    currentPrice,
    newPrice,
    costPrice,
  );

  const priceDifference = newPrice - currentPrice;
  const stock = game.gameAvailableStocks;
  const totalPotentialLoss =
    metrics.profit < 0 ? Math.abs(metrics.profit) * stock : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <HiExclamation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Price Update Warning
              </h2>
              <p className="text-sm text-gray-600">
                This change may result in income loss
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-100 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Game Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {game.gameTitle}
            </h3>
            <p className="text-sm text-gray-600">Barcode: {game.gameBarcode}</p>
            <p className="text-sm text-gray-600">Stock: {stock} units</p>
          </div>

          {/* Warning Message */}
          {warning && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-900 font-semibold">{warning}</p>
            </div>
          )}

          {/* Price Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Current Price
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Price:</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(currentPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Cost:</span>
                  <p className="text-sm text-gray-700">
                    {formatPrice(costPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Profit Margin:</span>
                  <p
                    className={`text-sm font-semibold ${
                      currentMetrics.status === "danger"
                        ? "text-red-600"
                        : currentMetrics.status === "warning"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {formatPercentage(currentMetrics.profitMargin)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">
                    Profit per unit:
                  </span>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(currentMetrics.profit)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`border-2 rounded-xl p-4 ${
                metrics.status === "danger"
                  ? "border-red-300 bg-red-50"
                  : metrics.status === "warning"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-200"
              }`}
            >
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                New Price
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Price:</span>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(newPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Cost:</span>
                  <p className="text-sm text-gray-700">
                    {formatPrice(costPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Profit Margin:</span>
                  <p
                    className={`text-sm font-semibold ${
                      metrics.status === "danger"
                        ? "text-red-600"
                        : metrics.status === "warning"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {formatPercentage(metrics.profitMargin)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">
                    Profit per unit:
                  </span>
                  <p
                    className={`text-sm font-semibold ${
                      metrics.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metrics.profit >= 0 ? "+" : ""}
                    {formatCurrency(metrics.profit)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Impact Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Price Change:</span>
                <p
                  className={`font-semibold ${
                    priceDifference >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {priceDifference >= 0 ? "+" : ""}
                  {formatCurrency(priceDifference)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Margin Change:</span>
                <p
                  className={`font-semibold ${
                    metrics.profitMargin >= currentMetrics.profitMargin
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {metrics.profitMargin >= currentMetrics.profitMargin
                    ? "+"
                    : ""}
                  {formatPercentage(
                    metrics.profitMargin - currentMetrics.profitMargin,
                  )}
                </p>
              </div>
            </div>
            {totalPotentialLoss > 0 && (
              <div className="pt-2 border-t border-gray-300">
                <span className="text-red-600 font-semibold">
                  Potential Total Loss: {formatCurrency(totalPotentialLoss)}
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  (if all {stock} units are sold at this price)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
