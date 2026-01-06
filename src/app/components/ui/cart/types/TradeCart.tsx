"use client";

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { Game } from "@/app/types/games";
import { HiInformationCircle, HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useTradeGameSearch } from "@/hooks/cart/useTradeGameSearch";
import { useGameFetching } from "@/hooks/cart/useGameFetching";
import { useTradeSummary } from "@/hooks/cart/useTradeSummary";
import TradeGameSearch from "../trade/TradeGameSearch";
import TradeGameList from "../trade/TradeGameList";
import TradeSummary from "../trade/TradeSummary";
import { useRouter } from "next/navigation";

export default function TradeCart() {
  const router = useRouter();
  const {
    cart,
    addToTradeCart,
    removeFromTradeCart,
    updateTradeQuantity,
    updateTradeVariant,
  } = useCart();

  const tradeGameSearch = useTradeGameSearch();
  const { fetchedGames } = useGameFetching(
    cart.items,
    cart.gamesGiven,
    tradeGameSearch.availableGames
  );
  const tradeSummary = useTradeSummary();

  // Refs for tracking processed items to avoid infinite loops
  const processedItemsRef = useRef<Set<string>>(new Set());
  const processedGivenRef = useRef<Set<string>>(new Set());

  // Calculate summaries for games given/received
  const gamesGivenSummary = useMemo(() => {
    if (!cart.gamesGiven || cart.gamesGiven.length === 0) {
      return { itemCount: 0, totalQuantity: 0, totalValue: 0 };
    }
    const itemCount = cart.gamesGiven.length;
    const totalQuantity = cart.gamesGiven.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalValue = cart.gamesGiven.reduce(
      (sum, item) => sum + item.gamePrice * item.quantity,
      0
    );
    return { itemCount, totalQuantity, totalValue };
  }, [cart.gamesGiven]);

  const gamesReceivedSummary = useMemo(() => {
    if (cart.items.length === 0) {
      return { itemCount: 0, totalQuantity: 0, totalValue: 0 };
    }
    const itemCount = cart.items.length;
    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalValue = cart.items.reduce(
      (sum, item) => sum + item.gamePrice * item.quantity,
      0
    );
    return { itemCount, totalQuantity, totalValue };
  }, [cart.items]);

  // Check for non-tradable games
  const hasNonTradableGames = useMemo(() => {
    return cart.items.some((item) => item.tradable === false);
  }, [cart.items]);

  const handleTradeGameSelect = (
    game: Game,
    side: "received" | "given",
    variant: "withCase" | "cartridgeOnly" = "withCase"
  ) => {
    addToTradeCart(game, 1, side, variant);
    tradeGameSearch.closeSearch();
  };

  const handleVariantChange = useCallback(
    (
      item: (typeof cart.items)[0],
      newVariant: "withCase" | "cartridgeOnly"
    ) => {
      const game =
        tradeGameSearch.availableGames.find(
          (g) => g.gameBarcode === item.gameBarcode
        ) || fetchedGames.get(item.gameBarcode);
      if (!game) {
        console.error("Game not found for variant change");
        return;
      }

      const oldVariant = item.variant || "withCase";
      if (oldVariant === newVariant) return;

      updateTradeVariant(
        item.gameBarcode,
        oldVariant,
        newVariant,
        "received",
        game
      );
    },
    [tradeGameSearch.availableGames, fetchedGames, updateTradeVariant]
  );

  const handleVariantChangeGiven = useCallback(
    (item: CartItem, newVariant: "withCase" | "cartridgeOnly") => {
      const game =
        tradeGameSearch.availableGames.find(
          (g) => g.gameBarcode === item.gameBarcode
        ) || fetchedGames.get(item.gameBarcode);
      if (!game) {
        console.error("Game not found for variant change");
        return;
      }

      const oldVariant = item.variant || "withCase";
      if (oldVariant === newVariant) return;

      updateTradeVariant(
        item.gameBarcode,
        oldVariant,
        newVariant,
        "given",
        game
      );
    },
    [tradeGameSearch.availableGames, fetchedGames, updateTradeVariant]
  );

  // Auto-update variant for games received if current variant has no stock
  useEffect(() => {
    if (cart.type === "trade" && cart.items.length > 0) {
      cart.items.forEach((item) => {
        const game =
          tradeGameSearch.availableGames.find(
            (g) => g.gameBarcode === item.gameBarcode
          ) || fetchedGames.get(item.gameBarcode);
        if (game) {
          const stockWithCase = game.stockWithCase ?? 0;
          const stockCartridgeOnly = game.stockCartridgeOnly ?? 0;
          const itemVariant = item.variant || "withCase";
          const key = `${item.gameBarcode}-${itemVariant}-${stockWithCase}-${stockCartridgeOnly}`;

          // Only process once per game-stock combination
          if (!processedItemsRef.current.has(key)) {
            if (
              itemVariant === "withCase" &&
              stockWithCase === 0 &&
              stockCartridgeOnly > 0
            ) {
              handleVariantChange(item, "cartridgeOnly");
              processedItemsRef.current.add(key);
            } else if (
              itemVariant === "cartridgeOnly" &&
              stockCartridgeOnly === 0 &&
              stockWithCase > 0
            ) {
              handleVariantChange(item, "withCase");
              processedItemsRef.current.add(key);
            }
          }
        }
      });
    }
    // Reset processed items when cart items change significantly
    return () => {
      if (cart.items.length === 0) {
        processedItemsRef.current.clear();
      }
    };
  }, [
    cart.type,
    cart.items,
    tradeGameSearch.availableGames.length,
    fetchedGames.size,
    handleVariantChange,
  ]);

  // Auto-update variant for games given if current variant has no stock
  useEffect(() => {
    if (
      cart.type === "trade" &&
      cart.gamesGiven &&
      cart.gamesGiven.length > 0
    ) {
      cart.gamesGiven.forEach((item) => {
        const game =
          tradeGameSearch.availableGames.find(
            (g) => g.gameBarcode === item.gameBarcode
          ) || fetchedGames.get(item.gameBarcode);
        if (game) {
          const stockWithCase = game.stockWithCase ?? 0;
          const stockCartridgeOnly = game.stockCartridgeOnly ?? 0;
          const itemVariant = item.variant || "withCase";
          const key = `${item.gameBarcode}-${itemVariant}-${stockWithCase}-${stockCartridgeOnly}`;

          // Only process once per game-stock combination
          if (!processedGivenRef.current.has(key)) {
            if (
              itemVariant === "withCase" &&
              stockWithCase === 0 &&
              stockCartridgeOnly > 0
            ) {
              handleVariantChangeGiven(item, "cartridgeOnly");
              processedGivenRef.current.add(key);
            } else if (
              itemVariant === "cartridgeOnly" &&
              stockCartridgeOnly === 0 &&
              stockWithCase > 0
            ) {
              handleVariantChangeGiven(item, "withCase");
              processedGivenRef.current.add(key);
            }
          }
        }
      });
    }
    // Reset processed items when games given change significantly
    return () => {
      if (!cart.gamesGiven || cart.gamesGiven.length === 0) {
        processedGivenRef.current.clear();
      }
    };
  }, [
    cart.type,
    cart.gamesGiven,
    tradeGameSearch.availableGames.length,
    fetchedGames.size,
    handleVariantChangeGiven,
  ]);

  const handleProceedToTradeForm = () => {
    if (cart.items.length === 0) {
      return;
    }
    if (!cart.gamesGiven || cart.gamesGiven.length === 0) {
      return;
    }
    router.push("/trade-form");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🔄</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trade Cart</h2>
            <p className="text-sm text-gray-600 mt-1">
              Trade your games for new ones
            </p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <HiInformationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Add games you want to trade in (left side)</li>
                <li>Search and add games you want to receive (right side)</li>
                <li>
                  Review the trade summary and proceed to complete your trade
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Games You're Trading In */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HiArrowLeft className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Games You're Trading In
                </h3>
              </div>
              {gamesGivenSummary.itemCount > 0 && (
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {gamesGivenSummary.itemCount} game
                  {gamesGivenSummary.itemCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Add games you want to trade in. Search by title or barcode.
            </p>
            {gamesGivenSummary.itemCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                <span className="text-xs text-gray-600">
                  Total Quantity: {gamesGivenSummary.totalQuantity}
                </span>
                <span className="text-sm font-bold text-orange-700">
                  Total Value: ₱{gamesGivenSummary.totalValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <TradeGameSearch
            side="given"
            searchTerm={
              tradeGameSearch.side === "given" ? tradeGameSearch.searchTerm : ""
            }
            isOpen={tradeGameSearch.isOpen && tradeGameSearch.side === "given"}
            isLoading={tradeGameSearch.isLoadingGames}
            filteredGames={tradeGameSearch.filteredGamesGiven}
            onSearchChange={(value) => {
              tradeGameSearch.setSearchTerm(value);
              tradeGameSearch.openSearch("given");
            }}
            onFocus={() => tradeGameSearch.openSearch("given")}
            onGameSelect={handleTradeGameSelect}
            placeholder="Search games to trade..."
          />

          <TradeGameList
            items={cart.gamesGiven || []}
            side="given"
            availableGames={tradeGameSearch.availableGames}
            fetchedGames={fetchedGames}
            onRemove={removeFromTradeCart}
            onQuantityChange={updateTradeQuantity}
            onVariantChange={handleVariantChangeGiven}
            emptyMessage={{
              icon: "📦",
              title: "No games added yet",
              subtitle: "Search above to add games",
            }}
          />

          {gamesGivenSummary.itemCount > 0 && (
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Games Trading In</p>
                  <p className="text-lg font-bold text-gray-900">
                    {gamesGivenSummary.itemCount} game
                    {gamesGivenSummary.itemCount !== 1 ? "s" : ""} •{" "}
                    {gamesGivenSummary.totalQuantity} total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-xl font-black text-orange-700">
                    ₱{gamesGivenSummary.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Games You Want to Receive */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HiArrowRight className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Games You Want to Receive
                </h3>
              </div>
              {gamesReceivedSummary.itemCount > 0 && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {gamesReceivedSummary.itemCount} game
                  {gamesReceivedSummary.itemCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Search and add games you want to receive. Only tradable games are
              shown.
            </p>
            {gamesReceivedSummary.itemCount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-xs text-gray-600">
                  Total Quantity: {gamesReceivedSummary.totalQuantity}
                </span>
                <span className="text-sm font-bold text-green-700">
                  Total Value: ₱
                  {gamesReceivedSummary.totalValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <TradeGameSearch
            side="received"
            searchTerm={
              tradeGameSearch.side === "received"
                ? tradeGameSearch.searchTerm
                : ""
            }
            isOpen={
              tradeGameSearch.isOpen && tradeGameSearch.side === "received"
            }
            isLoading={tradeGameSearch.isLoadingGames}
            filteredGames={tradeGameSearch.filteredGamesReceived}
            onSearchChange={(value) => {
              tradeGameSearch.setSearchTerm(value);
              tradeGameSearch.openSearch("received");
            }}
            onFocus={() => tradeGameSearch.openSearch("received")}
            onGameSelect={handleTradeGameSelect}
            placeholder="Search games to receive..."
          />

          <TradeGameList
            items={cart.items}
            side="received"
            availableGames={tradeGameSearch.availableGames}
            fetchedGames={fetchedGames}
            onRemove={removeFromTradeCart}
            onQuantityChange={updateTradeQuantity}
            onVariantChange={handleVariantChange}
            emptyMessage={{
              icon: "🎮",
              title: "No games added yet",
              subtitle: "Search above to add tradable games",
            }}
          />

          {gamesReceivedSummary.itemCount > 0 && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Games Receiving</p>
                  <p className="text-lg font-bold text-gray-900">
                    {gamesReceivedSummary.itemCount} game
                    {gamesReceivedSummary.itemCount !== 1 ? "s" : ""} •{" "}
                    {gamesReceivedSummary.totalQuantity} total
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Total Value</p>
                  <p className="text-xl font-black text-green-700">
                    ₱{gamesReceivedSummary.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Summary */}
      {(cart.gamesGiven && cart.gamesGiven.length > 0) ||
      cart.items.length > 0 ? (
        <TradeSummary
          totalValueGiven={tradeSummary.totalValueGiven}
          totalValueReceived={tradeSummary.totalValueReceived}
          cashDifference={tradeSummary.cashDifference}
          tradeFee={tradeSummary.tradeFee}
          tradeType={tradeSummary.tradeType}
        />
      ) : null}

      {/* Proceed to Trade Form Button */}
      <div className="mt-6">
        {hasNonTradableGames && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold mb-1">
              ⚠️ Non-Tradable Games Detected
            </p>
            <p className="text-yellow-700 text-sm">
              Some games in your cart are not available for trading. Please
              remove them before proceeding.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleProceedToTradeForm}
          disabled={
            cart.items.length === 0 ||
            !cart.gamesGiven ||
            cart.gamesGiven.length === 0 ||
            hasNonTradableGames
          }
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Trade Form
        </button>
        <p className="text-sm text-gray-600 text-center mt-4">
          By proceeding, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  );
}
