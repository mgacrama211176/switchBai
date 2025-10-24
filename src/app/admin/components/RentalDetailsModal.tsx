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
  HiClipboardList,
} from "react-icons/hi";
import Image from "next/image";

interface Rental {
  _id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl?: string;
  customerIdImageUrl: string;
  gameTitle: string;
  gameBarcode: string;
  gamePrice: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  rentalFee: number;
  deposit: number;
  totalDue: number;
  appliedPlan: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  submittedAt: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;
}

interface RentalDetailsModalProps {
  rental: Rental;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function RentalDetailsModal({
  rental,
  onClose,
  onStatusUpdate,
}: RentalDetailsModalProps) {
  const [showIdImage, setShowIdImage] = useState(false);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatPrice(price: number) {
    return `₱${price.toLocaleString()}`;
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rental Details</h2>
            <p className="text-gray-600">Reference: {rental.referenceNumber}</p>
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
                Rental Status
              </h3>
              <div className="mt-2">{getStatusBadge(rental.status)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-funBlue">
                {rental.referenceNumber}
              </div>
              <div className="text-sm text-gray-500">
                Submitted: {formatDate(rental.submittedAt)}
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
                    <p className="text-gray-900">{rental.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{rental.customerPhone}</p>
                      <a
                        href={`tel:${rental.customerPhone}`}
                        className="text-funBlue hover:text-blue-600"
                      >
                        <HiPhone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{rental.customerEmail}</p>
                      <a
                        href={`mailto:${rental.customerEmail}`}
                        className="text-funBlue hover:text-blue-600"
                      >
                        <HiMail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  {rental.customerFacebookUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Facebook
                      </label>
                      <a
                        href={rental.customerFacebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-funBlue hover:text-blue-600 text-sm"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Valid ID
                </label>
                <div className="mt-2">
                  <button
                    onClick={() => setShowIdImage(true)}
                    className="relative w-32 h-20 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-funBlue transition-colors"
                  >
                    <img
                      src={rental.customerIdImageUrl}
                      alt="Customer ID"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Click to enlarge</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HiClipboardList className="w-5 h-5 mr-2" />
              Game Information
            </h3>
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs">Game Image</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {rental.gameTitle}
                </h4>
                <p className="text-gray-600">Barcode: {rental.gameBarcode}</p>
                <p className="text-gray-600">
                  Price: {formatPrice(rental.gamePrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HiCalendar className="w-5 h-5 mr-2" />
              Rental Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Start Date
                </label>
                <p className="text-gray-900">{formatDate(rental.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  End Date
                </label>
                <p className="text-gray-900">{formatDate(rental.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Duration
                </label>
                <p className="text-gray-900">{rental.rentalDays} days</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HiLocationMarker className="w-5 h-5 mr-2" />
              Delivery Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address
                </label>
                <p className="text-gray-900">{rental.deliveryAddress}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    City
                  </label>
                  <p className="text-gray-900">{rental.deliveryCity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Landmark
                  </label>
                  <p className="text-gray-900">{rental.deliveryLandmark}</p>
                </div>
              </div>
              {rental.deliveryNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Delivery Notes
                  </label>
                  <p className="text-gray-900">{rental.deliveryNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HiCash className="w-5 h-5 mr-2" />
              Pricing Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Rental Fee ({rental.appliedPlan})
                </span>
                <span className="font-medium">
                  {formatPrice(rental.rentalFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Refundable Deposit</span>
                <span className="font-medium text-green-600">
                  {formatPrice(rental.deposit)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Due Upfront</span>
                  <span className="text-funBlue">
                    {formatPrice(rental.totalDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onStatusUpdate}
            className="px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* ID Image Modal */}
      {showIdImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="relative max-w-2xl max-h-[90vh]">
            <button
              onClick={() => setShowIdImage(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <HiX className="w-6 h-6 text-gray-500" />
            </button>
            <img
              src={rental.customerIdImageUrl}
              alt="Customer ID - Full Size"
              className="max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
