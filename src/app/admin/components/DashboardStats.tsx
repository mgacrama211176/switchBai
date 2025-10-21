"use client";

import { useEffect, useState } from "react";
import { Game } from "@/app/types/games";
import { formatPrice } from "@/lib/game-utils";
import {
  HiCube,
  HiTrendingUp,
  HiExclamation,
  HiCash,
  HiDeviceTablet,
} from "react-icons/hi";

interface DashboardStatsProps {
  refreshTrigger: number;
}

export default function DashboardStats({
  refreshTrigger,
}: DashboardStatsProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse"
          >
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalGames = games.length;
  const switchGames = games.filter((g) =>
    Array.isArray(g.gamePlatform)
      ? g.gamePlatform.includes("Nintendo Switch")
      : g.gamePlatform === "Nintendo Switch",
  ).length;
  const switch2Games = games.filter((g) =>
    Array.isArray(g.gamePlatform)
      ? g.gamePlatform.includes("Nintendo Switch 2")
      : g.gamePlatform === "Nintendo Switch 2",
  ).length;
  const lowStockGames = games.filter((g) => g.gameAvailableStocks < 5).length;
  const totalValue = games.reduce(
    (sum, game) => sum + game.gamePrice * game.gameAvailableStocks,
    0,
  );
  const rentalGames = games.filter((g) => g.rentalAvailable).length;
  const topSeller = games
    .filter((g) => g.numberOfSold)
    .sort((a, b) => (b.numberOfSold || 0) - (a.numberOfSold || 0))[0];

  const stats = [
    {
      label: "Total Games",
      value: totalGames,
      icon: HiCube,
      color: "from-funBlue to-blue-500",
      subtext: `Switch: ${switchGames} | Switch 2: ${switch2Games}`,
    },
    {
      label: "Inventory Value",
      value: formatPrice(totalValue),
      icon: HiCash,
      color: "from-green-500 to-emerald-500",
      subtext: `Across ${games.reduce((sum, g) => sum + g.gameAvailableStocks, 0)} units`,
    },
    {
      label: "Low Stock Alert",
      value: lowStockGames,
      icon: HiExclamation,
      color: "from-lameRed to-red-600",
      subtext: "Games with < 5 units",
    },
    {
      label: "Rental Available",
      value: rentalGames,
      icon: HiDeviceTablet,
      color: "from-purple-500 to-pink-500",
      subtext: `${((rentalGames / totalGames) * 100).toFixed(0)}% of catalog`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Seller */}
      {topSeller && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <HiTrendingUp className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Top Seller
              </h3>
              <p className="text-gray-700 font-semibold">
                {topSeller.gameTitle}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {topSeller.numberOfSold} units sold •{" "}
                {formatPrice(topSeller.gamePrice)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
