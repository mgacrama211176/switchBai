"use client";

import { useState } from "react";
import { Game } from "@/app/types/games";
import { HiX } from "react-icons/hi";
import {
  calculateProfitMetrics,
  calculatePriceChangeImpact,
  formatCurrency,
  formatPercentage,
} from "@/lib/financial-utils";
import { formatPrice } from "@/lib/game-utils";

interface BulkPriceUpdateModalProps {
  games: Game[];
  onClose: () => void;
  onApply: (percentage: number, gameBarcodes: string[]) => void;
}

export default function BulkPriceUpdateModal({
  games,
  onClose,
  onApply,
}: BulkPriceUpdateModalProps) {
  const [percentage, setPercentage] = useState<number | "">("");
  const [preview, setPreview] = useState<Map<string, number>>(new Map());

  function handlePercentageChange(value: string) {
    const numValue = value === "" ? "" : Number(value);
    setPercentage(numValue);

    if (numValue === "" || numValue === 0) {
      setPreview(new Map());
      return;
    }

    const newPreview = new Map<string, number>();
    games.forEach((game) => {
      const newPrice = Math.round(
        game.gamePrice * (1 + Number(numValue) / 100),
      );
      newPreview.set(game.gameBarcode, newPrice);
    });
    setPreview(newPreview);
  }

  function handleApply() {
    if (percentage === "" || percentage === 0) {
      return;
    }
    onApply(
      Number(percentage),
      games.map((g) => g.gameBarcode),
    );
    onClose();
  }

  const totalRevenueChange = Array.from(preview.entries()).reduce(
    (sum, [barcode, newPrice]) => {
      const game = games.find((g) => g.gameBarcode === barcode);
      if (!game) return sum;
      const impact = calculatePriceChangeImpact(
        game.gamePrice,
        newPrice,
        game.gameAvailableStocks,
      );
      return sum + impact.totalRevenueChange;
    },
    0,
  );

  const warnings = Array.from(preview.entries())
    .map(([barcode, newPrice]) => {
      const game = games.find((g) => g.gameBarcode === barcode);
      if (!game) return null;
      const metrics = calculateProfitMetrics(newPrice, game.costPrice || 0);
      if (metrics.status !== "safe") {
        return { game, newPrice, metrics };
      }
      return null;
    })
    .filter((w) => w !== null);

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Bulk Price Update
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Percentage Change
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  placeholder="e.g., 10 for +10%, -5 for -5%"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none"
                />
                <span className="text-gray-600 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter positive for increase, negative for decrease
              </p>
            </div>

            {preview.size > 0 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Preview ({games.length} games)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        Total Revenue Change:
                      </span>
                      <span
                        className={`ml-2 font-semibold ${
                          totalRevenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {totalRevenueChange >= 0 ? "+" : ""}
                        {formatCurrency(totalRevenueChange)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Warnings:</span>
                      <span
                        className={`ml-2 font-semibold ${
                          warnings.length > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {warnings.length}
                      </span>
                    </div>
                  </div>
                </div>

                {warnings.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <h4 className="font-semibold text-red-900 mb-2">
                      ⚠️ Warnings ({warnings.length} games)
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {warnings.slice(0, 5).map((warning) => (
                        <div
                          key={warning!.game.gameBarcode}
                          className="text-sm text-red-700"
                        >
                          <span className="font-medium">
                            {warning!.game.gameTitle}:
                          </span>{" "}
                          {warning!.metrics.isBelowCost
                            ? "Below cost"
                            : warning!.metrics.isNegativeMargin
                              ? "Negative margin"
                              : "Low margin"}{" "}
                          ({formatPercentage(warning!.metrics.profitMargin)})
                        </div>
                      ))}
                      {warnings.length > 5 && (
                        <div className="text-sm text-red-600 italic">
                          ...and {warnings.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Game
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Current
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            New
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {games.slice(0, 10).map((game) => {
                          const newPrice =
                            preview.get(game.gameBarcode) || game.gamePrice;
                          const metrics = calculateProfitMetrics(
                            newPrice,
                            game.costPrice || 0,
                          );
                          return (
                            <tr key={game.gameBarcode}>
                              <td className="px-4 py-2 text-gray-900">
                                {game.gameTitle.substring(0, 30)}
                                {game.gameTitle.length > 30 ? "..." : ""}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {formatPrice(game.gamePrice)}
                              </td>
                              <td className="px-4 py-2 font-semibold text-gray-900">
                                {formatPrice(newPrice)}
                              </td>
                              <td
                                className={`px-4 py-2 font-semibold ${
                                  metrics.status === "danger"
                                    ? "text-red-600"
                                    : metrics.status === "warning"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                }`}
                              >
                                {formatPercentage(metrics.profitMargin)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {games.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 text-center bg-gray-50">
                        ...and {games.length - 10} more games
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={percentage === "" || percentage === 0}
            className="px-6 py-2 bg-funBlue hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
