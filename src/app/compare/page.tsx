"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import { fetchGames } from "@/lib/api-client";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import {
  formatPrice,
  calculateSavings,
  getPlatformInfo,
  getStockUrgency,
} from "@/app/components/ui/home/game-utils";

const ComparePage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch games on component mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        const response = await fetchGames({ limit: 100, page: 1 }); // Get more games for comparison
        if (response.success && response.data) {
          setGames(response.data.games);
        } else {
          setError("Failed to load games");
        }
      } catch (err) {
        setError("An error occurred while loading games");
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  // Filter games based on search query
  const filteredGames = games.filter(
    (game) =>
      game.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.gameCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.gameDescription.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle game selection
  const handleGameSelect = (game: Game) => {
    if (selectedGames.length >= 2) {
      alert("You can only compare up to 2 games at a time");
      return;
    }

    if (selectedGames.some((g) => g.gameBarcode === game.gameBarcode)) {
      alert("This game is already selected for comparison");
      return;
    }

    setSelectedGames((prev) => [...prev, game]);
  };

  // Handle game removal
  const handleGameRemove = (barcode: string) => {
    setSelectedGames((prev) =>
      prev.filter((game) => game.gameBarcode !== barcode),
    );
  };

  // Handle add to cart
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

  // Handle reset
  const handleReset = () => {
    setSelectedGames([]);
  };

  // Check if game is in cart
  const isInCart = (barcode: string): boolean => cartItems.includes(barcode);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-2/3 h-3/4 bg-gradient-to-bl from-blue-100/60 to-transparent transform skew-x-6 origin-top-right"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-red-100/60 to-transparent transform -skew-x-12 origin-bottom-left"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">
                Compare up to 2 games
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              Compare{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-funBlue to-blue-500">
                Games
              </span>
            </h1>
            <p className="text-2xl text-gray-600 mb-4 leading-relaxed">
              Find the perfect game by comparing features and prices
            </p>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Make informed decisions with detailed side-by-side comparisons
            </p>

            {/* Search Bar */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search games by title, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-funBlue/20 focus:border-funBlue transition-all duration-300 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Selection Area */}
      <section className="py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Select Games to Compare
            </h2>
            <p className="text-xl text-gray-600">
              Choose up to 2 games from our collection
            </p>
          </div>

          {/* Game Selection Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[0, 1].map((slot) => {
              const game = selectedGames[slot];
              return (
                <div
                  key={slot}
                  className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center"
                >
                  {game ? (
                    <div className="w-full">
                      {/* Selected Game */}
                      <div className="bg-white rounded-xl p-6 shadow-lg border">
                        <div className="flex gap-4">
                          <div className="w-24 h-32 relative flex-shrink-0">
                            <Image
                              src={game.gameImageURL}
                              alt={game.gameTitle}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {game.gameTitle}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600">
                                {getPlatformInfo(game.gamePlatform).display}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">
                                {game.gameCategory}
                              </span>
                            </div>
                            <div className="text-xl font-bold text-funBlue mb-2">
                              {formatPrice(game.gamePrice)}
                            </div>
                            <button
                              onClick={() => handleGameRemove(game.gameBarcode)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Remove from comparison
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg mb-4">
                        Slot {slot + 1} - Select a game
                      </p>
                      <p className="text-gray-400 text-sm">
                        Choose from the games below
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reset Button */}
          {selectedGames.length > 0 && (
            <div className="text-center mb-8">
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors duration-300"
              >
                Reset Comparison
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Game Search Results */}
      {searchQuery && (
        <section className="py-16 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Search Results ({filteredGames.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funBlue mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading games...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No games found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.slice(0, 8).map((game) => {
                  const platformInfo = getPlatformInfo(game.gamePlatform);
                  const stockInfo = getStockUrgency(game.gameAvailableStocks);
                  const savings = calculateSavings(
                    game.gamePrice,
                    game.gameBarcode,
                  );
                  const isSelected = selectedGames.some(
                    (g) => g.gameBarcode === game.gameBarcode,
                  );

                  return (
                    <div
                      key={game.gameBarcode}
                      className={`bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 ${
                        isSelected ? "ring-2 ring-funBlue" : ""
                      }`}
                    >
                      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl">
                        <Image
                          src={game.gameImageURL}
                          alt={game.gameTitle}
                          fill
                          className="object-cover"
                        />
                        {savings.percentage > 0 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Save {savings.percentage}%
                          </div>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {game.gameTitle}
                      </h4>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">
                          {platformInfo.display}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {game.gameCategory}
                        </span>
                      </div>

                      <div className="text-xl font-bold text-funBlue mb-2">
                        {formatPrice(game.gamePrice)}
                      </div>

                      <div
                        className={`text-xs font-bold px-2 py-1 rounded-full ${stockInfo.bgColor} ${stockInfo.color}`}
                      >
                        {stockInfo.text}
                      </div>

                      <button
                        onClick={() => handleGameSelect(game)}
                        disabled={isSelected || selectedGames.length >= 2}
                        className={`w-full mt-4 py-2 px-4 rounded-xl font-bold transition-all duration-300 ${
                          isSelected
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : selectedGames.length >= 2
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : "bg-funBlue text-white hover:bg-blue-600"
                        }`}
                      >
                        {isSelected ? "Selected" : "Add to Compare"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Comparison Table */}
      {selectedGames.length > 0 && (
        <section className="py-20 bg-white">
          <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Game Comparison
              </h2>
              <p className="text-xl text-gray-600">
                Detailed side-by-side comparison
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-funBlue to-blue-500 text-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedGames.map((game, index) => (
                    <div key={game.gameBarcode} className="text-center">
                      <h3 className="text-2xl font-bold mb-2">
                        Game {index + 1}
                      </h3>
                      <p className="text-blue-100">{game.gameTitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedGames.map((game, index) => {
                    const platformInfo = getPlatformInfo(game.gamePlatform);
                    const stockInfo = getStockUrgency(game.gameAvailableStocks);
                    const savings = calculateSavings(
                      game.gamePrice,
                      game.gameBarcode,
                    );

                    return (
                      <div key={game.gameBarcode} className="space-y-6">
                        {/* Game Image */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                          <Image
                            src={game.gameImageURL}
                            alt={game.gameTitle}
                            fill
                            className="object-cover"
                          />
                          {savings.percentage > 0 && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              Save {savings.percentage}%
                            </div>
                          )}
                        </div>

                        {/* Game Details */}
                        <div className="space-y-4">
                          {/* Title */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Title
                            </h4>
                            <p className="text-xl font-bold text-gray-900">
                              {game.gameTitle}
                            </p>
                          </div>

                          {/* Platform */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Platform
                            </h4>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${platformInfo.color}`}
                            >
                              <span>{platformInfo.icon}</span>
                              <span>{platformInfo.display}</span>
                            </span>
                          </div>

                          {/* Category & Rating */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                                Category
                              </h4>
                              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                {game.gameCategory}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                                Rating
                              </h4>
                              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                {game.gameRatings}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Price
                            </h4>
                            <div className="space-y-1">
                              <div className="text-2xl font-black text-funBlue">
                                {formatPrice(game.gamePrice)}
                              </div>
                              {savings.percentage > 0 && (
                                <div className="text-sm text-gray-500">
                                  <span className="line-through">
                                    {formatPrice(savings.original)}
                                  </span>
                                  <span className="ml-2 text-green-600 font-bold">
                                    Save ₱{savings.savings.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stock */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Availability
                            </h4>
                            <span
                              className={`text-sm font-bold px-3 py-1 rounded-full ${stockInfo.bgColor} ${stockInfo.color}`}
                            >
                              {stockInfo.text}
                            </span>
                          </div>

                          {/* Release Date */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Release Date
                            </h4>
                            <p className="text-sm text-gray-700">
                              {new Date(
                                game.gameReleaseDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-500 mb-1">
                              Description
                            </h4>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {game.gameDescription}
                            </p>
                          </div>

                          {/* Rental Info */}
                          {game.rentalAvailable && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                                Rental
                              </h4>
                              <p className="text-sm text-gray-700">
                                Available • ₱{game.rentalWeeklyRate}/week
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-4 space-y-2">
                            <button
                              onClick={() => handleAddToCart(game)}
                              disabled={game.gameAvailableStocks === 0}
                              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 ${
                                game.gameAvailableStocks === 0
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : isInCart(game.gameBarcode)
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                    : "bg-gradient-to-r from-funBlue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600"
                              }`}
                            >
                              {game.gameAvailableStocks === 0
                                ? "🚫 Out of Stock"
                                : isInCart(game.gameBarcode)
                                  ? "✓ Added to Cart"
                                  : "🛒 Add to Cart"}
                            </button>

                            <button
                              onClick={() => handleGameRemove(game.gameBarcode)}
                              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors duration-300"
                            >
                              Remove from Comparison
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {selectedGames.length === 0 && !searchQuery && (
        <section className="py-20 bg-gray-50">
          <div className="w-full max-w-4xl mx-auto px-8 text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Compare Games?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Search for games above or browse our collection to start comparing
              features, prices, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/games"
                className="bg-funBlue text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-600 transition-colors duration-300"
              >
                Browse All Games
              </a>
              <button
                onClick={() => {
                  const input = document.querySelector(
                    'input[type="text"]',
                  ) as HTMLInputElement;
                  input?.focus();
                }}
                className="bg-white text-funBlue font-bold py-4 px-8 rounded-xl border-2 border-funBlue hover:bg-funBlue hover:text-white transition-all duration-300"
              >
                Start Searching
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default ComparePage;
