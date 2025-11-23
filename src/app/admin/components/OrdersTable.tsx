"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { HiSearch, HiEye, HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import OrderDetailsModal from "./OrderDetailsModal";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";
import AddOrderModal from "./AddOrderModal";
import Toast from "./Toast";

interface OrderGame {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;
  games: OrderGame[];
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryLandmark?: string;
  deliveryNotes?: string;
  paymentMethod: "cod" | "bank_transfer" | "gcash" | "cash";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  submittedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  orderSource: "website" | "manual";
  adminNotes?: string;
}

interface OrdersTableProps {
  refreshTrigger: number;
  onOrderUpdated: () => void;
}

export default function OrdersTable({
  refreshTrigger,
  onOrderUpdated,
}: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isLoading || isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMore],
  );

  const fetchOrders = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      if (isNewSearch) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
          search: searchTerm,
          status: statusFilter,
        });

        const response = await fetch(`/api/purchases?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setOrders((prev) => {
            if (isNewSearch) return data.purchases;
            // Filter out duplicates just in case
            const newOrders = data.purchases.filter(
              (newOrder: Order) => !prev.some((o) => o._id === newOrder._id),
            );
            return [...prev, ...newOrders];
          });
          setHasMore(data.purchases.length === 10);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setToast({ message: "Failed to fetch orders", type: "error" });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchTerm, statusFilter],
  );

  // Initial fetch and refresh trigger
  useEffect(() => {
    setPage(1);
    fetchOrders(1, true);
  }, [refreshTrigger, fetchOrders]);

  // Fetch on page change (infinite scroll)
  useEffect(() => {
    if (page > 1) {
      fetchOrders(page, false);
    }
  }, [page, fetchOrders]);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      preparing: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
      },
      shipped: { color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Completed" },
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

  function getGamesDisplay(games: OrderGame[]) {
    if (games.length === 0) return "No games";
    if (games.length === 1) {
      return games[0].gameTitle;
    }
    return `${games[0].gameTitle} + ${games.length - 1} more`;
  }

  function handleViewDetails(order: Order) {
    setSelectedOrder(order);
  }

  function handleUpdateStatus(order: Order) {
    setUpdatingOrder(order);
  }

  async function handleDeleteOrder(order: Order) {
    if (
      !confirm(
        `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    // Optimistic update: Remove immediately from UI
    const previousOrders = [...orders];

    setOrders((prev) => prev.filter((o) => o._id !== order._id));

    try {
      const response = await fetch(`/api/purchases/${order._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setToast({
          message: "Order deleted successfully",
          type: "success",
        });
        // Do NOT call onOrderUpdated() to avoid table refresh/loading state
      } else {
        // Revert on failure
        setOrders(previousOrders);
        setToast({
          message: data.error || "Failed to delete order",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      // Revert on error
      setOrders(previousOrders);
      setToast({
        message: "An error occurred while deleting the order",
        type: "error",
      });
    }
  }

  function handleUpdateSuccess() {
    setUpdatingOrder(null);
    setToast({
      message: "Order status updated successfully!",
      type: "success",
    });
    // Update local state instead of full refresh
    onOrderUpdated(); // Keep this to trigger stats update if needed, but we might want to refactor to avoid full reload
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    setToast({
      message: "Order created successfully!",
      type: "success",
    });
    onOrderUpdated();
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {orders.length > 0
            ? `Showing ${orders.length} orders`
            : "No orders found"}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, name, email, or game..."
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
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => {
                  const isLastElement = index === orders.length - 1;
                  return (
                    <tr
                      key={order._id}
                      ref={isLastElement ? lastOrderElementRef : null}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetails(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-funBlue">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.submittedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getGamesDisplay(order.games)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.games.length} game
                          {order.games.length !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.discountAmount ? (
                          <div className="text-sm text-red-600 font-medium">
                            -{formatPrice(order.discountAmount)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.totalProfit !== undefined ? (
                          <div>
                            <div
                              className={`text-sm font-semibold ${
                                order.totalProfit > 0
                                  ? "text-green-600"
                                  : order.totalProfit < 0
                                    ? "text-red-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              {formatPrice(order.totalProfit)}
                            </div>
                            {order.profitMargin !== undefined && (
                              <div
                                className={`text-xs ${
                                  order.profitMargin > 0
                                    ? "text-green-500"
                                    : order.profitMargin < 0
                                      ? "text-red-500"
                                      : "text-yellow-500"
                                }`}
                              >
                                {order.profitMargin.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order);
                            }}
                            className="text-funBlue hover:text-blue-600"
                            title="View Details"
                          >
                            <HiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Update Status"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOrder(order);
                            }}
                            className="text-red-400 hover:text-red-600"
                            title="Delete Order"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Loading Indicator */}
        {(isLoading || isLoadingMore) && (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue"></div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddOrderModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={() => {
            setSelectedOrder(null);
            onOrderUpdated();
          }}
        />
      )}

      {updatingOrder && (
        <UpdateOrderStatusModal
          order={updatingOrder}
          onClose={() => setUpdatingOrder(null)}
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
