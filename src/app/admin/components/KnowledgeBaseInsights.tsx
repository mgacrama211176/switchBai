"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiLightBulb,
  HiExclamationCircle,
  HiTrendingUp,
  HiRefresh,
  HiPlus,
} from "react-icons/hi";
import Toast from "./Toast";
import SuggestedKBEntryModal from "./SuggestedKBEntryModal";
import { KnowledgeBaseEntry } from "./KnowledgeBaseForm";

interface KnowledgeBaseInsightsProps {
  refreshTrigger: number;
  onEntryCreated: () => void;
}

interface UnansweredQuestion {
  question: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

interface LowConfidenceQuestion {
  question: string;
  count: number;
  avgGameScore: number;
  avgFAQScore: number;
  firstSeen: string;
  lastSeen: string;
}

interface Suggestion {
  question: string;
  count: number;
  reason: "no-results" | "low-confidence" | "both";
  firstSeen: string;
  lastSeen: string;
  suggestedCategory: string;
  avgGameScore?: number;
  avgFAQScore?: number;
}

export default function KnowledgeBaseInsights({
  refreshTrigger,
  onEntryCreated,
}: KnowledgeBaseInsightsProps) {
  const [activeTab, setActiveTab] = useState<
    "summary" | "unanswered" | "low-confidence" | "suggestions"
  >("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState<{
    totalChats: number;
    unansweredQueries: number;
    lowConfidenceQueries: number;
    needsReview: number;
  } | null>(null);
  const [unanswered, setUnanswered] = useState<UnansweredQuestion[]>([]);
  const [lowConfidence, setLowConfidence] = useState<LowConfidenceQuestion[]>(
    [],
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch summary
      const summaryRes = await fetch(
        `/api/support/analytics?type=all&days=${days}`,
      );
      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.data.summary);
      }

      // Fetch based on active tab
      if (activeTab === "unanswered") {
        const res = await fetch(
          `/api/support/analytics?type=unanswered&days=${days}`,
        );
        const data = await res.json();
        if (data.success) {
          setUnanswered(data.data.questions);
        }
      } else if (activeTab === "low-confidence") {
        const res = await fetch(
          `/api/support/analytics?type=low-confidence&days=${days}&confidenceThreshold=0.5`,
        );
        const data = await res.json();
        if (data.success) {
          setLowConfidence(data.data.questions);
        }
      } else if (activeTab === "suggestions") {
        const res = await fetch(
          `/api/support/analytics?type=suggestions&days=${days}`,
        );
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data.suggestions);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setToast({
        message: "Failed to fetch analytics",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshTrigger]);

  function handleSuggestionCreate(entry: KnowledgeBaseEntry) {
    setToast({
      message: "Knowledge base entry created successfully!",
      type: "success",
    });
    setSelectedSuggestion(null);
    onEntryCreated();
    // Refresh suggestions after creating entry
    setTimeout(() => {
      fetchAnalytics();
    }, 1000);
  }

  return (
    <div className="space-y-6 text-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {selectedSuggestion && (
        <SuggestedKBEntryModal
          isOpen={!!selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          suggestion={selectedSuggestion}
          onSuccess={handleSuggestionCreate}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Learning Insights
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Identify knowledge gaps and improve your RAG system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <HiRefresh
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalChats}
                </p>
              </div>
              <HiTrendingUp className="w-8 h-8 text-funBlue" />
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-red-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unanswered</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.unansweredQueries}
                </p>
              </div>
              <HiExclamationCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-yellow-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Confidence</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.lowConfidenceQueries}
                </p>
              </div>
              <HiExclamationCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Review</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.needsReview}
                </p>
              </div>
              <HiLightBulb className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "summary"
                  ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("unanswered")}
              className={`px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "unanswered"
                  ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Unanswered ({unanswered.length})
            </button>
            <button
              onClick={() => setActiveTab("low-confidence")}
              className={`px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "low-confidence"
                  ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Low Confidence ({lowConfidence.length})
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "suggestions"
                  ? "text-funBlue border-b-2 border-funBlue bg-funBlue/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Suggestions ({suggestions.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue mx-auto"></div>
            </div>
          ) : activeTab === "summary" ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Select a tab above to view detailed insights.
              </p>
            </div>
          ) : activeTab === "unanswered" ? (
            <div className="space-y-4">
              {unanswered.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No unanswered questions found in the selected period.
                </p>
              ) : (
                unanswered.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {item.question}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-600">
                          <span>Asked {item.count} time(s)</span>
                          <span>
                            First:{" "}
                            {new Date(item.firstSeen).toLocaleDateString()}
                          </span>
                          <span>
                            Last: {new Date(item.lastSeen).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedSuggestion({
                            question: item.question,
                            count: item.count,
                            reason: "no-results",
                            suggestedCategory: "general",
                            firstSeen: item.firstSeen,
                            lastSeen: item.lastSeen,
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-funBlue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <HiPlus className="w-4 h-4" />
                        Create KB Entry
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "low-confidence" ? (
            <div className="space-y-4">
              {lowConfidence.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No low-confidence queries found in the selected period.
                </p>
              ) : (
                lowConfidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {item.question}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-600 mb-2">
                          <span>Asked {item.count} time(s)</span>
                          <span>
                            Game Score: {item.avgGameScore.toFixed(3)}
                          </span>
                          <span>FAQ Score: {item.avgFAQScore.toFixed(3)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          First: {new Date(item.firstSeen).toLocaleDateString()}{" "}
                          | Last: {new Date(item.lastSeen).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedSuggestion({
                            question: item.question,
                            count: item.count,
                            reason: "low-confidence",
                            suggestedCategory: "general",
                            avgGameScore: item.avgGameScore,
                            avgFAQScore: item.avgFAQScore,
                            firstSeen: item.firstSeen,
                            lastSeen: item.lastSeen,
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-funBlue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <HiPlus className="w-4 h-4" />
                        Create KB Entry
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No suggestions found in the selected period.
                </p>
              ) : (
                suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {item.question}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.reason === "no-results"
                                ? "bg-red-100 text-red-700"
                                : item.reason === "low-confidence"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {item.reason === "no-results"
                              ? "No Results"
                              : item.reason === "low-confidence"
                                ? "Low Confidence"
                                : "Both"}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600 mb-2">
                          <span>Asked {item.count} time(s)</span>
                          <span>Category: {item.suggestedCategory}</span>
                          {item.avgGameScore !== undefined && (
                            <span>
                              Game: {item.avgGameScore.toFixed(3)} | FAQ:{" "}
                              {item.avgFAQScore?.toFixed(3)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          First: {new Date(item.firstSeen).toLocaleDateString()}{" "}
                          | Last: {new Date(item.lastSeen).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSuggestion(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-funBlue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <HiPlus className="w-4 h-4" />
                        Create KB Entry
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
