"use client";

import React from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import {
  formatPrice,
  calculateSavings,
  getPlatformInfo,
  getStockUrgency,
} from "./game-utils";

interface ComparisonModalProps {
  games: Game[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (game: Game) => void;
  cartItems: string[];
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  games,
  isOpen,
  onClose,
  onAddToCart,
  cartItems,
}) => {
  if (!isOpen || games.length === 0) return null;

  const isInCart = (barcode: string): boolean => cartItems.includes(barcode);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Compare Games ({games.length})
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close comparison"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Visible divider between games */}
            {games.length === 2 && (
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
            )}
            {games.map((game, index) => {
              const platformInfo = getPlatformInfo(game.gamePlatform);
              const stockInfo = getStockUrgency(game.gameAvailableStocks);
              const savings = calculateSavings(
                game.gamePrice,
                game.gameBarcode,
                game,
              );

              return (
                <div
                  key={game.gameBarcode}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* Game Image - Left */}
                  <div className="sm:w-32 sm:flex-shrink-0">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <Image
                        src={game.gameImageURL}
                        alt={`${game.gameTitle} game cover`}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                      {/* Stock Badge */}
                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${stockInfo.bgColor} ${stockInfo.color}`}
                      >
                        {stockInfo.text}
                      </div>
                      {/* Savings Badge */}
                      {savings.percentage > 0 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Save {savings.percentage}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Game Details - Right */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {game.gameTitle}
                    </h3>

                    {/* Platform */}
                    <div className="flex justify-center">
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-2 ${platformInfo.color}`}
                      >
                        <span>{platformInfo.icon}</span>
                        <span>{platformInfo.display}</span>
                      </span>
                    </div>

                    {/* Category & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 border">
                        {game.gameCategory}
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Rated {game.gameRatings}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                        {game.gameDescription}
                      </p>
                    </div>

                    {/* Release Date */}
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <span>📅</span>
                      <span>
                        {new Date(game.gameReleaseDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <div className="space-y-1">
                        {game.isOnSale && game.salePrice ? (
                          <>
                            <div className="text-2xl font-black text-red-600">
                              {formatPrice(game.salePrice)}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="text-gray-500 line-through">
                                {formatPrice(game.gamePrice)}
                              </div>
                              <div className="font-bold text-green-600">
                                Save ₱{savings.savings.toLocaleString()}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-black text-funBlue">
                              {formatPrice(game.gamePrice)}
                            </div>
                            {savings.percentage > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <div className="text-gray-500 line-through">
                                  {formatPrice(savings.original)}
                                </div>
                                <div className="font-bold text-green-600">
                                  Save ₱{savings.savings.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 font-medium mt-1">
                        💡 {savings.percentage}% below market price
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => onAddToCart(game)}
                      disabled={game.gameAvailableStocks === 0}
                      className={`w-full font-bold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl ${
                        game.gameAvailableStocks === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : isInCart(game.gameBarcode)
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                            : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600"
                      }`}
                    >
                      {game.gameAvailableStocks === 0
                        ? "🚫 Out of Stock"
                        : isInCart(game.gameBarcode)
                          ? "✓ Added to Cart"
                          : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors"
            >
              Close Comparison
            </button>
            <button
              onClick={() => {
                games.forEach((game) => {
                  if (
                    game.gameAvailableStocks > 0 &&
                    !isInCart(game.gameBarcode)
                  ) {
                    onAddToCart(game);
                  }
                });
              }}
              className="flex-1 bg-gradient-to-r from-funBlue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Add All to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
