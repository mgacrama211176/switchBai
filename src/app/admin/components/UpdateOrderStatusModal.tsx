"use client";

import { useState } from "react";
import { HiX, HiCheck } from "react-icons/hi";
import Toast from "./Toast";

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

interface UpdateOrderStatusModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateOrderStatusModal({
  order,
  onClose,
  onSuccess,
}: UpdateOrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      description: "New order awaiting confirmation",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      description: "Order confirmed and ready to process",
    },
    {
      value: "preparing",
      label: "Processing",
      description: "Order is being prepared for shipment",
    },
    {
      value: "shipped",
      label: "Shipped",
      description: "Order has been shipped",
    },
    {
      value: "delivered",
      label: "Completed",
      description: "Order delivered to customer (stock will be deducted)",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      description: "Order has been cancelled",
    },
  ];

  const validTransitions: Record<string, string[]> = {
    pending: ["confirmed", "preparing", "shipped", "cancelled"],
    confirmed: ["preparing", "shipped", "cancelled"],
    preparing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [], // Terminal state
    cancelled: [], // Terminal state
  };

  const availableStatuses = validTransitions[order.status] || [];

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

  async function handleUpdate() {
    if (selectedStatus === order.status) {
      setToast({ message: "Please select a different status", type: "error" });
      return;
    }

    if (!availableStatuses.includes(selectedStatus)) {
      setToast({ message: "Invalid status transition", type: "error" });
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/purchases/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      setToast({
        message: "Order status updated successfully!",
        type: "success",
      });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to update status",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Update Order Status
            </h2>
            <p className="text-gray-600">Order: {order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUpdating}
          >
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="flex items-center space-x-2">
              {getStatusBadge(order.status)}
              <span className="text-sm text-gray-600">
                {order.customerName}
              </span>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as
                    | "pending"
                    | "confirmed"
                    | "preparing"
                    | "shipped"
                    | "delivered"
                    | "cancelled",
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
            >
              {statusOptions.map((option) => {
                const isAvailable = availableStatuses.includes(option.value);
                const isCurrent = option.value === order.status;
                return (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={!isAvailable && !isCurrent}
                  >
                    {option.label} {isCurrent ? "(Current)" : ""}
                    {!isAvailable && !isCurrent ? " (Not Available)" : ""}
                  </option>
                );
              })}
            </select>
            {selectedStatus !== order.status && (
              <p className="mt-1 text-sm text-gray-600">
                {
                  statusOptions.find((opt) => opt.value === selectedStatus)
                    ?.description
                }
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
              placeholder="Add any notes about this status change..."
            />
          </div>

          {/* Status Transition Info */}
          {availableStatuses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Available Transitions
              </h4>
              <div className="space-y-1">
                {availableStatuses.map((status) => {
                  const option = statusOptions.find(
                    (opt) => opt.value === status,
                  );
                  return (
                    <div key={status} className="text-sm text-blue-800">
                      • {option?.label}: {option?.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {availableStatuses.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This order is in a terminal state and cannot be updated.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              selectedStatus === order.status ||
              !availableStatuses.includes(selectedStatus)
            }
            className="px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <HiCheck className="w-4 h-4" />
                <span>Update Status</span>
              </>
            )}
          </button>
        </div>
      </div>

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
