"use client";

import { useEffect, useState } from "react";
import { HiTrendingUp, HiTrendingDown, HiMinus } from "react-icons/hi";
import {
  FinancialData,
  FinancialSummary,
  FinancialTimeSeries,
  RevenueBreakdown,
  CostBreakdown,
  TopGame,
  InventoryMetrics,
  MarketProjections,
} from "@/app/types/games";
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getTrendIndicator,
} from "@/lib/financial-utils";
import Toast from "./Toast";
import FinancialChart from "./FinancialChart";

interface FinancialsTableProps {
  refreshTrigger: number;
}

export default function FinancialsTable({
  refreshTrigger,
}: FinancialsTableProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Filter states
  const [filterType, setFilterType] = useState<
    "all" | "monthly" | "bi-annual" | "annual"
  >("all");
  const [period, setPeriod] = useState<
    "day" | "week" | "month" | "bi-annual" | "annual" | "all"
  >("month");
  const [operatingExpenses, setOperatingExpenses] = useState<number>(0);
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "nintendo" | "playstation"
  >("all");

  useEffect(() => {
    fetchFinancialData();
  }, [filterType, period, operatingExpenses, platformFilter, refreshTrigger]);

  async function fetchFinancialData() {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterType !== "all") {
        params.append("filterType", filterType);
      }
      if (period !== "all") {
        params.append("period", period);
      }
      if (operatingExpenses > 0) {
        params.append("operatingExpenses", operatingExpenses.toString());
      }
      if (platformFilter !== "all") {
        params.append("platformFilter", platformFilter);
      }

      const response = await fetch(`/api/financials?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch financial data");
      }

      setFinancialData(data.data);
    } catch (err) {
      console.error("Error fetching financials:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load financial data",
      );
      setToast({
        message: "Failed to load financial data",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (error || !financialData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error || "Failed to load financial data"}
        </p>
        <button
          onClick={fetchFinancialData}
          className="px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    summary,
    timeSeries,
    revenueBreakdown,
    costBreakdown,
    topGames,
    inventory,
    projections,
  } = financialData;

  const statusColor = getStatusColor(summary.grossProfit);
  const statusColors = {
    profit: "text-green-600 bg-green-50 border-green-200",
    loss: "text-red-600 bg-red-50 border-red-200",
    "break-even": "text-yellow-600 bg-yellow-50 border-yellow-200",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Period Filter
          </label>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "all" | "monthly" | "bi-annual" | "annual",
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="monthly">This Month</option>
            <option value="bi-annual">Last 6 Months</option>
            <option value="annual">Last 12 Months</option>
          </select>
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group By
          </label>
          <select
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value as
                  | "day"
                  | "week"
                  | "month"
                  | "bi-annual"
                  | "annual"
                  | "all",
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="bi-annual">Bi-Annual</option>
            <option value="annual">Annual</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operating Expenses (₱)
          </label>
          <input
            type="number"
            min={0}
            value={operatingExpenses}
            onChange={(e) =>
              setOperatingExpenses(parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Rent, utilities, salaries, etc.
          </p>
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform Filter
          </label>
          <select
            value={platformFilter}
            onChange={(e) =>
              setPlatformFilter(
                e.target.value as "all" | "nintendo" | "playstation",
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="nintendo">Nintendo</option>
            <option value="playstation">PlayStation</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <HiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalRevenueWithRentalsAndTrades)}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Orders: {formatCurrency(summary.totalRevenue)}
            {summary.rentalRevenue > 0 && (
              <span className="ml-2">
                • Rentals: {formatCurrency(summary.rentalRevenue)}
              </span>
            )}
            {summary.tradeRevenue > 0 && (
              <span className="ml-2">
                • Trades: {formatCurrency(summary.tradeRevenue)}
              </span>
            )}
          </div>
        </div>

        {/* Total Costs Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Costs</h3>
            <HiTrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalCosts + summary.tradeCosts)}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Purchases: {formatCurrency(summary.totalCosts)}
            {summary.tradeCosts > 0 && (
              <span className="ml-2">
                • Trades: {formatCurrency(summary.tradeCosts)}
              </span>
            )}
          </div>
        </div>

        {/* Gross Profit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Gross Profit</h3>
            {summary.grossProfit > 0 ? (
              <HiTrendingUp className="w-5 h-5 text-green-500" />
            ) : summary.grossProfit < 0 ? (
              <HiTrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <HiMinus className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.grossProfit)}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Before operating expenses
          </div>
        </div>

        {/* Net Profit Card */}
        <div
          className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
            statusColors[summary.status]
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Net Profit</h3>
            {summary.netProfit > 0 ? (
              <HiTrendingUp className="w-5 h-5" />
            ) : summary.netProfit < 0 ? (
              <HiTrendingDown className="w-5 h-5" />
            ) : (
              <HiMinus className="w-5 h-5" />
            )}
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(summary.netProfit)}
          </p>
          <div className="mt-2 text-xs">
            Status: {summary.status.toUpperCase()}
          </div>
        </div>

        {/* Net Profit Margin Card */}
        <div
          className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
            statusColors[summary.status]
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Net Profit Margin</h3>
            {summary.netProfitMargin > 0 ? (
              <HiTrendingUp className="w-5 h-5" />
            ) : summary.netProfitMargin < 0 ? (
              <HiTrendingDown className="w-5 h-5" />
            ) : (
              <HiMinus className="w-5 h-5" />
            )}
          </div>
          <p className="text-2xl font-bold">
            {formatPercentage(summary.netProfitMargin)}
          </p>
          <div className="mt-2 text-xs">
            {summary.totalRevenueWithRentalsAndTrades > 0
              ? "Of total revenue"
              : "No revenue yet"}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              By Payment Method
            </h4>
            <div className="space-y-2">
              {Object.entries(revenueBreakdown.byPaymentMethod).map(
                ([method, amount]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {method.replace("_", " ")}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              By Order Source
            </h4>
            <div className="space-y-2">
              {Object.entries(revenueBreakdown.bySource).map(
                ([source, amount]) => (
                  <div key={source} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{source}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Discounts
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Discounts Given</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(revenueBreakdown.totalDiscounts)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cost Breakdown
        </h3>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Costs
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(costBreakdown.total)}
            </span>
          </div>
        </div>
        {costBreakdown.bySupplier.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              By Supplier
            </h4>
            <div className="space-y-2">
              {costBreakdown.bySupplier.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-600">{item.supplier}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Games */}
      {topGames.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Games by Revenue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Game
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topGames.map((game, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {game.gameTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {game.quantitySold}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(game.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(game.cost)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold ${
                        game.profit > 0
                          ? "text-green-600"
                          : game.profit < 0
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {formatCurrency(game.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Value */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Inventory Value
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Current Inventory Value
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(inventory.totalValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on cost prices</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Potential Revenue</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(inventory.potentialRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">If all stock is sold</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Potential Profit</p>
            <p
              className={`text-xl font-bold ${
                inventory.potentialProfit > 0
                  ? "text-green-600"
                  : inventory.potentialProfit < 0
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {formatCurrency(inventory.potentialProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Potential revenue - inventory value
            </p>
          </div>
        </div>
      </div>

      {/* Market Projections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Market Projections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Projected Monthly Revenue
            </p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(projections.projectedMonthlyRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on last 30 days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              Projected Monthly Profit
            </p>
            <p
              className={`text-lg font-bold ${
                projections.projectedMonthlyProfit > 0
                  ? "text-green-600"
                  : projections.projectedMonthlyProfit < 0
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {formatCurrency(projections.projectedMonthlyProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Based on trends</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Sales Velocity</p>
            <p className="text-lg font-bold text-gray-900">
              {projections.salesVelocity.toFixed(2)} games/day
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Average games sold per day
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Inventory Turnover</p>
            <p className="text-lg font-bold text-gray-900">
              {projections.inventoryTurnover.toFixed(2)}x
            </p>
            <p className="text-xs text-gray-500 mt-1">Times inventory sold</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
            <p
              className={`text-lg font-bold flex items-center ${
                projections.growthRate > 0
                  ? "text-green-600"
                  : projections.growthRate < 0
                    ? "text-red-600"
                    : "text-yellow-600"
              }`}
            >
              {projections.growthRate > 0 && (
                <HiTrendingUp className="w-4 h-4 mr-1" />
              )}
              {projections.growthRate < 0 && (
                <HiTrendingDown className="w-4 h-4 mr-1" />
              )}
              {formatPercentage(projections.growthRate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Month-over-month</p>
          </div>
        </div>
      </div>

      {/* Financial Chart */}
      {timeSeries.length > 0 && <FinancialChart data={timeSeries} />}

      {/* Time Series Table */}
      {timeSeries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Trends
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Costs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Rentals
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSeries.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(item.costs)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-semibold ${
                        item.profit > 0
                          ? "text-green-600"
                          : item.profit < 0
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {formatCurrency(item.profit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.orderCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.rentalCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.tradeCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
