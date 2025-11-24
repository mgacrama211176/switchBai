"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchGameByBarcode } from "@/lib/api-client";
import { Game } from "@/app/types/games";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import {
  formatPrice,
  calculateSavings,
  getPlatformInfo,
  getStockUrgency,
  isNintendoSwitchGame,
} from "@/app/components/ui/home/game-utils";
import { calculateRentalPrice } from "@/lib/rental-pricing";
import { useCart } from "@/contexts/CartContext";

const GameDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const barcode = params.barcode as string;

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartTypeModal, setShowCartTypeModal] = useState(false);

  const { addToCart, cart } = useCart();

  useEffect(() => {
    loadGame();
  }, [barcode]);

  const loadGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchGameByBarcode(barcode);

      if (response.success && response.data) {
        // Check if game is PS4/PS5 - if so, show 404
        if (!isNintendoSwitchGame(response.data.gamePlatform)) {
          setError("Game not found");
          setGame(null);
        } else {
          setGame(response.data);
        }
      } else {
        setError(response.error || "Game not found");
      }
    } catch (err) {
      console.error("Error loading game:", err);
      setError("Failed to load game details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Game Not Found
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8">
              {error}
            </p>
            <Link
              href="/games"
              className="inline-block min-h-[44px] bg-funBlue text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Browse All Games
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const platformInfo = getPlatformInfo(game.gamePlatform);
  const stockInfo = getStockUrgency(game.gameAvailableStocks);
  const displayPrice =
    game.isOnSale && game.salePrice ? game.salePrice : game.gamePrice;
  const savings = calculateSavings(displayPrice, game.gameBarcode, game);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 text-xs sm:text-sm">
            <Link href="/" className="text-gray-700 hover:text-funBlue">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/games" className="text-gray-700 hover:text-funBlue">
              Games
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-semibold">
              {game.gameTitle}
            </span>
          </nav>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
            {/* Left: Image */}
            <div className="relative aspect-[3/4] rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={game.gameImageURL}
                alt={`${game.gameTitle} game cover`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 40vw"
                priority
              />

              {game.isOnSale && savings.percentage > 0 && (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  🏷️ Save {savings.percentage}%
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4">
                  {game.gameTitle}
                </h1>

                <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${platformInfo.color}`}
                  >
                    <span>{platformInfo.icon}</span>
                    {platformInfo.display}
                  </span>

                  <span className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                    Rated {game.gameRatings}
                  </span>

                  <span className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    {game.gameCategory}
                  </span>
                </div>

                <div
                  className={`inline-block px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold border ${stockInfo.bgColor} ${stockInfo.color}`}
                >
                  {stockInfo.text}
                </div>
              </div>

              <div className="border-t border-b py-4 sm:py-6">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                  {game.gameDescription}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                {game.isOnSale && game.salePrice ? (
                  <>
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600">
                        {formatPrice(game.salePrice)}
                      </div>
                      <div className="text-base sm:text-lg md:text-xl text-gray-500 line-through">
                        {formatPrice(game.gamePrice)}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-green-600 mb-2">
                      You save ₱{savings.savings.toLocaleString()} (
                      {savings.percentage}% off)
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">
                      💡 On Sale - Limited Time Offer
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-black text-funBlue">
                        {formatPrice(game.gamePrice)}
                      </div>
                      {savings.percentage > 0 && (
                        <div className="text-base sm:text-lg md:text-xl text-gray-500 line-through">
                          {formatPrice(savings.original)}
                        </div>
                      )}
                    </div>
                    {savings.percentage > 0 && (
                      <div className="text-xs sm:text-sm font-bold text-green-600 mb-2">
                        You save ₱{savings.savings.toLocaleString()} (
                        {savings.percentage}% off)
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-gray-700">
                      💡 {savings.percentage}% below market price
                    </div>
                  </>
                )}
              </div>

              {game.gameAvailableStocks > 0 && (
                <div className="flex items-center gap-4 text-black">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="min-w-[44px] min-h-[44px] w-9 h-9 sm:w-10 sm:h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition-colors text-sm sm:text-base"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(
                                game.gameAvailableStocks,
                                Number(e.target.value),
                              ),
                            ),
                          )
                        }
                        className="w-14 h-9 sm:w-16 sm:h-10 text-center border border-gray-300 rounded-lg font-semibold text-sm sm:text-base"
                        min={1}
                        max={game.gameAvailableStocks}
                      />
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(game.gameAvailableStocks, quantity + 1),
                          )
                        }
                        className="min-w-[44px] min-h-[44px] w-9 h-9 sm:w-10 sm:h-10 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition-colors text-sm sm:text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 sm:gap-3 text-black">
                <button
                  onClick={() => {
                    if (cart.items.length === 0 || !cart.type) {
                      setShowCartTypeModal(true);
                    } else if (cart.type === "purchase") {
                      addToCart(game, quantity, "purchase");
                      router.push("/cart");
                    } else {
                      addToCart(game, quantity, "rental");
                      router.push("/cart");
                    }
                  }}
                  disabled={game.gameAvailableStocks === 0}
                  className={`flex-1 min-h-[44px] py-3 px-4 sm:py-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all ${
                    game.gameAvailableStocks === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {game.gameAvailableStocks === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                <button
                  onClick={() => router.push("/games")}
                  className="min-h-[44px] px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Back to Browse
                </button>
              </div>

              {game.rentalAvailable && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
                  {/* Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl md:text-3xl">🎮</span>
                    <div>
                      <span className="block font-black text-green-900 text-sm sm:text-base md:text-lg">
                        Available for Rental
                      </span>
                      <span className="text-xs sm:text-sm text-green-700">
                        Flexible daily pricing starting at ₱60/day
                      </span>
                    </div>
                  </div>

                  {/* Quick Pricing Preview */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 md:p-3 text-center border border-green-200">
                      <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                        1 Week
                      </div>
                      <div className="text-xs sm:text-sm md:text-lg font-bold text-green-700">
                        {(() => {
                          const config = calculateRentalPrice(
                            game.gamePrice,
                            7,
                          );
                          return formatPrice(config.rentalFee);
                        })()}
                      </div>
                    </div>
                    <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 md:p-3 text-center border border-green-200">
                      <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                        2 Weeks
                      </div>
                      <div className="text-xs sm:text-sm md:text-lg font-bold text-green-700">
                        {(() => {
                          const config = calculateRentalPrice(
                            game.gamePrice,
                            14,
                          );
                          return formatPrice(config.rentalFee);
                        })()}
                      </div>
                    </div>
                    <div className="bg-white rounded-md sm:rounded-lg p-2 sm:p-2.5 md:p-3 text-center border border-green-200">
                      <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
                        1 Month
                      </div>
                      <div className="text-xs sm:text-sm md:text-lg font-bold text-green-700">
                        {(() => {
                          const config = calculateRentalPrice(
                            game.gamePrice,
                            30,
                          );
                          return formatPrice(config.rentalFee);
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-green-800">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span>✓</span>
                      <span>Pay game value upfront (rental + deposit)</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span>✓</span>
                      <span>Get full deposit back on return</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span>✓</span>
                      <span>Rent for any duration (1-30 days)</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (cart.items.length === 0 || !cart.type) {
                        addToCart(game, 1, "rental");
                      } else if (cart.type === "rental") {
                        addToCart(game, 1, "rental");
                      } else {
                        if (
                          confirm(
                            "Your cart contains purchase items. Switch to rental? This will clear your cart.",
                          )
                        ) {
                          addToCart(game, 1, "rental");
                        } else {
                          return;
                        }
                      }
                      router.push("/cart");
                    }}
                    className="w-full min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-sm sm:text-base"
                  >
                    Add to Rental Cart →
                  </button>

                  {/* Secondary Link */}
                  <Link
                    href="/rent-a-game"
                    className="block text-center text-xs sm:text-sm text-green-700 hover:text-green-900 mt-2 sm:mt-3 font-semibold"
                  >
                    Learn more about our rental system
                  </Link>
                </div>
              )}

              <div className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                <div>
                  <span className="font-semibold text-gray-900">
                    Release Date:
                  </span>{" "}
                  {new Date(game.gameReleaseDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Barcode:</span>{" "}
                  {game.gameBarcode}
                </div>
                {game.tradable && (
                  <div className="text-green-700 font-semibold">
                    ✓ Trade-in eligible
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA Bar - Mobile Only */}
      {game.rentalAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-2.5 sm:p-3 md:hidden z-50 shadow-lg">
          <div className="flex gap-1.5 sm:gap-2 max-w-7xl mx-auto px-2 sm:px-3">
            <button
              onClick={() => {
                if (cart.items.length === 0 || !cart.type) {
                  addToCart(game, 1, "rental");
                } else if (cart.type === "rental") {
                  addToCart(game, 1, "rental");
                } else {
                  if (
                    confirm(
                      "Your cart contains purchase items. Switch to rental? This will clear your cart.",
                    )
                  ) {
                    addToCart(game, 1, "rental");
                  } else {
                    return;
                  }
                }
                router.push("/cart");
              }}
              className="flex-1 min-h-[44px] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-lg sm:rounded-xl font-bold shadow-lg active:scale-95 transition-transform text-xs sm:text-sm"
            >
              Add to Rental Cart
              <div className="text-[10px] sm:text-xs opacity-90 mt-0.5">
                From ₱60/day
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Add padding to prevent content being hidden by sticky bar */}
      <div className="h-20 md:hidden"></div>

      {/* Cart Type Selection Modal */}
      {showCartTypeModal && game && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Select Cart Type
            </h2>
            <p className="text-gray-700 mb-6">
              Would you like to purchase, rent, or trade this game?
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  addToCart(game, quantity, "purchase");
                  setShowCartTypeModal(false);
                  router.push("/cart");
                }}
                className="bg-gradient-to-r from-funBlue to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Purchase
              </button>
              <button
                onClick={() => {
                  addToCart(game, quantity, "rental");
                  setShowCartTypeModal(false);
                  router.push("/cart");
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Rent
              </button>
              <button
                onClick={() => {
                  addToCart(game, quantity, "trade");
                  setShowCartTypeModal(false);
                  router.push("/cart");
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Trade
              </button>
              <button
                onClick={() => setShowCartTypeModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
};

export default GameDetailPage;
