"use client";

import React from "react";
import { useRouter } from "next/navigation";

const RentalsSection = () => {
  const router = useRouter();

  const rentalBenefits = [
    {
      icon: "📅",
      title: "Flexible Duration",
      description: "Rent from 1 day to 1 month",
      color: "from-funBlue to-blue-500",
    },
    {
      icon: "💰",
      title: "Affordable Rates",
      description: "Starting at just ₱60/day",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: "🔄",
      title: "Refundable Deposit",
      description: "Get your deposit back on return",
      color: "from-purple-500 to-indigo-600",
    },
    {
      icon: "🎯",
      title: "Try Before You Buy",
      description: "Test games before purchasing",
      color: "from-lameRed to-pink-500",
    },
    {
      icon: "🎮",
      title: "Latest Titles",
      description: "Access newest Switch releases",
      color: "from-orange-500 to-red-500",
    },
  ];

  const pricingTiers = [
    {
      tier: "Budget Tier",
      gameValue: "₱1,200",
      weeklyRate: "₱300",
      dailyRate: "₱60",
      description: "Perfect for casual gaming",
      popular: false,
    },
    {
      tier: "Standard Tier",
      gameValue: "₱1,500",
      weeklyRate: "₱350",
      dailyRate: "₱70",
      description: "Most popular choice",
      popular: true,
    },
    {
      tier: "Premium Tier",
      gameValue: "₱1,900",
      weeklyRate: "₱400",
      dailyRate: "₱80",
      description: "Latest AAA titles",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden w-full">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-blue-50 to-transparent transform -skew-x-12 origin-top-left" />
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-red-50 to-transparent transform skew-x-6 origin-bottom-right"></div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>

      <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-funBlue to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            🎮 Game Rentals
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Rent Games,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-funBlue to-blue-500">
              Not Just Buy
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the latest Nintendo Switch games without breaking the
            bank. Flexible rental plans with affordable rates and refundable
            deposits.
          </p>
        </div>

        {/* Rental Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {rentalBenefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}
              >
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers Preview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Transparent Pricing
            </h3>
            <p className="text-lg text-gray-600">
              Choose from three game tiers with flexible rental durations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  tier.popular
                    ? "border-funBlue shadow-xl scale-105"
                    : "border-gray-200 hover:border-funBlue"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-funBlue to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {tier.tier}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {tier.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Game Value</div>
                    <div className="text-2xl font-black text-gray-900">
                      {tier.gameValue}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Weekly Rate:
                      </span>
                      <span className="text-lg font-bold text-funBlue">
                        {tier.weeklyRate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Rate:</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {tier.dailyRate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => router.push("/rent-a-game")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-funBlue to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Explore Rental Options</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <p className="text-sm text-gray-600 mt-4">
            No hidden fees • Instant approval • Flexible returns
          </p>
        </div>
      </div>
    </section>
  );
};

export default RentalsSection;
