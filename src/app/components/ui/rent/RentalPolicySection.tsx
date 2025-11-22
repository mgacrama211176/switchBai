"use client";

import React, { useState } from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { rentalContent } from "@/config/rental-content";

export function RentalPolicySection() {
  const { policies } = rentalContent;
  const [openPolicy, setOpenPolicy] = useState<string | null>(
    policies.items[0].id,
  );

  const togglePolicy = (id: string) => {
    setOpenPolicy(openPolicy === id ? null : id);
  };

  return (
    <SectionWrapper variant="light">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-block bg-lameRed text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 transform rotate-2">
            📋 Policies
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral mb-3 sm:mb-4">
            {policies.title}
          </h2>
          <p className="text-base sm:text-lg text-gray-700 px-4 sm:px-0">
            {policies.subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {policies.items.map((policy, index) => (
            <div
              key={policy.id}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${
                openPolicy === policy.id
                  ? "border-funBlue"
                  : "border-gray-200 hover:border-gray-300"
              } transform ${index % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}
            >
              {/* Header Button */}
              <button
                onClick={() => togglePolicy(policy.id)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${
                      openPolicy === policy.id
                        ? "bg-gradient-to-r from-funBlue to-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    {policy.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral text-left">
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
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 bg-gradient-to-b from-gray-50 to-white">
                  <ul className="space-y-2 sm:space-y-3">
                    {policy.content.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 sm:gap-3 text-gray-800"
                      >
                        <span className="text-funBlue font-bold mt-1 flex-shrink-0">
                          •
                        </span>
                        <span className="flex-1 leading-relaxed text-sm sm:text-base">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Note */}
        <div className="mt-8 sm:mt-10 md:mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-yellow-300 transform rotate-1 hover:rotate-0 transition-all duration-300">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl flex-shrink-0">⚠️</div>
            <div>
              <h4 className="font-bold text-neutral mb-2 text-base sm:text-lg">
                Important Reminder
              </h4>
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                Please read all policies carefully before renting. By renting a
                game, you agree to these terms. If you have any questions,
                contact us before proceeding with your rental.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
