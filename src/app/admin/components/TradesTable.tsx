"use client";

import { useEffect, useState } from "react";
import {
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiPencil,
  HiPlus,
} from "react-icons/hi";
import TradeDetailsModal from "./TradeDetailsModal";
import UpdateTradeStatusModal from "./UpdateTradeStatusModal";
import AddTradeModal from "./AddTradeModal";
import Toast from "./Toast";

interface TradeGame {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
}

interface Trade {
  _id: string;
  tradeReference: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;
  gamesGiven: TradeGame[];
  gamesReceived: TradeGame[];
  tradeLocation?: string;
  notes?: string;
  totalValueGiven: number;
  totalValueReceived: number;
  cashDifference: number;
  tradeFee: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  submittedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  adminNotes?: string;
}

interface TradesTableProps {
  refreshTrigger: number;
  onTradeUpdated: () => void;
}

export default function TradesTable({
  refreshTrigger,
  onTradeUpdated,
}: TradesTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [updatingTrade, setUpdatingTrade] = useState<Trade | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchTrades() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/trades");
        const data = await response.json();
        setTrades(data.trades || []);
        setFilteredTrades(data.trades || []);
      } catch (error) {
        console.error("Error fetching trades:", error);
        setToast({ message: "Failed to fetch trades", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrades();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...trades];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (trade) =>
          trade.tradeReference.toLowerCase().includes(searchLower) ||
          trade.customerName.toLowerCase().includes(searchLower) ||
          (trade.customerEmail &&
            trade.customerEmail.toLowerCase().includes(searchLower)) ||
          trade.gamesGiven.some(
            (game) =>
              game.gameTitle.toLowerCase().includes(searchLower) ||
              game.gameBarcode.toLowerCase().includes(searchLower),
          ) ||
          trade.gamesReceived.some(
            (game) =>
              game.gameTitle.toLowerCase().includes(searchLower) ||
              game.gameBarcode.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((trade) => trade.status === statusFilter);
    }

    setFilteredTrades(filtered);
    setCurrentPage(1);
  }, [trades, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrades = filteredTrades.slice(startIndex, endIndex);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

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

  function getGamesDisplay(games: TradeGame[]) {
    if (games.length === 0) return "No games";
    if (games.length === 1) {
      return games[0].gameTitle;
    }
    return `${games[0].gameTitle} + ${games.length - 1} more`;
  }

  function handleViewDetails(trade: Trade) {
    setSelectedTrade(trade);
  }

  function handleUpdateStatus(trade: Trade) {
    setUpdatingTrade(trade);
  }

  function handleUpdateSuccess() {
    setUpdatingTrade(null);
    setToast({
      message: "Trade status updated successfully!",
      type: "success",
    });
    onTradeUpdated();
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    setToast({
      message: "Trade created successfully!",
      type: "success",
    });
    onTradeUpdated();
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
          Showing {currentTrades.length} of {filteredTrades.length} trades
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, name, email, or game..."
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Games Given
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Games Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cash Difference
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
              {currentTrades.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No trades found
                  </td>
                </tr>
              ) : (
                currentTrades.map((trade) => (
                  <tr
                    key={trade._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(trade)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-funBlue">
                        {trade.tradeReference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(trade.submittedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trade.customerName}
                      </div>
                      {trade.customerEmail && (
                        <div className="text-sm text-gray-500">
                          {trade.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getGamesDisplay(trade.gamesGiven)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trade.gamesGiven.length} game
                        {trade.gamesGiven.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getGamesDisplay(trade.gamesReceived)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {trade.gamesReceived.length} game
                        {trade.gamesReceived.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(trade.cashDifference)}
                      </div>
                      {trade.tradeFee > 0 && (
                        <div className="text-xs text-gray-500">
                          (Fee: {formatPrice(trade.tradeFee)})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(trade.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(trade);
                          }}
                          className="text-funBlue hover:text-blue-600"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(trade);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <HiPencil className="w-4 h-4" />
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
              {Math.min(endIndex, filteredTrades.length)} of{" "}
              {filteredTrades.length} results
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
        <AddTradeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {selectedTrade && (
        <TradeDetailsModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onStatusUpdate={() => {
            setSelectedTrade(null);
            onTradeUpdated();
          }}
        />
      )}

      {updatingTrade && (
        <UpdateTradeStatusModal
          trade={updatingTrade}
          onClose={() => setUpdatingTrade(null)}
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
