"use client";

import React from "react";

const CompareGamesSection = () => {
  const handleCompareClick = () => {
    // TODO: Navigate to compare page
    console.log("Navigate to /compare");
  };

  const comparisonFeatures = [
    {
      category: "PRICE COMPARISON",
      title: "Find the Best Deals Instantly",
      description:
        "Compare prices across all our Nintendo Switch games to get the best value.",
      theme: "light",
    },
    {
      category: "RATINGS & REVIEWS",
      title: "User-Rated Game Quality",
      description:
        "See what other gamers think with detailed ratings and reviews.",
      theme: "light",
    },
    {
      category: "GAME SPECIFICATIONS",
      title: "Compare Game Features Side-by-Side",
      description:
        "Detailed comparison of genres, platforms, and game specifications.",
      theme: "dark",
    },
    {
      category: "STOCK & AVAILABILITY",
      title: "Real-Time Stock Updates",
      description: "Check availability and stock levels across multiple games.",
      theme: "light",
    },
    {
      category: "PLATFORM SUPPORT",
      title: "Nintendo Switch Compatibility Check",
      description: "Verify which games work on Nintendo Switch and Switch 2.",
      theme: "light",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden w-full">
      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>

      <div className="w-full  px-8 lg:px-12 xl:px-16 relative z-10 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto">
          <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-2">
            ⚖️ GAME COMPARISON
          </div>
          <h2 className="text-4xl font-bold text-neutral mb-6">
            Compare Games Like a Pro
          </h2>

          {/* Floating decorations around header */}
          <div className="absolute -top-4 right-0 lg:right-8 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80">
            <span className="text-lg">🎮</span>
          </div>
          <div className="absolute -bottom-4 left-0 lg:left-8 w-10 h-10 bg-lameRed rounded-full flex items-center justify-center transform -rotate-12 shadow-lg opacity-80">
            <span className="text-white font-bold text-xs">VS</span>
          </div>
        </div>

        {/* Enhanced Asymmetrical Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 relative max-w-8xl mx-auto px-4">
          {/* Card 1 - Regular with rotation */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-rotate-1 hover:-translate-y-2">
            <div className="text-xs font-semibold text-funBlue tracking-wider uppercase mb-4 transform rotate-1">
              {comparisonFeatures[0].category}
            </div>
            <h3 className="text-xl font-bold text-neutral mb-4">
              {comparisonFeatures[0].title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {comparisonFeatures[0].description}
            </p>
          </div>

          {/* Card 2 - Regular with rotation */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform rotate-1 hover:rotate-0 hover:-translate-y-2">
            <div className="text-xs font-semibold text-lameRed tracking-wider uppercase mb-4 transform -rotate-1">
              {comparisonFeatures[1].category}
            </div>
            <h3 className="text-xl font-bold text-neutral mb-4">
              {comparisonFeatures[1].title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {comparisonFeatures[1].description}
            </p>
          </div>

          {/* Card 3 - Dark Theme, Tall with enhanced effects */}
          <div className="bg-neutral rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 md:row-span-2 border border-gray-700 transform -rotate-2 hover:rotate-0 hover:-translate-y-3 relative">
            <div className="text-xs font-semibold text-funBlue tracking-wider uppercase mb-4 transform rotate-2">
              {comparisonFeatures[2].category}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              {comparisonFeatures[2].title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              {comparisonFeatures[2].description}
            </p>

            {/* Enhanced comparison preview */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-600 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Genre</span>
                  <div className="flex gap-2">
                    <span className="bg-funBlue text-white px-2 py-1 rounded text-xs font-semibold transform -rotate-2">
                      RPG
                    </span>
                    <span className="bg-lameRed text-white px-2 py-1 rounded text-xs font-semibold transform rotate-2">
                      Action
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Platform</span>
                  <div className="flex gap-2">
                    <span className="bg-success text-white px-2 py-1 rounded text-xs font-semibold transform rotate-1">
                      Switch
                    </span>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold transform -rotate-1">
                      Switch 2
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Price Range</span>
                  <div className="flex gap-2">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      ₱800 - ₱1900
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating element on dark card */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-funBlue rounded-full flex items-center justify-center transform rotate-45 shadow-lg">
              <span className="text-white text-xs font-bold">⚖</span>
            </div>
          </div>

          {/* Card 4 - Regular with rotation */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform -rotate-1 hover:rotate-0 hover:-translate-y-2">
            <div className="text-xs font-semibold text-success tracking-wider uppercase mb-4 transform rotate-2">
              {comparisonFeatures[3].category}
            </div>
            <h3 className="text-xl font-bold text-neutral mb-4">
              {comparisonFeatures[3].title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {comparisonFeatures[3].description}
            </p>
          </div>

          {/* Card 5 - Regular with rotation */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform rotate-2 hover:rotate-0 hover:-translate-y-2">
            <div className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-4 transform -rotate-2">
              {comparisonFeatures[4].category}
            </div>
            <h3 className="text-xl font-bold text-neutral mb-4">
              {comparisonFeatures[4].title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {comparisonFeatures[4].description}
            </p>
          </div>

          {/* Additional floating decorations */}
          <div className="absolute top-1/4 left-0 w-6 h-6 bg-funBlue rounded-full opacity-60 transform rotate-45"></div>
          <div className="absolute bottom-1/4 right-0 w-8 h-8 bg-lameRed rounded-full opacity-60 transform -rotate-12"></div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center relative max-w-4xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-8xl font-black text-gray-400 transform -rotate-12">
              COMPARE
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative inline-block">
              <button
                onClick={handleCompareClick}
                className="group bg-funBlue hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2 inline-flex items-center gap-3 transform hover:rotate-1"
              >
                <span>Start Comparing Games Now</span>
                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                  <svg
                    className="w-4 h-4"
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
                </div>
              </button>

              {/* Button decorations */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full transform rotate-12"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-lameRed rounded-full transform -rotate-12"></div>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Compare up to 4 Nintendo Switch games •
              <span className="text-funBlue font-semibold">
                {" "}
                Real-time pricing
              </span>{" "}
              •
              <span className="text-lameRed font-semibold">
                {" "}
                Detailed specifications
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompareGamesSection;
