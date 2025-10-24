"use client";

import React, { useState, useEffect } from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { rentalContent } from "@/config/rental-content";
import {
  calculateRentalPrice,
  getAvailableGameTiers,
  formatRentalPrice,
  getRentalDurationOptions,
  type RentalCalculation,
} from "@/lib/rental-pricing";

export function PricingCalculator() {
  const { pricingCalculator } = rentalContent;
  const [selectedGamePrice, setSelectedGamePrice] = useState<number>(1500);
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  });
  const [calculation, setCalculation] = useState<RentalCalculation | null>(
    null,
  );

  const gameTiers = getAvailableGameTiers();
  const durationOptions = getRentalDurationOptions();

  // Calculate rental days from date range
  const rentalDays = (() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(30, diffDays));
  })();

  // Calculate pricing whenever game price or dates change
  useEffect(() => {
    try {
      const result = calculateRentalPrice(selectedGamePrice, rentalDays);
      setCalculation(result);
    } catch (error) {
      console.error("Error calculating rental price:", error);
    }
  }, [selectedGamePrice, rentalDays]);

  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGamePrice(Number(e.target.value));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Update end date if it's before the new start date
    const start = new Date(newStartDate);
    const end = new Date(endDate);
    if (end <= start) {
      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() + 7);
      setEndDate(newEnd.toISOString().split("T")[0]);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    const start = new Date(startDate);
    const end = new Date(newEndDate);
    const maxEnd = new Date(start);
    maxEnd.setDate(start.getDate() + 30);

    if (end <= start) {
      // End date cannot be before or same as start date
      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() + 1);
      setEndDate(newEnd.toISOString().split("T")[0]);
    } else if (end > maxEnd) {
      // End date cannot be more than 30 days from start
      setEndDate(maxEnd.toISOString().split("T")[0]);
    } else {
      setEndDate(newEndDate);
    }
  };

  const handleDurationOptionClick = (days: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Get minimum and maximum dates for date inputs
  const today = new Date().toISOString().split("T")[0];
  const maxStartDate = new Date();
  maxStartDate.setDate(maxStartDate.getDate() + 30);
  const maxStartDateStr = maxStartDate.toISOString().split("T")[0];

  const minEndDate = new Date(startDate);
  minEndDate.setDate(minEndDate.getDate() + 1);
  const minEndDateStr = minEndDate.toISOString().split("T")[0];

  const maxEndDate = new Date(startDate);
  maxEndDate.setDate(maxEndDate.getDate() + 30);
  const maxEndDateStr = maxEndDate.toISOString().split("T")[0];

  return (
    <SectionWrapper variant="white">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform -rotate-2">
            💰 PRICING CALCULATOR
          </div>
          <h2 className="text-4xl font-black text-neutral mb-4">
            {pricingCalculator.title}
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            {pricingCalculator.subtitle}
          </p>
          <p className="text-sm text-gray-600">{pricingCalculator.note}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-lg border-2 border-gray-200 transform rotate-1 hover:rotate-0 transition-all duration-300">
            <h3 className="text-2xl font-bold text-neutral mb-6">
              Rental Details
            </h3>

            {/* Game Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {pricingCalculator.gamePriceLabel}
              </label>
              <select
                value={selectedGamePrice}
                onChange={handleGameChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300 text-lg font-semibold text-gray-600"
              >
                {gameTiers.map((tier) => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Input */}
            <div className="mb-6 text-gray-600">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rental Period
              </label>
              <div className="space-y-4">
                {/* Date Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      min={today}
                      max={maxStartDateStr}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300 text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      min={minEndDateStr}
                      max={maxEndDateStr}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all duration-300 text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Calculated Duration Display */}
                <div className="bg-funBlue text-white rounded-xl p-4 text-center">
                  <div className="text-sm font-semibold mb-1">Duration</div>
                  <div className="text-2xl font-black">
                    {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
                  </div>
                </div>

                {/* Quick Duration Options */}
                <div className="grid grid-cols-2 gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDurationOptionClick(option.value)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        rentalDays === option.value
                          ? "bg-funBlue text-white shadow-lg"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-funBlue hover:text-funBlue"
                      } ${option.popular ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      {option.label}
                      {option.popular && (
                        <span className="ml-1 text-xs">⭐</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Selection Summary */}
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-1">Selected Game</p>
                <p className="text-lg font-bold text-neutral">
                  {formatRentalPrice(selectedGamePrice)} Value
                </p>
                <p className="text-sm text-gray-700 mt-2">Rental Period</p>
                <p className="text-sm text-gray-600">
                  {new Date(startDate).toLocaleDateString()} -{" "}
                  {new Date(endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-funBlue to-blue-500 rounded-3xl p-8 shadow-2xl text-white transform -rotate-1 hover:rotate-0 transition-all duration-300">
            <h3 className="text-2xl font-bold mb-6">Rental Breakdown</h3>

            {calculation ? (
              <div className="space-y-6">
                {/* Applied Plan */}
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-sm text-white mb-1">Applied Plan</div>
                  <div className="text-xl font-bold">
                    {calculation.appliedPlan}
                  </div>
                </div>

                {/* Rental Fee */}
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white mb-1">Rental Fee</div>
                      <div className="text-xs text-blue-100">
                        {rentalDays} {rentalDays === 1 ? "day" : "days"} rental
                      </div>
                    </div>
                    <div className="text-2xl font-black">
                      {formatRentalPrice(calculation.rentalFee)}
                    </div>
                  </div>
                </div>

                {/* Deposit */}
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-white mb-1">
                        Refundable Deposit
                      </div>
                      <div className="text-xs text-blue-100">
                        Returned when game is returned
                      </div>
                    </div>
                    <div className="text-2xl font-black">
                      {formatRentalPrice(calculation.deposit)}
                    </div>
                  </div>
                </div>

                {/* Total Due */}
                <div className="bg-white rounded-xl p-6 text-neutral">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-2">
                      Total Due Upfront
                    </div>
                    <div className="text-4xl font-black text-neutral mb-2">
                      {formatRentalPrice(calculation.totalDue)}
                    </div>
                    <div className="text-sm text-gray-700">
                      You get back {formatRentalPrice(calculation.deposit)}{" "}
                      after return
                    </div>
                  </div>
                </div>

                {/* Promo Message */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-neutral">
                  <div className="text-center">
                    <div className="text-sm font-bold mb-1">🎉</div>
                    <div className="text-sm font-semibold">
                      {calculation.promoMessage}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button className="w-full bg-white text-funBlue font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                    Contact Us to Rent
                  </button>
                  <button className="w-full bg-white/20 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/30 transition-colors duration-300 border-2 border-white/30">
                    Browse Available Games
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Calculating best rate...</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200">
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              💡 How Our Pricing Works
            </h4>
            <p className="text-gray-800 text-sm leading-relaxed max-w-3xl mx-auto">
              We automatically apply the best rate for your rental duration. For
              1-6 days, you pay the daily rate. For 7+ days, we apply weekly,
              bi-weekly, or monthly rates with pro-rated calculations. No need
              to choose a plan—we always give you the best deal!
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
