"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import GameCardSkeleton from "./GameCardSkeleton";
import ComparisonModal from "./ComparisonModal";
import ErrorState from "../ErrorState";
import { fetchLatestGames } from "@/lib/api-client";
import {
  formatPrice,
  calculateSavings,
  getPlatformInfo,
  getStockUrgency,
  filterNintendoSwitchGames,
} from "./game-utils";
import { getCachedGames, setCachedGames, CACHE_KEYS } from "@/lib/cache-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  initialGames: Game[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ initialGames }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [latestGames, setLatestGames] = useState<Game[]>(initialGames);
  const [isLoading, setIsLoading] = useState(initialGames.length === 0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | Error | null>(null);
  const [fallbackGames, setFallbackGames] = useState<Game[] | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Load games function with caching and error handling
  const loadGames = async (useCache: boolean = true) => {
    setIsLoading(true);
    setError(null);
    setIsRetrying(false);

    // Try to load from cache first if available
    let cachedGames: Game[] | null = null;
    if (useCache) {
      cachedGames = getCachedGames(CACHE_KEYS.LATEST_GAMES);
      if (cachedGames && cachedGames.length > 0) {
        setLatestGames(cachedGames);
        setFallbackGames(cachedGames);
      }
    }

    try {
      const response = await fetchLatestGames(10);
      if (response.success && response.data) {
        setLatestGames(response.data);
        setFallbackGames(null); // Clear fallback since we have fresh data
        // Cache the successful response
        setCachedGames(CACHE_KEYS.LATEST_GAMES, response.data);
      } else {
        // If we have cached data, show it as fallback
        if (cachedGames && cachedGames.length > 0) {
          setLatestGames(cachedGames);
          setFallbackGames(cachedGames);
        }
        setError(response.error || new Error("Failed to load games"));
      }
    } catch (err) {
      console.error("Error loading games:", err);
      // If we have cached data, show it as fallback
      if (cachedGames && cachedGames.length > 0) {
        setLatestGames(cachedGames);
        setFallbackGames(cachedGames);
      }
      setError(err instanceof Error ? err : new Error("Failed to load games"));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  // Retry handler
  const handleRetry = () => {
    setIsRetrying(true);
    loadGames(false); // Don't use cache on retry
  };

  // Fetch games on client side if no initial games provided
  useEffect(() => {
    if (initialGames.length === 0) {
      loadGames(true);
    } else {
      // Cache initial games if provided
      setCachedGames(CACHE_KEYS.LATEST_GAMES, initialGames);
    }
  }, [initialGames.length]);

  const handleAddToCart = (game: Game) => {
    if (game.gameAvailableStocks === 0) return;

    setCartItems((prev) => {
      if (prev.includes(game.gameBarcode)) {
        return prev;
      }
      return [...prev, game.gameBarcode];
    });

    console.log("Added to cart:", game.gameTitle);
  };

  const handleAddToCompare = (game: Game) => {
    setCompareItems((prev) => {
      if (prev.includes(game.gameBarcode)) {
        return prev.filter((barcode) => barcode !== game.gameBarcode);
      }

      if (prev.length >= 2) {
        console.log("Maximum 2 items can be compared");
        return prev;
      }

      return [...prev, game.gameBarcode];
    });

    console.log("Added to compare:", game.gameTitle);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 240;
      const currentScroll = carouselRef.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  // Auto-update current slide for indicators
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollLeft = carouselRef.current.scrollLeft;
        const cardWidth = 240;
        const newSlide = Math.round(scrollLeft / cardWidth);
        setCurrentSlide(newSlide);
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleViewMore = () => {
    console.log("Navigate to /games/latest");
  };

  const isInCart = (barcode: string): boolean => cartItems.includes(barcode);
  const isInCompare = (barcode: string): boolean =>
    compareItems.includes(barcode);

  // Always filter to show only Nintendo Switch games (exclude PS4/PS5)
  const filteredGames = useMemo(() => {
    return filterNintendoSwitchGames(latestGames);
  }, [latestGames]);

  return (
    <section className="min-h-screen w-full  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Diagonal Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-2/3 h-3/4 bg-gradient-to-bl from-blue-100/60 to-transparent transform skew-x-6 origin-top-right"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-red-100/60 to-transparent transform -skew-x-12 origin-bottom-left"></div>
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-purple-100/40 to-transparent transform rotate-45 rounded-full"></div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-50"></div>

      <div className="w-full max-w-full px-8 lg:px-12 xl:px-16 py-20 relative z-10">
        {/* Enhanced Hero Header with Trust Signals */}
        <header className="text-center mb-16 relative max-w-5xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">
              Verified Second-Hand Nintendo Switch Games
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              ⭐⭐⭐⭐⭐
            </div>
          </div>

          <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight relative">
            Latest Game
            <span className=" md:inline text-funBlue transform hover:rotate-1 transition-transform duration-300 inline-block">
              {" "}
              Stocks
            </span>
            {/* Floating decorations around title */}
            <div className="absolute -top-4 right-0 lg:right-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80 animate-bounce">
              <span className="text-lg">🎮</span>
            </div>
            <div className="absolute -bottom-4 left-0 lg:left-8 w-10 h-10 bg-lameRed rounded-full flex items-center justify-center transform -rotate-12 shadow-lg opacity-80">
              <span className="text-white font-bold text-xs">NEW</span>
            </div>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-6">
            Discover our freshly updated Nintendo Switch game collection with
            <span className="font-bold text-funBlue"> 10% savings</span>{" "}
            compared to retail prices
          </p>

          {/* Enhanced Value Proposition Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 transform rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl">
              <span className="">💰</span>
              <span className="font-semibold text-sm text-green-500">
                Best Prices Guaranteed
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-all duration-300 hover:shadow-xl">
              <span className="">⚡</span>
              <span className="font-semibold text-sm text-blue-500">
                Real-time Stock Updates
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 transform rotate-2 hover:rotate-0 transition-all duration-300 hover:shadow-xl">
              <span className="">🎮</span>
              <span className="font-semibold text-sm text-purple-500">
                Quality Tested Games
              </span>
            </div>
          </div>

          <div
            className="mt-8 h-1 w-24 mx-auto rounded-full transform hover:scale-110 transition-transform duration-300"
            style={{
              background: "linear-gradient(to right, #00c3e3, #ff4554)",
            }}
          ></div>
        </header>

        {/* Enhanced Games Carousel Container */}
        <div className="relative mb-16 max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={() => scrollCarousel("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-gray-900 -translate-x-6 hover:scale-110"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
            aria-label="Scroll left"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => scrollCarousel("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-gray-900 translate-x-6 hover:scale-110"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
            aria-label="Scroll right"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Enhanced Carousel Scrollable Container */}
          <div
            ref={carouselRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 md:px-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Error State */}
            {error && !isLoading && (
              <div className="flex-shrink-0 w-full max-w-md">
                <ErrorState
                  error={error}
                  onRetry={handleRetry}
                  isRetrying={isRetrying}
                  fallbackData={fallbackGames}
                />
              </div>
            )}

            {/* Loading State */}
            {isLoading && !error && <GameCardSkeleton count={3} />}

            {/* Empty State */}
            {!isLoading && !error && filteredGames.length === 0 && (
              <div className="flex-shrink-0 w-48 md:w-52 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🎮</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  No Games Available
                </h3>
                <p className="text-gray-600 text-sm">
                  We're currently updating our game collection. Check back soon!
                </p>
              </div>
            )}

            {/* Games List */}
            {!isLoading &&
              !error &&
              filteredGames.length > 0 &&
              filteredGames.map((game: Game, index: number) => {
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
                    className="game-card shadow-lg hover:shadow-2xl group relative flex-shrink-0 w-48 md:w-52 bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 snap-start"
                  >
                    {/* Savings Badge */}
                    {savings.percentage > 0 && (
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        Save {savings.percentage}%
                      </div>
                    )}

                    {/* Stock Urgency Badge */}
                    <div
                      className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-bold border ${stockInfo.bgColor} ${stockInfo.color}`}
                    >
                      {stockInfo.text}
                    </div>

                    {/* Game Image Container */}
                    <Link href={`/games/${game.gameBarcode}`}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <Image
                          src={game.gameImageURL}
                          alt={`${game.gameTitle} game cover`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                          sizes="(max-width: 768px) 192px, 208px"
                        />

                        {/* Overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </Link>

                    {/* Enhanced Card Content */}
                    <div className="p-3 space-y-2">
                      {/* Game Title with better hierarchy */}
                      <div className="min-h-8 flex items-start">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-funBlue transition-colors duration-300 leading-tight">
                          {game.gameTitle}
                        </h3>
                      </div>

                      {/* Enhanced Platform Display */}
                      <div className="flex justify-center">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${platformInfo.color}`}
                        >
                          <span>{platformInfo.icon}</span>
                          <span>{platformInfo.display}</span>
                        </span>
                      </div>

                      {/* Enhanced Pricing Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                        <div className="space-y-1">
                          {game.isOnSale && game.salePrice ? (
                            <>
                              <div className="text-lg md:text-xl font-black text-red-600">
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
                              <div className="text-lg md:text-xl font-black text-funBlue">
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
                        <div className="text-[10px] text-gray-600 font-medium mt-2">
                          💡{" "}
                          {game.isOnSale
                            ? "On Sale - Limited Time Offer"
                            : `${savings.percentage}% below market price`}
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex gap-2 pt-1">
                        {/* Enhanced Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(game)}
                          disabled={game.gameAvailableStocks === 0}
                          className={`flex-1 font-bold py-2 px-3 rounded-xl transition-all duration-300 text-xs shadow-lg hover:shadow-xl ${
                            game.gameAvailableStocks === 0
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : isInCart(game.gameBarcode)
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:-translate-y-1"
                                : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 hover:-translate-y-1"
                          }`}
                          aria-label={`${
                            isInCart(game.gameBarcode)
                              ? "Remove from"
                              : "Add to"
                          } cart: ${game.gameTitle}`}
                        >
                          {game.gameAvailableStocks === 0
                            ? "🚫 Out of Stock"
                            : isInCart(game.gameBarcode)
                              ? "✓ Added to Cart"
                              : "🛒 Add to Cart"}
                        </button>

                        {/* Enhanced Compare Button */}
                        <button
                          onClick={() => handleAddToCompare(game)}
                          disabled={
                            compareItems.length >= 2 &&
                            !isInCompare(game.gameBarcode)
                          }
                          className={`flex-shrink-0 w-10 h-10 font-bold rounded-xl transition-all duration-300 border-2 text-sm shadow-lg hover:shadow-xl ${
                            compareItems.length >= 2 &&
                            !isInCompare(game.gameBarcode)
                              ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                              : isInCompare(game.gameBarcode)
                                ? "bg-gradient-to-r from-lameRed to-pink-500 text-white border-lameRed hover:-translate-y-1"
                                : "border-lameRed text-lameRed hover:bg-lameRed hover:text-white hover:-translate-y-1"
                          }`}
                          aria-label={`${
                            isInCompare(game.gameBarcode)
                              ? "Remove from"
                              : "Add to"
                          } comparison: ${game.gameTitle}`}
                          title={
                            isInCompare(game.gameBarcode)
                              ? "Remove from Compare"
                              : "Add to Compare"
                          }
                        >
                          {isInCompare(game.gameBarcode) ? "✓" : "⚖"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>

          {/* Enhanced Scroll Indicators */}
          {!isLoading && !error && filteredGames.length > 0 && (
            <div className="flex justify-center mt-8 gap-3">
              {Array.from({ length: Math.ceil(filteredGames.length / 3) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (carouselRef.current) {
                        carouselRef.current.scrollTo({
                          left: index * 720,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      Math.floor(currentSlide / 3) === index
                        ? "bg-funBlue scale-125"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  ></button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Enhanced View More Games Section */}
        <div className="text-center relative max-w-5xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl font-black text-gray-400 transform rotate-12">
              GAMES
            </div>
          </div>

          <div className="relative z-10">
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 transform hover:rotate-1 transition-transform duration-300 inline-block">
                Explore Our Complete Collection
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover{" "}
                <span className="font-bold text-funBlue">
                  500+ Nintendo Switch games
                </span>{" "}
                with detailed comparisons, verified quality, and the{" "}
                <span className="font-bold text-green-600">best prices</span> in
                the market.
              </p>
            </div>

            <div className="relative inline-block">
              <button
                onClick={handleViewMore}
                className="group relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:to-gray-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-3xl hover:-translate-y-2 text-lg overflow-hidden transform hover:rotate-1"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-funBlue via-purple-500 to-lameRed opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl group-hover:from-gray-800 group-hover:to-gray-700"></div>

                <Link
                  href="/games"
                  className="relative flex items-center gap-4"
                >
                  <span>View All Latest Games</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:translate-x-2 transition-transform duration-500">
                      →
                    </span>
                    <div className="bg-funBlue w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                      {filteredGames.length}+
                    </div>
                  </div>
                </Link>
              </button>

              {/* Button decorations */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full transform rotate-12"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-lameRed rounded-full transform -rotate-12"></div>
            </div>
          </div>

          {/* Enhanced Trust Signals */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-neutral">
            <div className="bg-white p-6 rounded-2xl shadow-lg border transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm">
                Stock levels updated every minute to ensure availability
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Best Price Promise</h3>
              <p className="text-gray-600 text-sm">
                10% savings compared to retail prices guaranteed
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Tested</h3>
              <p className="text-gray-600 text-sm">
                Every game tested and verified before listing
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Compare Floating Bar */}
        {compareItems.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-lameRed to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-lg">
                  {compareItems.length} game{compareItems.length > 1 ? "s" : ""}{" "}
                  selected for comparison
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-white font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lameRed transform hover:rotate-2"
                  onClick={() => {
                    setIsComparisonModalOpen(true);
                  }}
                >
                  Compare Now ({compareItems.length})
                </button>
                <button
                  className="text-white hover:text-gray-200 transition-colors duration-200 w-10 h-10 rounded-lg hover:bg-red-600 transform hover:rotate-45"
                  onClick={() => setCompareItems([])}
                  aria-label="Clear comparison list"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        <ComparisonModal
          games={filteredGames.filter((game) =>
            compareItems.includes(game.gameBarcode),
          )}
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      </div>
    </section>
  );
};

export default HeroSection;
