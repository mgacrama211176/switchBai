"use client";

import React from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";

const tradingSteps = [
  {
    number: 1,
    title: "Contact Us",
    icon: "📞",
    description:
      "Reach out via phone, email, or social media with the games you want to trade and receive",
  },
  {
    number: 2,
    title: "Get Quote",
    icon: "💰",
    description:
      "We'll evaluate your games and provide a trade quote with pricing breakdown",
  },
  {
    number: 3,
    title: "Confirm Trade",
    icon: "✅",
    description:
      "Review and confirm the trade details, location, and payment method",
  },
  {
    number: 4,
    title: "Complete Trade",
    icon: "🔄",
    description:
      "Meet up or arrange delivery to exchange games and complete the transaction",
  },
];

export function TradingFlowSection() {
  return (
    <SectionWrapper variant="light">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
            How Trading Works
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            A simple 4-step process to trade your games for new ones
          </p>

          {/* Floating decorations */}
          <div className="absolute -top-4 right-0 lg:right-8 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80">
            <span className="text-lg text-white font-bold">4</span>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tradingSteps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform ${
                index === 0
                  ? "-rotate-1"
                  : index === 1
                    ? "rotate-1"
                    : index === 2
                      ? "-rotate-2"
                      : "rotate-2"
              } hover:rotate-0 hover:-translate-y-2 relative`}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                <span className="text-white font-black text-lg">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">{step.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Flow Arrow (Desktop) */}
        <div className="hidden lg:flex items-center justify-center mt-8 mb-8">
          <div className="flex items-center gap-4">
            {tradingSteps.slice(0, -1).map((_, index) => (
              <React.Fragment key={index}>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-green-500 border-b-8 border-b-transparent" />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom Divider */}
        <div
          className="mt-16 h-1 w-24 mx-auto rounded-full transform hover:scale-110 transition-transform duration-300"
          style={{
            background: "linear-gradient(to right, #10b981, #059669)",
          }}
        />
      </div>
    </SectionWrapper>
  );
}
