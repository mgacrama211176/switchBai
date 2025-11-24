"use client";

import { useState } from "react";
import {
  HiX,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCalendar,
  HiCash,
  HiUser,
  HiPencil,
} from "react-icons/hi";
import UpdateTradeStatusModal from "./UpdateTradeStatusModal";

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

interface TradeDetailsModalProps {
  trade: Trade;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function TradeDetailsModal({
  trade,
  onClose,
  onStatusUpdate,
}: TradeDetailsModalProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
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

  function getTradeType() {
    const rawDifference = trade.totalValueReceived - trade.totalValueGiven;
    if (rawDifference === 0) return "Even Trade";
    if (rawDifference > 0) return "Trade Up";
    return "Trade Down";
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Trade Details
              </h2>
              <p className="text-gray-600">Reference: {trade.tradeReference}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Status and Reference */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Trade Status
                </h3>
                <div className="mt-2">{getStatusBadge(trade.status)}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-funBlue">
                  {trade.tradeReference}
                </div>
                <div className="text-sm text-gray-500">
                  Submitted: {formatDate(trade.submittedAt)}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiUser className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-gray-900">{trade.customerName}</p>
                    </div>
                    {trade.customerPhone && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Phone
                        </label>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">{trade.customerPhone}</p>
                          <a
                            href={`tel:${trade.customerPhone}`}
                            className="text-funBlue hover:text-blue-600"
                          >
                            <HiPhone className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    {trade.customerEmail && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">{trade.customerEmail}</p>
                          <a
                            href={`mailto:${trade.customerEmail}`}
                            className="text-funBlue hover:text-blue-600"
                          >
                            <HiMail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    {trade.customerFacebookUrl && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Facebook
                        </label>
                        <p className="text-gray-900">
                          <a
                            href={trade.customerFacebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-funBlue hover:text-blue-600"
                          >
                            View Profile
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Games Given */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Games Given ({trade.gamesGiven.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Game Title
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Barcode
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trade.gamesGiven.map((game, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {game.gameTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {game.gameBarcode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {game.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatPrice(game.gamePrice)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(game.gamePrice * game.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Games Received */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Games Received ({trade.gamesReceived.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Game Title
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Barcode
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {trade.gamesReceived.map((game, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {game.gameTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {game.gameBarcode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {game.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatPrice(game.gamePrice)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(game.gamePrice * game.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCash className="w-5 h-5 mr-2" />
                Trade Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Value Given:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(trade.totalValueGiven)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Value Received:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(trade.totalValueReceived)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trade Type:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getTradeType()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trade Fee:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(trade.tradeFee)}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Cash Difference (Customer Pays):
                  </span>
                  <span className="text-base font-bold text-funBlue">
                    {formatPrice(trade.cashDifference)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trade Location and Notes */}
            {(trade.tradeLocation || trade.notes) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiLocationMarker className="w-5 h-5 mr-2" />
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {trade.tradeLocation && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Trade Location
                      </label>
                      <p className="text-gray-900">{trade.tradeLocation}</p>
                    </div>
                  )}
                  {trade.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Notes
                      </label>
                      <p className="text-gray-900">{trade.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCalendar className="w-5 h-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(trade.submittedAt)}
                  </span>
                </div>
                {trade.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confirmed:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(trade.confirmedAt)}
                    </span>
                  </div>
                )}
                {trade.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(trade.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {trade.adminNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Notes
                </h3>
                <p className="text-gray-700">{trade.adminNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <HiPencil className="w-4 h-4" />
                <span>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <UpdateTradeStatusModal
          trade={trade}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => {
            setShowUpdateModal(false);
            onStatusUpdate();
          }}
        />
      )}
    </>
  );
}
