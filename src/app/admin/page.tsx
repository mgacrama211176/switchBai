"use client";

import { useState } from "react";
import DashboardStats from "./components/DashboardStats";
import GameForm from "./components/GameForm";
import GamesTable from "./components/GamesTable";
import RentalsTable from "./components/RentalsTable";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  HiPlus,
  HiViewList,
  HiClipboardList,
  HiShoppingCart,
  HiSwitchHorizontal,
  HiShoppingBag,
  HiCurrencyDollar,
} from "react-icons/hi";
import OrdersTable from "./components/OrdersTable";
import TradesTable from "./components/TradesTable";
import BuyingTable from "./components/BuyingTable";
import FinancialsTable from "./components/FinancialsTable";

type TabType =
  | "games"
  | "rentals"
  | "orders"
  | "trades"
  | "buying"
  | "financials"
  | "add-game";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("games");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeFilter, setActiveFilter] = useState<
    "inStock" | "outOfStock" | "rental" | null
  >(null);

  function handleGameAdded() {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("games");
  }

  function handleGameUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleGameDeleted() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleRentalUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleOrderUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleTradeUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleBuyingUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleFinancialsUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleTotalGamesClick() {
    setActiveFilter("inStock");
    setActiveTab("games");
  }

  function handleLowStockClick() {
    setActiveFilter("outOfStock");
    setActiveTab("games");
  }

  function handleRentalClick() {
    setActiveFilter("rental");
    setActiveTab("games");
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    if (tab !== "games") {
      setActiveFilter(null);
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your Nintendo Switch game inventory and rental requests
          </p>
        </div>

        {/* Stats Section */}
        <DashboardStats
          refreshTrigger={refreshTrigger}
          onTotalGamesClick={handleTotalGamesClick}
          onLowStockClick={handleLowStockClick}
          onRentalClick={handleRentalClick}
        />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-black">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => handleTabChange("games")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "games"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiViewList className="w-5 h-5" />
                <span>Games</span>
              </button>
              <button
                onClick={() => handleTabChange("rentals")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "rentals"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiClipboardList className="w-5 h-5" />
                <span>Rentals</span>
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "orders"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiShoppingCart className="w-5 h-5" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => handleTabChange("trades")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "trades"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiSwitchHorizontal className="w-5 h-5" />
                <span>Trades</span>
              </button>
              <button
                onClick={() => handleTabChange("buying")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "buying"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiShoppingBag className="w-5 h-5" />
                <span>Buying</span>
              </button>
              <button
                onClick={() => handleTabChange("financials")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "financials"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiCurrencyDollar className="w-5 h-5" />
                <span>Financials</span>
              </button>
              <button
                onClick={() => handleTabChange("add-game")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "add-game"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiPlus className="w-5 h-5" />
                <span>Add Game</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "games" && (
              <GamesTable
                refreshTrigger={refreshTrigger}
                onGameUpdated={handleGameUpdated}
                onGameDeleted={handleGameDeleted}
                activeFilter={activeFilter}
                onFilterClear={() => setActiveFilter(null)}
              />
            )}
            {activeTab === "rentals" && (
              <RentalsTable
                refreshTrigger={refreshTrigger}
                onRentalUpdated={handleRentalUpdated}
              />
            )}
            {activeTab === "orders" && (
              <OrdersTable
                refreshTrigger={refreshTrigger}
                onOrderUpdated={handleOrderUpdated}
              />
            )}
            {activeTab === "trades" && (
              <TradesTable
                refreshTrigger={refreshTrigger}
                onTradeUpdated={handleTradeUpdated}
              />
            )}
            {activeTab === "buying" && (
              <BuyingTable
                refreshTrigger={refreshTrigger}
                onBuyingUpdated={handleBuyingUpdated}
              />
            )}
            {activeTab === "financials" && (
              <FinancialsTable refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "add-game" && (
              <GameForm
                mode="create"
                onSuccess={handleGameAdded}
                onCancel={() => setActiveTab("games")}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
