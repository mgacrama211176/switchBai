"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiSearch,
  HiRefresh,
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiLightBulb,
  HiChat,
  HiX,
} from "react-icons/hi";
import Toast from "./Toast";
import KnowledgeBaseForm, { KnowledgeBaseEntry } from "./KnowledgeBaseForm";

interface Conversation {
  _id: string;
  chatId: string;
  messageCount: number;
  ragMetrics?: {
    query: string;
    gamesRetrieved: number;
    faqsRetrieved: number;
    avgGameScore: number;
    avgFAQScore: number;
    hasLowConfidence: boolean;
  };
  responseMetrics?: {
    modelUsed: string;
    responseTime: number;
  };
  feedback?: {
    helpful: boolean;
    rating?: number;
    comment?: string;
  };
  needsReview: boolean;
  reviewed: boolean;
  adminNotes?: string;
  conversationEnded: boolean;
  createdAt: string;
}

interface ConversationDetail extends Conversation {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>;
}

interface ConversationReviewProps {
  refreshTrigger: number;
  onEntryCreated: () => void;
}

export default function ConversationReview({
  refreshTrigger,
  onEntryCreated,
}: ConversationReviewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [filter, setFilter] = useState<"all" | "needsReview" | "reviewed">(
    "needsReview",
  );
  const [showKBForm, setShowKBForm] = useState(false);
  const [kbFormData, setKbFormData] = useState<{
    question: string;
    answer: string;
    category: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("days", days.toString());
      if (filter === "needsReview") {
        params.append("needsReview", "true");
        params.append("reviewed", "false");
      } else if (filter === "reviewed") {
        params.append("reviewed", "true");
      }

      const response = await fetch(
        `/api/support/conversations?${params.toString()}`,
      );
      const data = await response.json();

      if (data.success && data.data) {
        setConversations(data.data.conversations);
      } else {
        throw new Error(data.error || "Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setToast({
        message: "Failed to fetch conversations",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [days, filter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshTrigger]);

  async function fetchConversationDetail(chatId: string) {
    try {
      const response = await fetch(`/api/support/conversations/${chatId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedConversation(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch conversation");
      }
    } catch (error) {
      console.error("Error fetching conversation detail:", error);
      setToast({
        message: "Failed to fetch conversation details",
        type: "error",
      });
    }
  }

  async function markAsReviewed(chatId: string, reviewed: boolean) {
    try {
      const response = await fetch(`/api/support/conversations/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: `Conversation marked as ${reviewed ? "reviewed" : "needs review"}`,
          type: "success",
        });
        fetchConversations();
        if (selectedConversation?.chatId === chatId) {
          setSelectedConversation({
            ...selectedConversation,
            reviewed,
          });
        }
      }
    } catch (error) {
      console.error("Error updating conversation:", error);
      setToast({
        message: "Failed to update conversation",
        type: "error",
      });
    }
  }

  async function updateAdminNotes(chatId: string, notes: string) {
    try {
      const response = await fetch(`/api/support/conversations/${chatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });

      const data = await response.json();

      if (data.success) {
        setToast({
          message: "Admin notes updated",
          type: "success",
        });
        if (selectedConversation?.chatId === chatId) {
          setSelectedConversation({
            ...selectedConversation,
            adminNotes: notes,
          });
        }
      }
    } catch (error) {
      console.error("Error updating admin notes:", error);
      setToast({
        message: "Failed to update admin notes",
        type: "error",
      });
    }
  }

  function handleCreateKBEntry(userMessage: string, assistantMessage: string) {
    // Simple category detection
    const lowerMessage = userMessage.toLowerCase();
    let category = "general";
    if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("pay") ||
      lowerMessage.includes("gcash")
    ) {
      category = "payment";
    } else if (
      lowerMessage.includes("rental") ||
      lowerMessage.includes("rent")
    ) {
      category = "rental";
    } else if (lowerMessage.includes("trade")) {
      category = "trade";
    } else if (
      lowerMessage.includes("delivery") ||
      lowerMessage.includes("shipping")
    ) {
      category = "shipping";
    }

    setKbFormData({
      question: userMessage,
      answer: assistantMessage,
      category,
    });
    setShowKBForm(true);
  }

  function handleKBEntryCreated(entry: KnowledgeBaseEntry) {
    setShowKBForm(false);
    setKbFormData(null);
    setToast({
      message: "Knowledge base entry created successfully!",
      type: "success",
    });
    onEntryCreated();
    if (selectedConversation) {
      markAsReviewed(selectedConversation.chatId, true);
    }
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

      {showKBForm && kbFormData && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Create KB Entry from Conversation
              </h2>
              <button
                onClick={() => {
                  setShowKBForm(false);
                  setKbFormData(null);
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-300"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <KnowledgeBaseForm
                mode="create"
                initialData={kbFormData}
                onSuccess={handleKBEntryCreated}
                onCancel={() => {
                  setShowKBForm(false);
                  setKbFormData(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Conversation Review
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and calibrate support conversations
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
            onClick={fetchConversations}
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-funBlue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("needsReview")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "needsReview"
              ? "bg-funBlue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Needs Review
        </button>
        <button
          onClick={() => setFilter("reviewed")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "reviewed"
              ? "bg-funBlue text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Reviewed
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Conversations ({conversations.length})
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue mx-auto"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No conversations found
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => fetchConversationDetail(conv.chatId)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.chatId === conv.chatId
                      ? "bg-funBlue/5 border-l-4 border-funBlue"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {conv.chatId.substring(0, 8)}...
                        </p>
                        {conv.needsReview && !conv.reviewed && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                            Review
                          </span>
                        )}
                        {conv.reviewed && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {conv.messageCount} messages •{" "}
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                      {conv.ragMetrics && (
                        <div className="text-xs text-gray-500">
                          Games: {conv.ragMetrics.gamesRetrieved} • FAQs:{" "}
                          {conv.ragMetrics.faqsRetrieved} • Score:{" "}
                          {(
                            (conv.ragMetrics.avgGameScore +
                              conv.ragMetrics.avgFAQScore) /
                            2
                          ).toFixed(2)}
                        </div>
                      )}
                      {conv.feedback && (
                        <div className="mt-2 flex items-center gap-2">
                          {conv.feedback.helpful ? (
                            <span className="text-green-600 text-xs">
                              ✓ Helpful
                            </span>
                          ) : (
                            <span className="text-red-600 text-xs">
                              ✗ Not helpful
                            </span>
                          )}
                          {conv.feedback.rating && (
                            <span className="text-xs text-gray-500">
                              {conv.feedback.rating}/5
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Conversation Details
                  </h3>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[600px] space-y-4">
                {/* Metrics */}
                {selectedConversation.ragMetrics && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      RAG Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Games:</span>{" "}
                        {selectedConversation.ragMetrics.gamesRetrieved}
                      </div>
                      <div>
                        <span className="text-gray-600">FAQs:</span>{" "}
                        {selectedConversation.ragMetrics.faqsRetrieved}
                      </div>
                      <div>
                        <span className="text-gray-600">Game Score:</span>{" "}
                        {selectedConversation.ragMetrics.avgGameScore.toFixed(
                          3,
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">FAQ Score:</span>{" "}
                        {selectedConversation.ragMetrics.avgFAQScore.toFixed(3)}
                      </div>
                    </div>
                    {selectedConversation.ragMetrics.hasLowConfidence && (
                      <div className="mt-2 text-xs text-yellow-600">
                        ⚠ Low confidence
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-900">
                    Messages
                  </h4>
                  {selectedConversation.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {msg.role === "user" ? "User" : "Assistant"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{msg.content}</p>
                      {msg.role === "user" &&
                        idx < selectedConversation.messages.length - 1 && (
                          <button
                            onClick={() => {
                              const assistantMsg =
                                selectedConversation.messages[idx + 1];
                              if (assistantMsg.role === "assistant") {
                                handleCreateKBEntry(
                                  msg.content,
                                  assistantMsg.content,
                                );
                              }
                            }}
                            className="mt-2 text-xs text-funBlue hover:underline"
                          >
                            Create KB entry from this Q&A
                          </button>
                        )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      markAsReviewed(
                        selectedConversation.chatId,
                        !selectedConversation.reviewed,
                      )
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedConversation.reviewed
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {selectedConversation.reviewed ? (
                      <>
                        <HiXCircle className="w-4 h-4" />
                        Mark as Needs Review
                      </>
                    ) : (
                      <>
                        <HiCheckCircle className="w-4 h-4" />
                        Mark as Reviewed
                      </>
                    )}
                  </button>
                </div>

                {/* Admin Notes */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={selectedConversation.adminNotes || ""}
                    onChange={(e) =>
                      updateAdminNotes(
                        selectedConversation.chatId,
                        e.target.value,
                      )
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all text-sm"
                    placeholder="Add notes about this conversation..."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <HiChat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
