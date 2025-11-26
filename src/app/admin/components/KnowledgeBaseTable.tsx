"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HiSearch,
  HiRefresh,
  HiPencil,
  HiTrash,
  HiPlus,
  HiX,
} from "react-icons/hi";
import Toast from "./Toast";
import KnowledgeBaseForm, { KnowledgeBaseEntry } from "./KnowledgeBaseForm";

interface KnowledgeBaseTableProps {
  refreshTrigger: number;
  onEntryUpdated: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  payment: "Payment",
  rental: "Rental",
  trade: "Trade",
  shipping: "Shipping",
  general: "General",
};

export default function KnowledgeBaseTable({
  refreshTrigger,
  onEntryUpdated,
}: KnowledgeBaseTableProps) {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(
    null,
  );
  const [deletingEntry, setDeletingEntry] = useState<KnowledgeBaseEntry | null>(
    null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (categoryFilter) {
        params.append("category", categoryFilter);
      }
      params.append("limit", "1000"); // Get all entries

      const response = await fetch(`/api/knowledge-base?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.data) {
        setEntries(data.data.entries);
      } else {
        throw new Error(data.error || "Failed to fetch entries");
      }
    } catch (error) {
      console.error("Error fetching knowledge base entries:", error);
      setToast({
        message: "Failed to fetch knowledge base entries",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, refreshTrigger]);

  async function handleDelete(entry: KnowledgeBaseEntry) {
    try {
      const response = await fetch(`/api/knowledge-base/${entry._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete entry");
      }

      setToast({
        message: "Knowledge base entry deleted successfully!",
        type: "success",
      });

      setDeletingEntry(null);
      onEntryUpdated();
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to delete entry",
        type: "error",
      });
    }
  }

  function handleEditSuccess(entry: KnowledgeBaseEntry) {
    setEditingEntry(null);
    setShowAddForm(false);
    onEntryUpdated();
    fetchEntries();
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchTerm ||
      entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Edit Knowledge Base Entry
              </h2>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-300"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <KnowledgeBaseForm
                mode="edit"
                initialData={editingEntry}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingEntry(null)}
              />
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Knowledge Base Entry
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-300"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <KnowledgeBaseForm
                mode="create"
                onSuccess={handleEditSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {deletingEntry && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Delete Entry?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this knowledge base entry? This
                action cannot be undone.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-semibold text-gray-900 mb-2">Question:</p>
                <p className="text-sm text-gray-700">
                  {deletingEntry.question}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setDeletingEntry(null)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingEntry)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage FAQ entries for AI support chat
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-funBlue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            Add Entry
          </button>
          <button
            onClick={fetchEntries}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by question or answer..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all"
        >
          <option value="">All Categories</option>
          <option value="payment">Payment</option>
          <option value="rental">Rental</option>
          <option value="trade">Trade</option>
          <option value="shipping">Shipping</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Question
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Answer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Tags
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue mx-auto"></div>
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <p className="text-gray-500">No entries found</p>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      {entry.question}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {truncateText(entry.answer, 100)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {CATEGORY_LABELS[entry.category] || entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">
                      {entry.metadata?.priority || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.metadata?.tags &&
                      entry.metadata.tags.length > 0 ? (
                        entry.metadata.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                      {entry.metadata?.tags &&
                        entry.metadata.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{entry.metadata.tags.length - 3}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="p-2 rounded-lg text-funBlue hover:bg-funBlue/10 transition-colors duration-300"
                        title="Edit"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-300"
                        title="Delete"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Entry Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredEntries.length} of {entries.length} entries
      </div>
    </div>
  );
}
