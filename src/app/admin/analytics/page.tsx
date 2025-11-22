"use client";

import { useState, useEffect } from "react";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";

interface Analytics {
  totalNegotiations: number;
  successCount: number;
  successRate: number;
  averageDiscount: number;
  firstOfferAcceptanceRate: number;
  avgMessagesPerNegotiation: number;
  priceSensitivity: {
    highValue: { count: number; avgDiscount: number };
    lowValue: { count: number; avgDiscount: number };
  };
  insights: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      setError("Error fetching analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 px-4 md:px-8 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !analytics) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 px-4 md:px-8 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-red-600">{error || "No data available"}</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Negotiation Analytics
            </h1>
            <p className="text-gray-600">
              Learn from customer patterns to optimize your AI strategy
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Total Negotiations
              </h3>
              <p className="text-3xl font-black text-funBlue">
                {analytics.totalNegotiations}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Success Rate
              </h3>
              <p className="text-3xl font-black text-green-600">
                {analytics.successRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.successCount} successful
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Avg Discount
              </h3>
              <p className="text-3xl font-black text-orange-600">
                ₱{analytics.averageDiscount}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                First Offer Acceptance
              </h3>
              <p className="text-3xl font-black text-purple-600">
                {analytics.firstOfferAcceptanceRate}%
              </p>
            </div>
          </div>

          {/* Insights */}
          {analytics.insights.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🧠 AI Insights
              </h2>
              <div className="space-y-3">
                {analytics.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(insight.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {insight.priority === "high"
                          ? "⚠️"
                          : insight.priority === "medium"
                            ? "💡"
                            : "ℹ️"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {insight.message}
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                          Type: {insight.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Sensitivity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              💰 Price Sensitivity Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  High Value Items (&gt;₱2000)
                </h3>
                <p className="text-2xl font-black text-funBlue mb-1">
                  ₱{analytics.priceSensitivity.highValue.avgDiscount}
                </p>
                <p className="text-sm text-gray-600">
                  Average discount across{" "}
                  {analytics.priceSensitivity.highValue.count} deals
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Low Value Items (≤₱2000)
                </h3>
                <p className="text-2xl font-black text-green-600 mb-1">
                  ₱{analytics.priceSensitivity.lowValue.avgDiscount}
                </p>
                <p className="text-sm text-gray-600">
                  Average discount across{" "}
                  {analytics.priceSensitivity.lowValue.count} deals
                </p>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 Additional Metrics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Avg Messages Per Negotiation
                </span>
                <span className="text-lg font-bold text-funBlue">
                  {analytics.avgMessagesPerNegotiation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
