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
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-2">
            🔄 Trading Process
          </div>
          <h2 className="text-5xl font-black text-white mb-6 tracking-tight">
            Detailed Trading Process
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Everything you need to know about how we handle game trades from
            start to finish
          </p>
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processDetails.map((item, index) => (
            <div
              key={index}
              className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20 hover:border-green-400 transition-all duration-300 transform ${
                index % 2 === 0 ? "rotate-1" : "-rotate-1"
              } hover:rotate-0 hover:-translate-y-2`}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">{item.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 text-center">
                {item.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed text-center">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">⏱️</div>
              <h4 className="font-bold text-white mb-2">Quick Process</h4>
              <p className="text-gray-300 text-sm">
                Most trades completed within 1-3 business days
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">💳</div>
              <h4 className="font-bold text-white mb-2">Flexible Payment</h4>
              <p className="text-gray-300 text-sm">
                Cash, GCash, Maya, or Bank Transfer accepted
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">📍</div>
              <h4 className="font-bold text-white mb-2">Convenient Location</h4>
              <p className="text-gray-300 text-sm">
                Meet-up or delivery options available
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
