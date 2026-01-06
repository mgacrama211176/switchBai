"use client";

import React from "react";
import { Game } from "@/app/types/games";
import { HiSearch } from "react-icons/hi";

interface TradeGameSearchProps {
  side: "given" | "received";
  searchTerm: string;
  isOpen: boolean;
  isLoading: boolean;
  filteredGames: Game[];
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  onGameSelect: (
    game: Game,
    side: "received" | "given",
    variant: "withCase" | "cartridgeOnly",
  ) => void;
  placeholder: string;
}

export default function TradeGameSearch({
  side,
  searchTerm,
  isOpen,
  isLoading,
  filteredGames,
  onSearchChange,
  onFocus,
  onGameSelect,
  placeholder,
}: TradeGameSearchProps) {
  return (
    <div className="relative">
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Loading games...
            </div>
          ) : filteredGames.length > 0 ? (
            filteredGames.map((game) => {
              const stockWithCase = game.stockWithCase ?? 0;
              const stockCartridgeOnly = game.stockCartridgeOnly ?? 0;
              const cartridgePrice =
                game.cartridgeOnlyPrice || Math.max(0, game.gamePrice - 100);
              const hasBothVariants =
                stockWithCase > 0 && stockCartridgeOnly > 0;
              const withCaseButtonClass =
                side === "given"
                  ? "flex-1 px-3 py-2 text-xs border-2 border-orange-500 bg-orange-50 text-orange-700 rounded-lg font-semibold hover:bg-orange-100 transition-colors"
                  : "flex-1 px-3 py-2 text-xs border-2 border-green-500 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors";
              const singleButtonClass =
                side === "given"
                  ? "w-full px-3 py-2 text-xs border-2 border-orange-500 bg-orange-50 text-orange-700 rounded-lg font-semibold hover:bg-orange-100 transition-colors"
                  : "w-full px-3 py-2 text-xs border-2 border-green-500 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors";

              return (
                <div
                  key={game.gameBarcode}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <div className="px-4 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {game.gameTitle}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {game.gameBarcode}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{game.gamePrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {hasBothVariants ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => onGameSelect(game, side, "withCase")}
                          className={withCaseButtonClass}
                        >
                          With Case
                          <div className="text-[10px] font-normal mt-0.5">
                            {stockWithCase} in stock • ₱
                            {game.gamePrice.toLocaleString()}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onGameSelect(game, side, "cartridgeOnly")
                          }
                          className="flex-1 px-3 py-2 text-xs border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                        >
                          Cartridge Only
                          <div className="text-[10px] font-normal mt-0.5">
                            {stockCartridgeOnly} in stock • ₱
                            {cartridgePrice.toLocaleString()}
                          </div>
                        </button>
                      </div>
                    ) : stockWithCase > 0 ? (
                      <button
                        type="button"
                        onClick={() => onGameSelect(game, side, "withCase")}
                        className={singleButtonClass}
                      >
                        Add With Case ({stockWithCase} in stock)
                      </button>
                    ) : stockCartridgeOnly > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          onGameSelect(game, side, "cartridgeOnly")
                        }
                        className="w-full px-3 py-2 text-xs border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Add Cartridge Only ({stockCartridgeOnly} in stock)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onGameSelect(game, side, "withCase")}
                        className="w-full px-3 py-2 text-xs border-2 border-gray-300 bg-gray-50 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Add Game
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No games found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
