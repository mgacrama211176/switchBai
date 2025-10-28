"use client";

import { useState } from "react";
import DashboardStats from "./components/DashboardStats";
import GameForm from "./components/GameForm";
import GamesTable from "./components/GamesTable";
import RentalsTable from "./components/RentalsTable";
import ProtectedRoute from "./components/ProtectedRoute";
import { HiPlus, HiViewList, HiClipboardList } from "react-icons/hi";

type TabType = "games" | "rentals" | "add-game";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("games");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        <DashboardStats refreshTrigger={refreshTrigger} />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-black">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("games")}
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
                onClick={() => setActiveTab("rentals")}
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
                onClick={() => setActiveTab("add-game")}
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
              />
            )}
            {activeTab === "rentals" && (
              <RentalsTable
                refreshTrigger={refreshTrigger}
                onRentalUpdated={handleRentalUpdated}
              />
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
