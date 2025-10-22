import React from "react";
import { SectionWrapper } from "@/app/components/ui/SectionWrapper";
import { formatPrice } from "@/lib/game-utils";
import { rentalContent } from "@/config/rental-content";

export function PricingTableSection() {
  const { pricingTable } = rentalContent;

  return (
    <SectionWrapper variant="white">
      <div className="w-full px-8 lg:px-12 xl:px-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-neutral mb-4">
            {pricingTable.title}
          </h2>
          <p className="text-lg text-gray-700 mb-2">{pricingTable.subtitle}</p>
          <p className="text-sm text-gray-600">{pricingTable.note}</p>
        </div>

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden min-w-full">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                  {pricingTable.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
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
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{row.tier}</div>
                      <div className="text-sm text-gray-700">
                        {formatPrice(row.gameValue)} value
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-xl font-black text-funBlue">
                        {formatPrice(row.dailyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per day</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-xl font-black text-green-600">
                        {formatPrice(row.weeklyRate)}
                      </div>
                      <div className="text-xs text-gray-700">per week</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap relative">
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
                    <td className="px-6 py-6 whitespace-nowrap">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-r from-funBlue/10 to-blue-100 rounded-xl p-6 border border-funBlue transform rotate-1 hover:rotate-0 transition-all duration-300">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-neutral mb-2">Pay Upfront</h3>
            <p className="text-sm text-gray-700">
              Rental fee + Deposit = Game price. You pay the game value upfront!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6 border border-success transform -rotate-1 hover:rotate-0 transition-all duration-300">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-neutral mb-2">Full Refund</h3>
            <p className="text-sm text-gray-700">
              Get your deposit back when you return the game in good condition.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-100 rounded-xl p-6 border border-orange-300 transform rotate-2 hover:rotate-0 transition-all duration-300">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-neutral mb-2">Best Rate Applied</h3>
            <p className="text-sm text-gray-700">
              We automatically apply the best rate for any duration. No need to
              choose a plan!
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
