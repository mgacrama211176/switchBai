import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import gamesData from "@/app/data/games.json";
import { Game } from "@/app/types/games";

const HeroSection = () => {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Sort games by updatedAt to get the latest stocks (most recent first) - limit to 10
  const latestGames = [...gamesData.games]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 10);

  const formatPrice = (price: number): string => {
    return `₱${price.toLocaleString()}`;
  };

  // Calculate savings based on 10% discount (deterministic to prevent hydration errors)
  const calculateSavings = (
    price: number,
    gameBarcode: string,
  ): { original: number; savings: number; percentage: number } => {
    const savingsPercentage = 10; // Fixed 10% savings
    const originalPrice = Math.round(price / (1 - savingsPercentage / 100));
    const savings = originalPrice - price;
    return { original: originalPrice, savings, percentage: savingsPercentage };
  };

  // Helper function to handle platform display
  const getPlatformInfo = (platform: string | string[]) => {
    const platforms = Array.isArray(platform) ? platform : [platform];

    if (platforms.length === 1) {
      if (platforms[0] === "Nintendo Switch") {
        return {
          display: "Nintendo Switch",
          color: "bg-gradient-to-r from-red-500 to-blue-500 text-white",
          icon: "🎮",
        };
      } else if (platforms[0] === "Nintendo Switch 2") {
        return {
          display: "Switch 2",
          color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
          icon: "✨",
        };
      }
    }

    if (
      platforms.includes("Nintendo Switch") &&
      platforms.includes("Nintendo Switch 2")
    ) {
      return {
        display: "Switch & Switch 2",
        color: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
        icon: "🎮✨",
      };
    }

    return {
      display: platforms.join(", "),
      color: "bg-gray-100 text-gray-700",
      icon: "🎮",
    };
  };

  // Enhanced stock urgency indicator
  const getStockUrgency = (stock: number) => {
    if (stock === 0) {
      return {
        text: "Out of Stock",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
      };
    } else if (stock <= 3) {
      return {
        text: `Only ${stock} left!`,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
      };
    } else if (stock <= 8) {
      return {
        text: `${stock} in stock`,
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
      };
    } else {
      return {
        text: `${stock} available`,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
      };
    }
  };

  // Use actual numberOfSold from JSON or fallback to generated number
  const getNumberOfSold = (game: Game): number => {
    if (game.numberOfSold) {
      return game.numberOfSold;
    }
    const seed = game.gameBarcode
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.floor((seed % 50) + 10);
  };

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

      if (prev.length >= 4) {
        console.log("Maximum 4 items can be compared");
        return prev;
      }

      return [...prev, game.gameBarcode];
    });

    console.log("Added to compare:", game.gameTitle);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
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
        const cardWidth = 320;
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

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
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
            <span className="block md:inline text-funBlue transform hover:rotate-1 transition-transform duration-300 inline-block">
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
        <div className="relative mb-16">
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
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-8 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {latestGames.map((game, index) => {
              const platformInfo = getPlatformInfo(game.gamePlatform);
              const stockInfo = getStockUrgency(game.gameAvailableStocks);
              const savings = calculateSavings(
                game.gamePrice,
                game.gameBarcode,
              );
              const soldCount = getNumberOfSold(game);

              return (
                <article
                  key={`${game.gameBarcode}-${index}`}
                  className="game-card shadow-lg hover:shadow-2xl group relative flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 snap-start"
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
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      src={game.gameImageURL}
                      alt={`${game.gameTitle} game cover`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="320px"
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Enhanced Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Game Title with better hierarchy */}
                    <div className="h-12 flex items-start">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-funBlue transition-colors duration-300 leading-tight">
                        {game.gameTitle}
                      </h3>
                    </div>

                    {/* Enhanced Platform Display */}
                    <div className="flex justify-center">
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-full flex items-center gap-2 ${platformInfo.color}`}
                      >
                        <span>{platformInfo.icon}</span>
                        <span>{platformInfo.display}</span>
                      </span>
                    </div>

                    {/* Category & Rating with better styling */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border">
                        {game.gameCategory}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Rated {game.gameRatings}
                      </span>
                    </div>

                    {/* Social Proof - Sales Stats */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">📈</span>
                          <span className="font-semibold text-gray-700">
                            {soldCount} sold
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated{" "}
                          {new Date(game.updatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Pricing Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-3xl font-black text-funBlue">
                          {formatPrice(game.gamePrice)}
                        </div>
                        {savings.percentage > 0 && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(savings.original)}
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              Save ₱{savings.savings.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        💡 {savings.percentage}% below market price
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      {/* Enhanced Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(game)}
                        disabled={game.gameAvailableStocks === 0}
                        className={`flex-1 font-bold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl ${
                          game.gameAvailableStocks === 0
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : isInCart(game.gameBarcode)
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:-translate-y-1"
                              : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 hover:-translate-y-1"
                        }`}
                        aria-label={`${
                          isInCart(game.gameBarcode) ? "Remove from" : "Add to"
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
                          compareItems.length >= 4 &&
                          !isInCompare(game.gameBarcode)
                        }
                        className={`flex-shrink-0 w-12 h-12 font-bold rounded-xl transition-all duration-300 border-2 text-sm shadow-lg hover:shadow-xl ${
                          compareItems.length >= 4 &&
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
          <div className="flex justify-center mt-8 gap-3">
            {Array.from({ length: Math.ceil(latestGames.length / 3) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollTo({
                        left: index * 960,
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

                <span className="relative flex items-center gap-4">
                  <span>View All Latest Games</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:translate-x-2 transition-transform duration-500">
                      →
                    </span>
                    <div className="bg-funBlue w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                      {latestGames.length}+
                    </div>
                  </div>
                </span>
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
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-lameRed to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom duration-500 hover:scale-105 transition-transform duration-300">
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
                    console.log(
                      "Navigate to compare with items:",
                      compareItems,
                    );
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
      </div>
    </section>
  );
};

export default HeroSection;
