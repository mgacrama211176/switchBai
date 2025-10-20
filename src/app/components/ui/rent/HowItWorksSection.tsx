import React from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { rentalContent } from "@/config/rental-content";

export function HowItWorksSection() {
  const { howItWorks } = rentalContent;

  return (
    <SectionWrapper variant="light">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative max-w-4xl mx-auto">
          <h2 className="text-5xl font-black text-neutral mb-6 tracking-tight">
            {howItWorks.title}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {howItWorks.subtitle}
          </p>

          {/* Floating decorations */}
          <div className="absolute -top-4 right-0 lg:right-8 w-12 h-12 bg-funBlue rounded-full flex items-center justify-center transform rotate-12 shadow-lg opacity-80">
            <span className="text-lg text-white font-bold">
              {howItWorks.steps.length}
            </span>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.steps.map((step, index) => (
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
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-lameRed to-pink-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                <span className="text-white font-black text-lg">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-funBlue to-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto transform hover:rotate-12 transition-transform duration-300">
                <span className="text-3xl">{step.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-neutral mb-4 text-center">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed text-center">
                {step.description}
              </p>
            </div>
          ))}
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
