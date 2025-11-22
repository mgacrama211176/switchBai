"use client";

import { useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { formatPrice, formatDate } from "@/lib/purchase-form-utils";
import { HiSearch, HiCheckCircle } from "react-icons/hi";

interface OrderGame {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
}

interface OrderData {
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
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  const fetchOrder = useCallback(async (orderNum: string) => {
    if (!orderNum.trim()) {
      setError("Please enter an order number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);
    setHasSearched(true);

    try {
      // Convert to uppercase and remove spaces
      const cleanOrderNumber = orderNum
        .toUpperCase()
        .trim()
        .replace(/\s/g, "");

      const response = await fetch(
        `/api/purchases/order/${encodeURIComponent(cleanOrderNumber)}`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found. Please check your order number.");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setOrder(data.data);
        setError(null);
      } else {
        throw new Error(data.error || "Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order details. Please try again.",
      );
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchOrder(orderNumber);
  };

  // Auto-fetch order from query parameter on mount
  useEffect(() => {
    const orderNumberParam = searchParams.get("ordernumber");
    
    if (orderNumberParam && !hasAutoSearched) {
      const cleanOrderNumber = orderNumberParam
        .toUpperCase()
        .trim()
        .replace(/\s/g, "");
      
      setOrderNumber(cleanOrderNumber);
      setHasAutoSearched(true);
      fetchOrder(cleanOrderNumber);
    }
  }, [searchParams, hasAutoSearched, fetchOrder]);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery (COD)";
      case "bank_transfer":
        return "Bank Transfer";
      case "gcash":
        return "GCash";
      case "cash":
        return "Cash (Meet-up)";
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800",
        label: "Confirmed",
      },
      preparing: {
        color: "bg-purple-100 text-purple-800",
        label: "Preparing",
      },
      shipped: {
        color: "bg-green-100 text-green-800",
        label: "Shipped",
      },
      delivered: {
        color: "bg-gray-100 text-gray-800",
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        label: "Cancelled",
      },
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
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              Enter your order number to view order details and status
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Order Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., SB24120123"
                    className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-funBlue focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base uppercase"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !orderNumber.trim()}
                    className={`min-h-[44px] px-6 py-3 bg-funBlue text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base`}
                  >
                    <HiSearch className="w-5 h-5" />
                    {isLoading ? "Searching..." : "Search"}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Format: SB{new Date().getFullYear().toString().slice(-2)}
                  {String(new Date().getMonth() + 1).padStart(2, "0")}
                  {String(new Date().getDate()).padStart(2, "0")}XXX
                </p>
              </div>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && hasSearched && !isLoading && (
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Order Not Found
                </h2>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  {error}
                </p>
                <button
                  onClick={() => {
                    setOrderNumber("");
                    setError(null);
                    setHasSearched(false);
                  }}
                  className="inline-block bg-funBlue text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Order Details */}
          {order && !isLoading && (
            <div className="space-y-6 sm:space-y-8">
              {/* Success Header */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <HiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Order Found
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700">
                    Here are your order details
                  </p>
                </div>
              </div>

              {/* Order Reference */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Order Reference
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-black text-funBlue">
                    {order.orderNumber}
                  </div>
                  <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <p className="text-xs sm:text-sm text-gray-700">
                      Order Date: {formatDate(order.submittedAt)}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>

              {/* Games List */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Order Items
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {order.games.map((game, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {game.gameTitle}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            Barcode: {game.gameBarcode}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <span className="text-xs sm:text-sm text-gray-600">
                            Quantity:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {game.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-gray-600">
                            Unit Price:
                          </span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {formatPrice(game.gamePrice)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            Subtotal:
                          </span>
                          <span className="ml-2 font-bold text-funBlue text-sm sm:text-base">
                            {formatPrice(game.gamePrice * game.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Pricing Summary
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  {order.discountAmount && order.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-700">Discount:</span>
                        <span className="font-semibold text-red-600">
                          -{formatPrice(order.discountAmount)}
                        </span>
                      </div>
                      {order.discountType && order.discountValue && (
                        <div className="text-xs sm:text-sm text-gray-500 pl-2">
                          (
                          {order.discountType === "percentage"
                            ? `${order.discountValue}%`
                            : `₱${order.discountValue.toLocaleString()}`}{" "}
                          discount applied)
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-700">Delivery Fee:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.deliveryFee)}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-lg sm:text-xl font-black text-funBlue">
                      <span>Total Amount:</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Payment Method */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Payment Method
                  </h3>
                  <p className="text-sm sm:text-base text-gray-900">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </p>
                </div>

                {/* Delivery Information */}
                {order.deliveryAddress && (
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Delivery Information
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <p>
                        <span className="font-semibold text-gray-700">
                          Address:
                        </span>{" "}
                        <span className="text-gray-900">
                          {order.deliveryAddress}
                        </span>
                      </p>
                      {order.deliveryCity && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            City:
                          </span>{" "}
                          <span className="text-gray-900">
                            {order.deliveryCity}
                          </span>
                        </p>
                      )}
                      {order.deliveryLandmark && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            Landmark:
                          </span>{" "}
                          <span className="text-gray-900">
                            {order.deliveryLandmark}
                          </span>
                        </p>
                      )}
                      {order.deliveryNotes && (
                        <p>
                          <span className="font-semibold text-gray-700">
                            Notes:
                          </span>{" "}
                          <span className="text-gray-900">
                            {order.deliveryNotes}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Contact Information
                </h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">Name:</span>{" "}
                    <span className="text-gray-900">{order.customerName}</span>
                  </p>
                  {order.customerPhone && (
                    <p>
                      <span className="font-semibold text-gray-700">
                        Phone:
                      </span>{" "}
                      <span className="text-gray-900">
                        {order.customerPhone}
                      </span>
                    </p>
                  )}
                  {order.customerEmail && (
                    <p>
                      <span className="font-semibold text-gray-700">
                        Email:
                      </span>{" "}
                      <span className="text-gray-900">
                        {order.customerEmail}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              {(order.confirmedAt || order.shippedAt || order.deliveredAt) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 sm:mb-4">
                    Order Timeline
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-800">
                        Order placed: {formatDate(order.submittedAt)}
                      </span>
                    </div>
                    {order.confirmedAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-800">
                          Order confirmed: {formatDate(order.confirmedAt)}
                        </span>
                      </div>
                    )}
                    {order.shippedAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-800">
                          Order shipped: {formatDate(order.shippedAt)}
                        </span>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-800">
                          Order delivered: {formatDate(order.deliveredAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => {
                    setOrderNumber("");
                    setOrder(null);
                    setError(null);
                    setHasSearched(false);
                  }}
                  className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg sm:rounded-xl font-bold hover:bg-gray-700 transition-colors text-center text-sm sm:text-base"
                >
                  Track Another Order
                </button>
                <Link
                  href="/games"
                  className="inline-block bg-funBlue text-white px-6 py-3 rounded-lg sm:rounded-xl font-bold hover:bg-blue-600 transition-colors text-center text-sm sm:text-base"
                >
                  Browse Games
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Navigation />
          <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
