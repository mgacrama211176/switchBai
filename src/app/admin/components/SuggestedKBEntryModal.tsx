"use client";

import { useState } from "react";
import { HiX } from "react-icons/hi";
import KnowledgeBaseForm from "./KnowledgeBaseForm";
import { KnowledgeBaseEntry } from "./KnowledgeBaseForm";

interface SuggestedKBEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: {
    question: string;
    count?: number;
    reason?: string;
    suggestedCategory?: string;
    avgGameScore?: number;
    avgFAQScore?: number;
  };
  onSuccess: (entry: KnowledgeBaseEntry) => void;
}

export default function SuggestedKBEntryModal({
  isOpen,
  onClose,
  suggestion,
  onSuccess,
}: SuggestedKBEntryModalProps) {
  if (!isOpen) return null;

  function handleSuccess(entry: KnowledgeBaseEntry) {
    onSuccess(entry);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create KB Entry from Suggestion
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              This question was asked {suggestion.count || 1} time(s) and needs
              a knowledge base entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-300"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Suggestion Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Suggested Question:
                </p>
                <p className="text-gray-900 font-medium">
                  {suggestion.question}
                </p>
              </div>
              <div className="ml-4 text-right">
                {suggestion.reason && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      suggestion.reason === "no-results"
                        ? "bg-red-100 text-red-700"
                        : suggestion.reason === "low-confidence"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {suggestion.reason === "no-results"
                      ? "No Results"
                      : suggestion.reason === "low-confidence"
                        ? "Low Confidence"
                        : "Both"}
                  </span>
                )}
              </div>
            </div>
            {suggestion.avgGameScore !== undefined &&
              suggestion.avgFAQScore !== undefined && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex gap-4 text-xs text-blue-700">
                    <span>
                      Avg Game Score: {suggestion.avgGameScore.toFixed(3)}
                    </span>
                    <span>
                      Avg FAQ Score: {suggestion.avgFAQScore.toFixed(3)}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Form */}
          <KnowledgeBaseForm
            mode="create"
            initialData={{
              question: suggestion.question,
              answer: "",
              category:
                (suggestion.suggestedCategory as
                  | "payment"
                  | "rental"
                  | "trade"
                  | "shipping"
                  | "general") || "general",
              metadata: {
                tags: [],
                priority: suggestion.count && suggestion.count > 5 ? 1 : 0,
              },
            }}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
