"use client";

import React, { useState } from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";

interface PolicyItem {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const tradingPolicies: PolicyItem[] = [
  {
    id: "trade-fees",
    title: "Trade Fees & Pricing",
    icon: "💰",
    content: [
      "Even trade (same value): ₱200 trade fee applies",
      "Trade up (you receive higher value): Pay the price difference only, no trade fee",
      "Trade down (you give higher value): ₱0 payment required, no cash compensation (future points system coming soon)",
      "All game valuations are based on current market prices",
      "Sale prices apply when games are on sale",
    ],
  },
  {
    id: "game-condition",
    title: "Game Condition Requirements",
    icon: "✅",
    content: [
      "Games must be in good working condition",
      "Original game case and artwork preferred",
      "No significant scratches or damage to game cartridge",
      "Games must be authentic Nintendo Switch games",
      "We reserve the right to reject games that don't meet quality standards",
    ],
  },
  {
    id: "trade-process",
    title: "Trade Process",
    icon: "🔄",
    content: [
      "Contact us with the games you want to trade and receive",
      "We'll evaluate your games and provide a trade quote",
      "Agree on trade location (meet-up or delivery)",
      "Complete the trade in person or via delivery",
      "Once trade is completed, games are exchanged and inventory is updated",
    ],
  },
  {
    id: "trade-location",
    title: "Trade Location & Payment",
    icon: "📍",
    content: [
      "Trades can be done via meet-up or delivery",
      "Payment methods: Cash, GCash, Maya, or Bank Transfer",
      "Cash difference must be paid when trading up",
      "Meet-up location can be specified during trade setup",
      "Delivery available for completed trades (additional fees may apply)",
    ],
  },
  {
    id: "trade-status",
    title: "Trade Status & Timeline",
    icon: "⏱️",
    content: [
      "Pending: Trade request submitted, awaiting confirmation",
      "Confirmed: Trade approved, ready to proceed",
      "Completed: Trade finished, games exchanged",
      "Cancelled: Trade cancelled by either party",
      "Typical trade completion: 1-3 business days after confirmation",
    ],
  },
  {
    id: "trade-restrictions",
    title: "Trade Restrictions",
    icon: "🚫",
    content: [
      "Only games marked as 'Tradable' are available for trade",
      "Games must have available stock to be received in trade",
      "We may limit trades based on inventory availability",
      "Duplicate games may be rejected if we already have sufficient stock",
      "Special edition or limited edition games may have different trade values",
    ],
  },
];

export function TradingPolicySection() {
  const [openPolicy, setOpenPolicy] = useState<string | null>(
    tradingPolicies[0].id,
  );

  const togglePolicy = (id: string) => {
    setOpenPolicy(openPolicy === id ? null : id);
  };

  return (
    <SectionWrapper variant="light">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform rotate-2">
            📋 Trading Policies
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Our Trading Rules & Policies
          </h2>
          <p className="text-lg text-gray-700">
            Understanding our trading system helps ensure a smooth experience
            for everyone
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {tradingPolicies.map((policy, index) => (
            <div
              key={policy.id}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${
                openPolicy === policy.id
                  ? "border-green-500"
                  : "border-gray-200 hover:border-gray-300"
              } transform ${index % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}
            >
              {/* Header Button */}
              <button
                onClick={() => togglePolicy(policy.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      openPolicy === policy.id
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gray-100"
                    }`}
                  >
                    {policy.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-left">
                    {policy.title}
                  </h3>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-700 transition-transform duration-300 ${
                    openPolicy === policy.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openPolicy === policy.id
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2 bg-gradient-to-b from-gray-50 to-white">
                  <ul className="space-y-3">
                    {policy.content.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-800"
                      >
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="flex-1 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Note */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 transform rotate-1 hover:rotate-0 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">
                Important Reminder
              </h4>
              <p className="text-gray-800 leading-relaxed">
                Please read all trading policies carefully before initiating a
                trade. By submitting a trade request, you agree to these terms.
                If you have any questions, contact us before proceeding with
                your trade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
