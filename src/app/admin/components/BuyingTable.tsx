"use client";

import { useEffect, useState } from "react";
import {
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiPencil,
  HiPlus,
  HiTrash,
} from "react-icons/hi";
import BuyingDetailsModal from "./BuyingDetailsModal";
import UpdateBuyingModal from "./UpdateBuyingModal";
import AddBuyingModal from "./AddBuyingModal";
import Toast from "./Toast";
import { Buying } from "@/app/types/games";

interface BuyingTableProps {
  refreshTrigger: number;
  onBuyingUpdated: () => void;
}

export default function BuyingTable({
  refreshTrigger,
  onBuyingUpdated,
}: BuyingTableProps) {
  const [purchases, setPurchases] = useState<Buying[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Buying[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState<Buying | null>(null);
  const [updatingPurchase, setUpdatingPurchase] = useState<Buying | null>(null);
  const [deletingPurchase, setDeletingPurchase] = useState<Buying | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchPurchases() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/buying");
        const data = await response.json();
        setPurchases(data.purchases || []);
        setFilteredPurchases(data.purchases || []);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        setToast({ message: "Failed to fetch purchases", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPurchases();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...purchases];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (purchase) =>
          purchase.purchaseReference.toLowerCase().includes(searchLower) ||
          (purchase.supplierName &&
            purchase.supplierName.toLowerCase().includes(searchLower)) ||
          purchase.games.some(
            (game) =>
              game.gameTitle.toLowerCase().includes(searchLower) ||
              game.gameBarcode.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((purchase) => purchase.status === statusFilter);
    }

    setFilteredPurchases(filtered);
    setCurrentPage(1);
  }, [purchases, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatPrice(price: number) {
    return `₱${price.toLocaleString()}`;
  }

  function getProfitColor(profit: number) {
    if (profit > 0) return "text-green-600";
    if (profit === 0) return "text-yellow-600";
    return "text-red-600";
  }

  function handleViewDetails(purchase: Buying) {
    setSelectedPurchase(purchase);
  }

  function handleUpdate(purchase: Buying) {
    setUpdatingPurchase(purchase);
  }

  async function handleDelete(purchase: Buying) {
    if (
      !confirm(
        `Are you sure you want to delete purchase ${purchase.purchaseReference}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/buying/${purchase._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete purchase");
      }

      setToast({
        message: "Purchase deleted successfully!",
        type: "success",
      });
      onBuyingUpdated();
    } catch (error: any) {
      console.error("Error deleting purchase:", error);
      setToast({
        message: error.message || "Failed to delete purchase",
        type: "error",
      });
    }
  }

  function handleUpdateSuccess() {
    setUpdatingPurchase(null);
    setToast({
      message: "Purchase updated successfully!",
      type: "success",
    });
    onBuyingUpdated();
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    setToast({
      message: "Purchase created successfully!",
      type: "success",
    });
    onBuyingUpdated();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {currentPurchases.length} of {filteredPurchases.length}{" "}
          purchases
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Purchase</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, supplier, or game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expected Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expected Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPurchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No purchases found
                  </td>
                </tr>
              ) : (
                currentPurchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(purchase)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-funBlue">
                        {purchase.purchaseReference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(purchase.purchasedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.supplierName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.games.length} game
                        {purchase.games.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(purchase.totalCost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(purchase.totalExpectedRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-semibold ${getProfitColor(
                          purchase.totalExpectedProfit,
                        )}`}
                      >
                        {purchase.totalExpectedProfit >= 0 ? "+" : ""}
                        {formatPrice(purchase.totalExpectedProfit)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {purchase.profitMargin.toFixed(1)}% margin
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(purchase);
                          }}
                          className="text-funBlue hover:text-blue-600"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate(purchase);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(purchase);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredPurchases.length)} of{" "}
              {filteredPurchases.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBuyingModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {selectedPurchase && (
        <BuyingDetailsModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}

      {updatingPurchase && (
        <UpdateBuyingModal
          purchase={updatingPurchase}
          onClose={() => setUpdatingPurchase(null)}
          onSuccess={handleUpdateSuccess}
        />
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

