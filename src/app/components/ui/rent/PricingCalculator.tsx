"use client";

import React, { useState } from "react";
import { calculateDepositBreakdown, formatPrice } from "@/lib/game-utils";
import { rentalContent } from "@/config/rental-content";
import { siteConfig } from "@/config/site";

export function PricingCalculator() {
  const { pricingCalculator } = rentalContent;
  const [gamePrice, setGamePrice] = useState(
    siteConfig.rental.rates.tier1.gamePrice
  );
  const [weeks, setWeeks] = useState(2);

  const breakdown = calculateDepositBreakdown(gamePrice, weeks);

  return (
    <section
      id="pricing-calculator"
      className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden w-full"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-lameRed/20 to-transparent transform -skew-x-6 origin-bottom-right" />
        <div className="absolute top-1/3 right-1/4 w-1/4 h-1/4 bg-gradient-to-br from-success/30 to-transparent transform rotate-45 rounded-full" />
      </div>

      <div className="w-full px-8 lg:px-12 xl:px-16 relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-lameRed text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-1">
            💰 {pricingCalculator.title}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {pricingCalculator.subtitle}
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 transform hover:rotate-1 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Game Price Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {pricingCalculator.gamePriceLabel}
              </label>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    setGamePrice(siteConfig.rental.rates.tier1.gamePrice)
                  }
                  className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    gamePrice === siteConfig.rental.rates.tier1.gamePrice
                      ? "bg-gradient-to-r from-funBlue to-blue-500 text-white border-funBlue shadow-lg scale-105"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-funBlue hover:bg-funBlue/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {formatPrice(siteConfig.rental.rates.tier1.gamePrice)}{" "}
                      Games
                    </span>
                    <span className="text-sm">
                      {formatPrice(siteConfig.rental.rates.tier1.weeklyRate)}
                      /week
                    </span>
                  </div>
                </button>
                <button
                  onClick={() =>
                    setGamePrice(siteConfig.rental.rates.tier2.gamePrice)
                  }
                  className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    gamePrice === siteConfig.rental.rates.tier2.gamePrice
                      ? "bg-gradient-to-r from-funBlue to-blue-500 text-white border-funBlue shadow-lg scale-105"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-funBlue hover:bg-funBlue/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {formatPrice(siteConfig.rental.rates.tier2.gamePrice)}{" "}
                      Games
                    </span>
                    <span className="text-sm">
                      {formatPrice(siteConfig.rental.rates.tier2.weeklyRate)}
                      /week
                    </span>
                  </div>
                </button>
                <button
                  onClick={() =>
                    setGamePrice(siteConfig.rental.rates.tier3.gamePrice)
                  }
                  className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                    gamePrice === siteConfig.rental.rates.tier3.gamePrice
                      ? "bg-gradient-to-r from-funBlue to-blue-500 text-white border-funBlue shadow-lg scale-105"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-funBlue hover:bg-funBlue/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {formatPrice(siteConfig.rental.rates.tier3.gamePrice)}{" "}
                      Games
                    </span>
                    <span className="text-sm">
                      {formatPrice(siteConfig.rental.rates.tier3.weeklyRate)}
                      /week
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {pricingCalculator.durationLabel}
              </label>
              <div className="space-y-3">
                {pricingCalculator.durations.map((duration) => (
                  <button
                    key={duration.weeks}
                    onClick={() => setWeeks(duration.weeks)}
                    className={`w-full px-6 py-4 rounded-xl font-bold transition-all duration-300 border-2 relative ${
                      weeks === duration.weeks
                        ? "bg-gradient-to-r from-lameRed to-pink-500 text-white border-lameRed shadow-lg scale-105"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-lameRed hover:bg-lameRed/5"
                    }`}
                  >
                    {duration.label}
                    {duration.popular && weeks !== duration.weeks && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown Display */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-black text-neutral mb-6 text-center">
              Cost Breakdown
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-gray-700 font-medium">
                  {pricingCalculator.breakdownLabels.totalRent}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(breakdown.rentalCost)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-300">
                <span className="text-gray-700 font-medium">
                  {pricingCalculator.breakdownLabels.deposit}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(breakdown.deposit)}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 bg-gradient-to-r from-funBlue/10 to-blue-100 rounded-xl px-4 border-2 border-funBlue">
                <span className="text-funBlue font-bold text-lg">
                  {pricingCalculator.breakdownLabels.upfront}
                </span>
                <span className="text-3xl font-black text-funBlue">
                  {formatPrice(breakdown.upfrontTotal)}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl px-4 border-2 border-success">
                <span className="text-success font-bold text-lg">
                  {pricingCalculator.breakdownLabels.refund}
                </span>
                <span className="text-3xl font-black text-success">
                  {formatPrice(breakdown.refundAmount)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-gray-700 text-center">
                💡 {pricingCalculator.note}
              </p>
            </div>
          </div>
        </div>

        {/* Decorations */}
        <div className="absolute -top-3 right-8 w-8 h-8 bg-funBlue rounded-full transform rotate-45 shadow-lg" />
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-lameRed rounded-full transform -rotate-12 shadow-lg" />
      </div>
    </section>
  );
}
