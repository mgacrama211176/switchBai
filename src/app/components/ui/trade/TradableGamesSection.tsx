"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { fetchGames } from "@/lib/api-client";
import { Game } from "@/app/types/games";
import {
  getPlatformInfo,
  getStockUrgency,
  calculateSavings,
  formatPrice,
  filterNintendoSwitchGames,
} from "@/app/components/ui/home/game-utils";

export function TradableGamesSection() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTradeGame = (game: Game) => {
    addToCart(game, 1, "trade");
    router.push("/cart");
  };

  useEffect(() => {
    async function loadTradableGames() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchGames({
          tradable: true,
          inStock: true,
          limit: 100,
        });

        if (response.success && response.data) {
          // Filter out PS4/PS5 games - only show Nintendo Switch games
          const filteredGames = filterNintendoSwitchGames(
            response.data.games || [],
          );
          setGames(filteredGames);
        } else {
          setError(response.error || "Failed to load tradable games");
        }
      } catch (err) {
        setError("An error occurred while loading games");
        console.error("Error loading tradable games:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTradableGames();
  }, []);

  return (
    <SectionWrapper variant="light" id="tradable-games">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 transform rotate-2">
            🎮 Games Open for Trade
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 sm:mb-4">
            Available Games for Trading
          </h2>
          <p className="text-base sm:text-lg text-gray-700 px-4 sm:px-0">
            Browse our collection of games available for trade. Only games
            marked as tradable are shown here.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">Loading tradable games...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 max-w-md mx-auto">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Error Loading Games
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 max-w-md mx-auto">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Tradable Games Available
              </h3>
              <p className="text-gray-600">
                We're currently updating our tradable games collection. Check
                back soon!
              </p>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && !error && games.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {games.map((game) => {
                const platformInfo = getPlatformInfo(game.gamePlatform);
                const stockInfo = getStockUrgency(game.gameAvailableStocks);
                const savings = calculateSavings(
                  game.gamePrice,
                  game.gameBarcode,
                  game,
                );

                return (
                  <article
                    key={game.gameBarcode}
                    className="game-card shadow-lg hover:shadow-2xl group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Trade Badge */}
                    <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      🔄 Trade
                    </div>

                    {/* Stock Urgency Badge */}
                    <div
                      className={`absolute top-2 right-2 z-20 px-2 py-1 rounded-full text-xs font-bold border ${stockInfo.bgColor} ${stockInfo.color}`}
                    >
                      {stockInfo.text}
                    </div>

                    {/* Sale Badge */}
                    {game.isOnSale && (
                      <div className="absolute top-10 left-2 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        🏷️ Sale
                      </div>
                    )}

                    {/* Game Image Container */}
                    <Link href={`/games/${game.gameBarcode}`}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image
                          src={game.gameImageURL}
                          alt={`${game.gameTitle} game cover`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </Link>

                    {/* Card Content */}
                    <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                      {/* Game Title */}
                      <div className="min-h-10 flex items-start">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors duration-300 leading-tight">
                          {game.gameTitle}
                        </h3>
                      </div>

                      {/* Platform Display */}
                      <div className="flex justify-center">
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 ${platformInfo.color}`}
                        >
                          <span>{platformInfo.icon}</span>
                          <span>{platformInfo.display}</span>
                        </span>
                      </div>

                      {/* Pricing Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-1.5 sm:p-2 border border-green-100">
                        <div className="space-y-1">
                          {game.isOnSale && game.salePrice ? (
                            <>
                              <div className="text-sm sm:text-base font-black text-red-600">
                                {formatPrice(game.salePrice)}
                              </div>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs">
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
                              <div className="text-sm sm:text-base font-black text-gray-900">
                                {formatPrice(game.gamePrice)}
                              </div>
                              {savings.percentage > 0 && (
                                <div className="flex items-center justify-between text-[10px] sm:text-xs">
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
                      </div>

                      {/* Stock Info */}
                      <div className="text-center mb-2">
                        <span
                          className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${stockInfo.bgColor} ${stockInfo.color}`}
                        >
                          {game.gameAvailableStocks} in stock
                        </span>
                      </div>

                      {/* Trade Button */}
                      {game.gameAvailableStocks > 0 && (
                        <button
                          onClick={() => handleTradeGame(game)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm"
                        >
                          Trade This Game
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Call to Action */}
            <div className="mt-8 sm:mt-10 md:mt-12 text-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200 max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Interested in Trading?
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 px-4 sm:px-0">
                  Contact us to start your trade! We'll evaluate your games and
                  provide a fair trade quote.
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                >
                  Contact Us to Trade
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
