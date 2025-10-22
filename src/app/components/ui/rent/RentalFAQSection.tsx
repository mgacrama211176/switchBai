"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { rentalContent } from "@/config/rental-content";

export function RentalFAQSection() {
  const { faq, cta } = rentalContent;
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <SectionWrapper variant="white">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-success text-white px-4 py-2 rounded-full text-sm font-bold mb-4 transform -rotate-2">
            ❓ FAQ
          </div>
          <h2 className="text-4xl font-black text-neutral mb-4">{faq.title}</h2>
          <p className="text-lg text-gray-700">{faq.subtitle}</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-16">
          {faq.items.map((item, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${
                openFAQ === index
                  ? "border-success"
                  : "border-gray-200 hover:border-gray-300"
              } transform ${index % 3 === 0 ? "rotate-1" : index % 3 === 1 ? "-rotate-1" : "rotate-2"} hover:rotate-0`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-start justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start gap-4 text-left flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                      openFAQ === index
                        ? "bg-gradient-to-r from-success to-green-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Q{index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-neutral pt-1">
                    {item.question}
                  </h3>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-700 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openFAQ === index ? "rotate-180" : ""
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

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pl-20 bg-gradient-to-b from-gray-50 to-white">
                  <p className="text-gray-800 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-funBlue/10 to-lameRed/10 rounded-3xl p-12 border-2 border-gray-200 shadow-xl transform -rotate-1 hover:rotate-0 transition-all duration-300">
          <div className="text-center">
            <h3 className="text-3xl font-black text-neutral mb-4">
              {cta.title}
            </h3>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              {cta.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/games"
                className="inline-block bg-gradient-to-r from-funBlue to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2 transform hover:rotate-1"
              >
                {cta.primaryButton}
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-white hover:bg-gray-50 text-neutral font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2 border-2 border-gray-200 transform hover:-rotate-1"
              >
                {cta.secondaryButton}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div
          className="mt-16 h-1 w-24 mx-auto rounded-full transform hover:scale-110 transition-transform duration-300"
          style={{
            background: "linear-gradient(to right, #00c3e3, #ff4554)",
          }}
        />
      </div>
    </SectionWrapper>
  );
}
