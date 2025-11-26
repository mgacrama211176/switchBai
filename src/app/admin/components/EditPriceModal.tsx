"use client";

import { useState, useEffect } from "react";
import { Game } from "@/app/types/games";
import { HiX } from "react-icons/hi";
import {
  calculateProfitMetrics,
  formatCurrency,
  formatPercentage,
  getPriceUpdateWarning,
} from "@/lib/financial-utils";
import { formatPrice } from "@/lib/game-utils";

interface EditPriceModalProps {
  game: Game;
  onClose: () => void;
  onSave: (newPrice: number, newCostPrice?: number) => Promise<void>;
}

export default function EditPriceModal({
  game,
  onClose,
  onSave,
}: EditPriceModalProps) {
  const [newPrice, setNewPrice] = useState<number | "">(game.gamePrice);
  const [newCostPrice, setNewCostPrice] = useState<number | "">(game.costPrice || 0);
  const [isSaving, setIsSaving] = useState(false);

  const costPrice = game.costPrice || 0;
  const currentPrice = game.gamePrice;
  const currentMetrics = calculateProfitMetrics(currentPrice, costPrice);
  
  // Use newCostPrice if it's been changed, otherwise use original costPrice
  const effectiveCostPrice = typeof newCostPrice === "number" && newCostPrice >= 0 
    ? newCostPrice 
    : costPrice;
  
  const metrics =
    typeof newPrice === "number" && newPrice >= 0
      ? calculateProfitMetrics(newPrice, effectiveCostPrice)
      : null;
  const warning =
    metrics && metrics.status !== "safe"
      ? getPriceUpdateWarning(
          metrics,
          currentPrice,
          newPrice as number,
          effectiveCostPrice,
        )
      : null;

  const priceDifference =
    typeof newPrice === "number" && newPrice >= 0 ? newPrice - currentPrice : 0;
  const stock = game.gameAvailableStocks;

  function getStatusColor(status: "safe" | "warning" | "danger"): string {
    switch (status) {
      case "safe":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-red-600";
    }
  }

  function getStatusBgColor(status: "safe" | "warning" | "danger"): string {
    switch (status) {
      case "safe":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "danger":
        return "bg-red-50 border-red-200";
    }
  }

  async function handleSave() {
    if (typeof newPrice !== "number" || newPrice < 0) {
      return;
    }

    const costPriceChanged = typeof newCostPrice === "number" && newCostPrice >= 0 && newCostPrice !== costPrice;
    const priceChanged = newPrice !== currentPrice;

    if (!priceChanged && !costPriceChanged) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      // Only pass costPrice if it was changed
      await onSave(newPrice, costPriceChanged ? newCostPrice : undefined);
      onClose();
    } catch (error) {
      console.error("Error saving price:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const isValid = typeof newPrice === "number" && newPrice >= 0;
  const costPriceValid = typeof newCostPrice === "number" && newCostPrice >= 0;
  const costPriceChanged = costPriceValid && newCostPrice !== costPrice;
  const priceChanged = isValid && newPrice !== currentPrice;
  const hasChanges = priceChanged || costPriceChanged;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Price & Cost</h2>
            <p className="text-sm text-gray-600 mt-1">{game.gameTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Price Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Current Price:</span>
                <p className="font-semibold text-gray-900">
                  {formatPrice(currentPrice)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Cost Price:</span>
                <p className="font-semibold text-gray-900">
                  {formatPrice(costPrice)}
                  {costPriceChanged && (
                    <span className="text-xs text-funBlue ml-2">
                      → {formatPrice(newCostPrice as number)}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Current Margin:</span>
                <p
                  className={`font-semibold ${getStatusColor(
                    currentMetrics.status,
                  )}`}
                >
                  {formatPercentage(currentMetrics.profitMargin)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Stock:</span>
                <p className="font-semibold text-gray-900">{stock} units</p>
              </div>
            </div>
          </div>

          {/* New Price Input */}
          <div>
            <label
              htmlFor="newPrice"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              New Price (₱) *
            </label>
            <input
              id="newPrice"
              type="number"
              value={newPrice}
              onChange={(e) =>
                setNewPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              min="0"
              step="10"
              className={`w-full px-4 py-3 rounded-xl border-2 ${
                metrics && metrics.status === "danger"
                  ? "border-red-300 bg-red-50"
                  : metrics && metrics.status === "warning"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-200"
              } focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all text-lg font-semibold`}
              placeholder="Enter new price"
              autoFocus
            />
            {!isValid && (
              <p className="text-sm text-red-600 mt-1">
                Please enter a valid price
              </p>
            )}
          </div>

          {/* Cost Price Input */}
          <div>
            <label
              htmlFor="newCostPrice"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Cost Price (₱)
            </label>
            <input
              id="newCostPrice"
              type="number"
              value={newCostPrice}
              onChange={(e) =>
                setNewCostPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              min="0"
              step="1"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all text-lg font-semibold"
              placeholder="Enter cost price"
            />
            <p className="text-xs text-gray-500 mt-1">
              Purchase cost per unit
            </p>
          </div>

          {/* Profit Calculation Display */}
          {metrics && isValid && (
            <div
              className={`rounded-xl p-4 border-2 ${getStatusBgColor(
                metrics.status,
              )}`}
            >
              <div className="text-sm font-semibold text-gray-700 mb-3">
                Profit Analysis
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Profit Margin:</span>
                  <p
                    className={`font-semibold ${getStatusColor(metrics.status)}`}
                  >
                    {formatPercentage(metrics.profitMargin)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Profit per Unit:</span>
                  <p
                    className={`font-semibold ${
                      metrics.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metrics.profit >= 0 ? "+" : ""}
                    {formatCurrency(metrics.profit)}
                  </p>
                </div>
                {hasChanges && (
                  <>
                    <div>
                      <span className="text-gray-600">Price Change:</span>
                      <p
                        className={`font-semibold ${
                          priceDifference >= 0
                            ? "text-green-600"
                            : "text-red-600"
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
                  </>
                )}
              </div>
            </div>
          )}

          {/* Inline Warning */}
          {warning && metrics && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-600 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Warning
                  </p>
                  <p className="text-sm text-red-700">{warning}</p>
                  {metrics.profit < 0 && stock > 0 && (
                    <p className="text-xs text-red-600 mt-2">
                      Potential total loss if all {stock} units are sold:{" "}
                      {formatCurrency(Math.abs(metrics.profit) * stock)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 disabled:bg-gray-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || !hasChanges || isSaving}
            className="px-6 py-2 bg-funBlue hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
