"use client";

import { useState } from "react";
import DashboardStats from "./components/DashboardStats";
import GameForm from "./components/GameForm";
import GamesTable from "./components/GamesTable";
import ProtectedRoute from "./components/ProtectedRoute";
import { HiPlus, HiViewList } from "react-icons/hi";

type TabType = "add" | "view";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("view");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleGameAdded() {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("view");
  }

  function handleGameUpdated() {
    setRefreshTrigger((prev) => prev + 1);
  }

  function handleGameDeleted() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Game Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Nintendo Switch game inventory
          </p>
        </div>

        {/* Stats Section */}
        <DashboardStats refreshTrigger={refreshTrigger} />

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("view")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "view"
                    ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <HiViewList className="w-5 h-5" />
                <span>View Games</span>
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === "add"
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
            {activeTab === "view" && (
              <GamesTable
                refreshTrigger={refreshTrigger}
                onGameUpdated={handleGameUpdated}
                onGameDeleted={handleGameDeleted}
              />
            )}
            {activeTab === "add" && (
              <GameForm
                mode="create"
                onSuccess={handleGameAdded}
                onCancel={() => setActiveTab("view")}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
