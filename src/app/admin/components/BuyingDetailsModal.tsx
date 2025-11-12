"use client";

import { HiX } from "react-icons/hi";
import { Buying } from "@/app/types/games";

interface BuyingDetailsModalProps {
  purchase: Buying;
  onClose: () => void;
}

export default function BuyingDetailsModal({
  purchase,
  onClose,
}: BuyingDetailsModalProps) {
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return `₱${price.toLocaleString()}`;
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  }

  function getProfitColor(profit: number) {
    if (profit > 0) return "text-green-600";
    if (profit === 0) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Purchase Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {purchase.purchaseReference}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Supplier Information */}
          {purchase.supplierName && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Supplier Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Name:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {purchase.supplierName}
                  </span>
                </div>
                {purchase.supplierContact && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Contact:{" "}
                    </span>
                    <span className="text-sm text-gray-900">
                      {purchase.supplierContact}
                    </span>
                  </div>
                )}
                {purchase.supplierNotes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Notes:{" "}
                    </span>
                    <span className="text-sm text-gray-900">
                      {purchase.supplierNotes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Games */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Games</h3>
            <div className="space-y-3">
              {purchase.games.map((game, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {game.gameTitle}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Barcode: {game.gameBarcode}
                      </div>
                      {game.isNewGame && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          New Game
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Quantity: {game.quantity}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Price: {formatPrice(game.sellingPrice)}
                      </div>
                      <div className="text-sm font-semibold text-funBlue mt-1">
                        Revenue:{" "}
                        {formatPrice(game.sellingPrice * game.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Financial Breakdown
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Cost:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(purchase.totalCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Total Expected Revenue:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(purchase.totalExpectedRevenue)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">
                    Total Expected Profit:
                  </span>
                  <span
                    className={`text-xl font-bold ${getProfitColor(
                      purchase.totalExpectedProfit,
                    )}`}
                  >
                    {purchase.totalExpectedProfit >= 0 ? "+" : ""}
                    {formatPrice(purchase.totalExpectedProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <span
                    className={`text-sm font-semibold ${getProfitColor(
                      purchase.totalExpectedProfit,
                    )}`}
                  >
                    {purchase.profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Status & Timeline
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                {getStatusBadge(purchase.status)}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Purchased At:{" "}
                </span>
                <span className="text-sm text-gray-900">
                  {formatDate(purchase.purchasedAt)}
                </span>
              </div>
              {purchase.completedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Completed At:{" "}
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(purchase.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {purchase.adminNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Admin Notes
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900">{purchase.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
