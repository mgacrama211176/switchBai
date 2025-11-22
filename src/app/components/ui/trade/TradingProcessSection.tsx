"use client";

import React from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";

const processDetails = [
  {
    icon: "📋",
    title: "Submit Trade Request",
    description:
      "Contact us with details about the games you want to trade in and the games you'd like to receive. Include game titles, conditions, and your preferred contact method.",
  },
  {
    icon: "🔍",
    title: "Game Evaluation",
    description:
      "We'll evaluate your games based on condition, market value, and current inventory needs. You'll receive a detailed quote showing trade values and any cash difference.",
  },
  {
    icon: "💬",
    title: "Review & Confirm",
    description:
      "Review the trade quote and confirm all details. Discuss trade location (meet-up or delivery), payment method, and any special arrangements needed.",
  },
  {
    icon: "📍",
    title: "Arrange Exchange",
    description:
      "Coordinate the trade location and time. For meet-ups, we'll agree on a convenient location. For delivery, we'll arrange shipping details.",
  },
  {
    icon: "🔄",
    title: "Complete Trade",
    description:
      "Exchange games in person or via delivery. Verify game conditions, complete payment if needed, and receive your new games. Trade status will be updated to 'completed'.",
  },
  {
    icon: "📊",
    title: "Inventory Update",
    description:
      "Once completed, our inventory is automatically updated. Games you traded in are added to stock, and games you received are deducted from inventory.",
  },
];

export function TradingProcessSection() {
  return (
    <SectionWrapper variant="dark">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 transform rotate-2">
            🔄 Trading Process
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tight">
            Detailed Trading Process
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
            Everything you need to know about how we handle game trades from
            start to finish
          </p>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {processDetails.map((item, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-white/20 hover:border-green-400 transition-all duration-300 transform ${
                index % 2 === 0 ? "rotate-1" : "-rotate-1"
              } hover:rotate-0 hover:-translate-y-2`}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl">{item.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">
                {item.title}
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed text-center">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⏱️</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">
                Quick Process
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Most trades completed within 1-3 business days
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💳</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">
                Flexible Payment
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Cash, GCash, Maya, or Bank Transfer accepted
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📍</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">
                Convenient Location
              </h4>
              <p className="text-gray-300 text-xs sm:text-sm">
                Meet-up or delivery options available
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
