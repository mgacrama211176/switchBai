"use client";

import React from "react";
import Link from "next/link";
import { rentalContent } from "@/config/rental-content";

export function RentalHeroSection() {
  const { hero } = rentalContent;

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-calculator");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-[80vh] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Diagonal Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-2/3 h-3/4 bg-gradient-to-bl from-blue-100/60 to-transparent transform skew-x-6 origin-top-right" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-red-100/60 to-transparent transform -skew-x-12 origin-bottom-left" />
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-gradient-to-br from-purple-100/40 to-transparent transform rotate-45 rounded-full" />
      </div>

      {/* Smooth transition gradient to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-50" />

      <div className="w-full max-w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 relative z-10">
        {/* Hero Content */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 relative max-w-5xl mx-auto pt-8 sm:pt-10 md:pt-12">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-funBlue text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg border mb-4 sm:mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">
              🎮 {hero.badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight relative leading-tight">
            {hero.headline}
            {/* Floating decorations around title */}
            <div className="absolute -top-2 sm:-top-4 right-0 lg:right-8 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80 animate-bounce">
              <span className="text-sm sm:text-base lg:text-lg">💰</span>
            </div>
            <div className="absolute -bottom-2 sm:-bottom-4 left-0 lg:left-8 w-8 h-8 sm:w-10 sm:h-10 bg-lameRed rounded-full flex items-center justify-center transform -rotate-12 shadow-lg opacity-80">
              <span className="text-white font-bold text-[10px] sm:text-xs">
                RENT
              </span>
            </div>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-semibold mb-3 sm:mb-4 px-4 sm:px-0">
            {hero.subheadline}
          </p>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium mb-6 sm:mb-8 px-4 sm:px-0">
            {hero.description}
          </p>

          {/* CTA Button */}
          <div className="relative inline-block mb-8 sm:mb-10 md:mb-12">
            <button
              onClick={scrollToPricing}
              className="group relative bg-gradient-to-r from-funBlue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-10 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 transform hover:rotate-1 text-sm sm:text-base min-h-[44px]"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>{hero.cta}</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </span>
            </button>

            {/* Button decorations */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full transform rotate-12" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-lameRed rounded-full transform -rotate-12" />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4 sm:px-0">
            {hero.trustBadges.map((badge, index) => (
              <div
                key={index}
                className={`bg-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-lg border flex items-center gap-2 sm:gap-3 transform ${
                  index === 0
                    ? "rotate-1"
                    : index === 1
                      ? "-rotate-1"
                      : "rotate-2"
                } hover:rotate-0 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <span className="text-xl sm:text-2xl">{badge.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-xs sm:text-sm text-gray-900">
                    {badge.text}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-12 h-1 w-24 mx-auto rounded-full transform hover:scale-110 transition-transform duration-300"
            style={{
              background: "linear-gradient(to right, #00c3e3, #ff4554)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
