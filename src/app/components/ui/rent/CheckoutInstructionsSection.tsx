import React from "react";
import Link from "next/link";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { formatPrice } from "@/lib/game-utils";
import { rentalContent } from "@/config/rental-content";
import { siteConfig } from "@/config/site";

export function CheckoutInstructionsSection() {
  const { checkout } = rentalContent;

  return (
    <SectionWrapper variant="gradient">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-neutral mb-4">
            {checkout.title}
          </h2>
          <p className="text-lg text-gray-600">{checkout.subtitle}</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {checkout.steps.map((step, index) => (
            <div
              key={step.number}
              className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform ${
                index % 2 === 0 ? "rotate-1" : "-rotate-1"
              } hover:rotate-0 hover:-translate-y-2`}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-funBlue to-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto text-white font-black text-lg">
                {step.number}
              </div>
              <h3 className="font-bold text-neutral mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-neutral text-center mb-8">
            {checkout.paymentMethods.title}
          </h3>
          <p className="text-gray-600 text-center mb-6">
            {checkout.paymentMethods.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {siteConfig.paymentMethods.map((method, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform ${
                  index % 2 === 0 ? "rotate-1" : "-rotate-1"
                } hover:rotate-0 hover:-translate-y-1`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className="font-bold text-gray-900">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown Example */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-funBlue transform -rotate-1 hover:rotate-0 transition-all duration-300">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-neutral mb-2">
              {checkout.example.title}
            </h3>
            <p className="text-gray-600">{checkout.example.subtitle}</p>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 mb-6">
            <div className="text-center mb-6">
              <div className="inline-block bg-funBlue text-white px-4 py-2 rounded-full text-sm font-bold">
                Example Scenario
              </div>
              <p className="text-lg font-bold text-neutral mt-4">
                Renting a {checkout.example.scenario.game} for{" "}
                {checkout.example.scenario.duration}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {checkout.example.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow"
                >
                  <div className="w-8 h-8 bg-funBlue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{step}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6 border-2 border-success">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Your True Cost (What You Actually Spend)
                </p>
                <p className="text-4xl font-black text-success">
                  {formatPrice(checkout.example.scenario.totalRent)} only!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Everything else is refunded! 🎉
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/games"
              className="inline-block bg-gradient-to-r from-lameRed to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-2 transform hover:rotate-1"
            >
              Browse Games to Rent
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
