import React from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { formatPrice } from "@/lib/game-utils";
import { rentalContent } from "@/config/rental-content";

export function PricingTableSection() {
  const { pricingTable } = rentalContent;

  return (
    <SectionWrapper variant="white">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-neutral mb-4">
            {pricingTable.title}
          </h2>
          <p className="text-lg text-gray-700 mb-2">{pricingTable.subtitle}</p>
          <p className="text-sm text-gray-600">{pricingTable.note}</p>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-4">
          {pricingTable.rows.map((row, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 relative transform ${
                index % 2 === 0 ? "rotate-1" : "-rotate-1"
              } hover:rotate-0 transition-all duration-300`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 z-10">
                  {pricingTable.popularLabel}
                </div>
              )}

              {/* Card Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {row.tier}
                </h3>
                <p className="text-sm text-gray-700">
                  {formatPrice(row.gameValue)} value
                </p>
              </div>

              {/* Rates Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Daily Rate */}
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-black text-funBlue mb-1">
                    {formatPrice(row.dailyRate)}
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">
                    Daily
                  </div>
                </div>

                {/* Weekly Rate */}
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-black text-green-600 mb-1">
                    {formatPrice(row.weeklyRate)}
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">
                    Weekly
                  </div>
                </div>

                {/* Bi-Weekly Rate */}
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-black text-lameRed mb-1">
                    {formatPrice(row.biWeeklyRate)}
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">
                    Bi-Weekly
                  </div>
                </div>

                {/* Monthly Rate */}
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-black text-purple-600 mb-1">
                    {formatPrice(row.monthlyRate)}
                  </div>
                  <div className="text-xs text-gray-700 font-semibold">
                    Monthly
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden min-w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                  {pricingTable.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 lg:px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingTable.rows.map((row, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="px-4 lg:px-6 py-6 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{row.tier}</div>
                      <div className="text-sm text-gray-700">
                        {formatPrice(row.gameValue)} value
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-6 whitespace-nowrap">
                      <div className="text-xl font-black text-funBlue">
                        {formatPrice(row.dailyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per day</div>
                    </td>
                    <td className="px-4 lg:px-6 py-6 whitespace-nowrap">
                      <div className="text-xl font-black text-green-600">
                        {formatPrice(row.weeklyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per week</div>
                    </td>
                    <td className="px-4 lg:px-6 py-6 whitespace-nowrap relative">
                      <div className="text-xl font-black text-lameRed">
                        {formatPrice(row.biWeeklyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per 2 weeks</div>
                      {index === 1 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                          {pricingTable.popularLabel}
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-6 whitespace-nowrap">
                      <div className="text-xl font-black text-purple-600">
                        {formatPrice(row.monthlyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per month</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
          <div className="bg-gradient-to-r from-funBlue/10 to-blue-100 rounded-xl p-4 md:p-6 border border-funBlue transform rotate-1 hover:rotate-0 transition-all duration-300">
            <div className="text-2xl md:text-3xl mb-3">💰</div>
            <h3 className="font-bold text-neutral mb-2 text-sm md:text-base">
              Pay Upfront
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              Rental fee + Deposit = Game price. You pay the game value upfront!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 md:p-6 border border-success transform -rotate-1 hover:rotate-0 transition-all duration-300">
            <div className="text-2xl md:text-3xl mb-3">✅</div>
            <h3 className="font-bold text-neutral mb-2 text-sm md:text-base">
              Full Refund
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              Get your deposit back when you return the game in good condition.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-xl p-4 md:p-6 border border-orange-300 transform rotate-2 hover:rotate-0 transition-all duration-300">
            <div className="text-2xl md:text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-neutral mb-2 text-sm md:text-base">
              Best Rate Applied
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              We automatically apply the best rate for any duration. No need to
              choose a plan!
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
