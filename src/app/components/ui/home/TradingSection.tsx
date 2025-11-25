"use client";

import React from "react";
import { useRouter } from "next/navigation";

const TradingSection = () => {
  const router = useRouter();

  const tradingBenefits = [
    {
      icon: "🔄",
      title: "Even Trade",
      description: "Same value games: ₱200 trade fee",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: "📈",
      title: "Trade Up",
      description: "Pay price difference + ₱200 fee",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: "📉",
      title: "Trade Down",
      description: "₱0 payment required",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: "✅",
      title: "Quality Guaranteed",
      description: "All games tested & verified",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: "📍",
      title: "Flexible Options",
      description: "Meet-up or delivery available",
      color: "from-teal-500 to-cyan-600",
    },
  ];

  const tradeTypes = [
    {
      type: "Even Trade",
      description: "Games of equal value",
      fee: "₱200",
      example: "Trade ₱1,500 game for ₱1,500 game",
      popular: false,
    },
    {
      type: "Trade Up",
      description: "Receive higher value game",
      fee: "Price difference + ₱200",
      example:
        "Trade ₱1,200 game + ₱500 for ₱1,500 game (₱300 diff + ₱200 fee)",
      popular: true,
    },
    {
      type: "Trade Down",
      description: "Give higher value game",
      fee: "₱0",
      example: "Trade ₱1,500 game for ₱1,200 game",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden w-full">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-green-50 to-transparent transform skew-x-12 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-emerald-50 to-transparent transform -skew-x-6 origin-bottom-left"></div>
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white"></div>

      <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            🔄 Game Trading
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Trade Your Games,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
              Get New Adventures
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Exchange your completed games for new ones. Fair valuations,
            transparent pricing, and flexible trade options. Build your
            collection without breaking the bank.
          </p>
        </div>

        {/* Trading Benefits Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {tradingBenefits.map((benefit, index) => (
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

        {/* Trade Types Preview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              How Trading Works
            </h3>
            <p className="text-lg text-gray-600">
              Three simple trade types with transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tradeTypes.map((trade, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  trade.popular
                    ? "border-green-500 shadow-xl scale-105"
                    : "border-gray-200 hover:border-green-500"
                }`}
              >
                {trade.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {trade.type}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {trade.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Trade Fee</div>
                    <div className="text-2xl font-black text-green-600">
                      {trade.fee}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 italic">
                      {trade.example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Game Requirements
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">Good working condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">
                    Original case and artwork preferred
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">
                    No significant damage to cartridge
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">
                    Authentic Nintendo Switch games only
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                Payment & Location
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">
                    Cash, GCash, Maya, or Bank Transfer
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">Meet-up or delivery options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">Fair market-based valuations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">
                    Sale prices apply when available
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={() => router.push("/trade-game")}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Start Trading Now</span>
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
            Fair valuations • Transparent pricing • Quality guaranteed
          </p>
        </div>
      </div>
    </section>
  );
};

export default TradingSection;
