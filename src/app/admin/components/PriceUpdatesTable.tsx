"use client";

import { useState, useEffect, useCallback } from "react";
import { Game } from "@/app/types/games";
import { formatPrice } from "@/lib/game-utils";
import {
  calculateProfitMetrics,
  formatCurrency,
  formatPercentage,
} from "@/lib/financial-utils";
import { HiSearch, HiRefresh, HiTag, HiPencil } from "react-icons/hi";
import Toast from "./Toast";
import BulkPriceUpdateModal from "./BulkPriceUpdateModal";
import EditPriceModal from "./EditPriceModal";
import Image from "next/image";

interface PriceUpdatesTableProps {
  refreshTrigger: number;
  onPriceUpdated: () => void;
}

export default function PriceUpdatesTable({
  refreshTrigger,
  onPriceUpdated,
}: PriceUpdatesTableProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "1000", // Get all games for price updates
        search: searchTerm,
        platform: platformFilter,
      });

      const response = await fetch(`/api/games?${params.toString()}`);
      const data = await response.json();

      if (data.games) {
        setGames(data.games);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setToast({ message: "Failed to fetch games", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, platformFilter]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames, refreshTrigger]);

  async function handleSavePrice(newPrice: number, newCostPrice?: number) {
    if (!editingGame) return;

    try {
      const updateData: any = {
        ...editingGame,
        gamePrice: newPrice,
      };

      // Include costPrice in update if provided
      if (newCostPrice !== undefined) {
        updateData.costPrice = newCostPrice;
      }

      const response = await fetch(`/api/games/${editingGame.gameBarcode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update price");
      }

      setToast({
        message:
          newCostPrice !== undefined
            ? "Price and cost price updated successfully!"
            : "Price updated successfully!",
        type: "success",
      });

      setEditingGame(null);
      onPriceUpdated();
      fetchGames();
    } catch (error) {
      console.error("Error updating price:", error);
      throw error;
    }
  }

  function handleBulkPercentageUpdate(
    percentage: number,
    gameBarcodes: string[],
  ) {
    // This will be handled by the bulk update modal
    // For now, we'll apply directly via API
    setIsLoading(true);

    const updates = gameBarcodes
      .map((barcode) => {
        const game = games.find((g) => g.gameBarcode === barcode);
        if (!game) return null;
        const newPrice = Math.round(game.gamePrice * (1 + percentage / 100));
        return { barcode, gamePrice: newPrice };
      })
      .filter(Boolean) as Array<{ barcode: string; gamePrice: number }>;

    fetch("/api/games/bulk-update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setToast({
            message: `Successfully updated ${updates.length} game price(s)`,
            type: "success",
          });
          onPriceUpdated();
          fetchGames();
        } else {
          throw new Error(data.error || "Failed to update prices");
        }
      })
      .catch((error) => {
        console.error("Error updating prices:", error);
        setToast({
          message:
            error instanceof Error ? error.message : "Failed to update prices",
          type: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function toggleGameSelection(barcode: string) {
    setSelectedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(barcode)) {
        newSet.delete(barcode);
      } else {
        newSet.add(barcode);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    if (selectedGames.size === games.length) {
      setSelectedGames(new Set());
    } else {
      setSelectedGames(new Set(games.map((g) => g.gameBarcode)));
    }
  }

  function getStatusColor(status: "safe" | "warning" | "danger"): string {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-700 border-green-300";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "danger":
        return "bg-red-100 text-red-700 border-red-300";
    }
  }

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      !searchTerm ||
      game.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.gameBarcode.includes(searchTerm);
    const matchesPlatform =
      !platformFilter ||
      (Array.isArray(game.gamePlatform)
        ? game.gamePlatform.includes(platformFilter)
        : game.gamePlatform === platformFilter);
    return matchesSearch && matchesPlatform;
  });

  const selectedCount = selectedGames.size;

  return (
    <div className="space-y-6 text-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showBulkModal && (
        <BulkPriceUpdateModal
          games={
            selectedCount > 0
              ? games.filter((g) => selectedGames.has(g.gameBarcode))
              : games
          }
          onClose={() => setShowBulkModal(false)}
          onApply={handleBulkPercentageUpdate}
        />
      )}

      {editingGame && (
        <EditPriceModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={handleSavePrice}
        />
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Price Updates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update game prices with automatic profit protection
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-funBlue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <HiTag className="w-4 h-4" />
            Bulk Update
          </button>
          <button
            onClick={fetchGames}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <HiRefresh
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or barcode..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all"
        >
          <option value="">All Platforms</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
          <option value="Nintendo Switch 2">Nintendo Switch 2</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 text-sm border-2 border-gray-200 hover:border-funBlue rounded-lg font-medium transition-colors"
          >
            {selectedCount === games.length ? "Deselect All" : "Select All"}
          </button>
          {selectedCount > 0 && (
            <span className="text-sm text-gray-600">
              {selectedCount} selected
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                <input
                  type="checkbox"
                  checked={selectedCount === games.length && games.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-funBlue focus:ring-funBlue"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Game
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Cost Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Current Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Profit Margin
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && filteredGames.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue mx-auto"></div>
                </td>
              </tr>
            ) : filteredGames.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className="text-gray-500">No games found</p>
                </td>
              </tr>
            ) : (
              filteredGames.map((game) => {
                const currentPrice = game.gamePrice;
                const metrics = calculateProfitMetrics(
                  currentPrice,
                  game.costPrice || 0,
                );
                const isSelected = selectedGames.has(game.gameBarcode);

                return (
                  <tr
                    key={game.gameBarcode}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGameSelection(game.gameBarcode)}
                        className="rounded border-gray-300 text-funBlue focus:ring-funBlue"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={game.gameImageURL}
                            alt={game.gameTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {game.gameTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {game.gameBarcode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatPrice(game.costPrice || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(currentPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold ${
                            metrics.status === "danger"
                              ? "text-red-600"
                              : metrics.status === "warning"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {formatPercentage(metrics.profitMargin)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {metrics.profit >= 0 ? "+" : ""}
                          {formatCurrency(metrics.profit)}/unit
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          game.gameAvailableStocks === 0
                            ? "bg-red-100 text-red-700"
                            : game.gameAvailableStocks < 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {game.gameAvailableStocks}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setEditingGame(game)}
                          className="p-2 rounded-lg text-funBlue hover:bg-funBlue/10 transition-colors duration-300"
                          title="Edit Price"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
