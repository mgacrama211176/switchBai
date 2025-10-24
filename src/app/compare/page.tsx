"use client";

import React from "react";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { useGameComparison } from "./hooks/useGameComparison";
import { SearchResults } from "./components/SearchResults";
import { GameSelectionSlot } from "./components/GameSelectionSlot";
import { GameComparisonTable } from "./components/GameComparisonTable";

const ComparePage = () => {
  const {
    selectedGames,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    filteredGames,
    handleGameSelect,
    handleGameRemove,
    handleReset,
    handleAddToCart,
    isInCart,
  } = useGameComparison();

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
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-funBlue/20 focus:border-funBlue transition-all duration-300 shadow-lg text-black"
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
            {[0, 1].map((slot) => (
              <GameSelectionSlot
                key={slot}
                game={selectedGames[slot] || null}
                slotNumber={slot + 1}
                onRemove={handleGameRemove}
              />
            ))}
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

            <SearchResults
              games={filteredGames}
              selectedGames={selectedGames}
              cartItems={[]} // Not used in search results
              isLoading={isLoading}
              error={error}
              onGameSelect={handleGameSelect}
              onAddToCart={handleAddToCart}
            />
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

            <GameComparisonTable
              selectedGames={selectedGames}
              cartItems={[]} // Not used in comparison table
              onAddToCart={handleAddToCart}
              onRemoveGame={handleGameRemove}
              isInCart={isInCart}
            />
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
