"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { formatPrice, formatDate } from "@/lib/purchase-form-utils";

interface PurchaseData {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl?: string;
  gameTitle: string;
  gameBarcode: string;
  gamePrice: number;
  quantity: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  orderSource: string;
  submittedAt: string;
}

function PurchaseConfirmationContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("id");
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseDetails(purchaseId);
    } else {
      setError("No purchase ID provided.");
      setIsLoading(false);
    }
  }, [purchaseId]);

  const fetchPurchaseDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/purchases/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch purchase details");
      }
      const data = await response.json();
      if (data.success && data.data) {
        setPurchase(data.data);
      } else {
        setError(data.error || "Purchase not found.");
      }
    } catch (err) {
      console.error("Error fetching purchase details:", err);
      setError("Failed to load purchase details.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery (COD)";
      case "bank_transfer":
        return "Bank Transfer";
      case "gcash":
        return "GCash";
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      preparing: { color: "bg-purple-100 text-purple-800", label: "Preparing" },
      shipped: { color: "bg-green-100 text-green-800", label: "Shipped" },
      delivered: { color: "bg-gray-100 text-gray-800", label: "Delivered" },
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
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4 md:px-8">
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
    );
  }

  if (error || !purchase) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Purchase Not Found
            </h1>
            <p className="text-gray-800 mb-8">{error}</p>
            <Link
              href="/games"
              className="inline-block bg-funBlue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Browse Games
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-800">
              Thank you for your purchase. We'll process your order shortly.
            </p>
          </div>

          {/* Order Reference */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Reference
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-black text-funBlue">
                {purchase.orderNumber}
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Keep this reference number for your records
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Game:</span>
                <span className="font-semibold text-gray-900">
                  {purchase.gameTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {purchase.quantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Unit Price:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(purchase.gamePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Payment Method:</span>
                <span className="font-semibold text-gray-900">
                  {getPaymentMethodLabel(purchase.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Order Status:</span>
                {getStatusBadge(purchase.status)}
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">
                    {formatPrice(purchase.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee:</span>
                  <span className="font-bold">
                    {formatPrice(purchase.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black text-funBlue pt-3 border-t-2 border-blue-300">
                  <span>Total Amount:</span>
                  <span>{formatPrice(purchase.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delivery Information
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-gray-700">Address:</span>{" "}
                <span className="text-gray-900">
                  {purchase.deliveryAddress}
                </span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">City:</span>{" "}
                <span className="text-gray-900">{purchase.deliveryCity}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Landmark:</span>{" "}
                <span className="text-gray-900">
                  {purchase.deliveryLandmark}
                </span>
              </p>
              {purchase.deliveryNotes && (
                <p>
                  <span className="font-semibold text-gray-700">Notes:</span>{" "}
                  <span className="text-gray-900">
                    {purchase.deliveryNotes}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold text-gray-700">Name:</span>{" "}
                <span className="text-gray-900">{purchase.customerName}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Phone:</span>{" "}
                <span className="text-gray-900">{purchase.customerPhone}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{purchase.customerEmail}</span>
              </p>
              {purchase.customerFacebookUrl && (
                <p>
                  <span className="font-semibold text-gray-700">Facebook:</span>{" "}
                  <a
                    href={purchase.customerFacebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-funBlue hover:text-blue-600"
                  >
                    View Profile
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              What's Next?
            </h2>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <p>
                  We will send you a <strong>text message</strong> and{" "}
                  <strong>email</strong> to confirm your order within 24 hours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <p>
                  Once confirmed, we'll prepare your order and arrange delivery
                  to the address provided.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <p>
                  You'll receive tracking information when your order ships.
                  Enjoy your new game!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games"
              className="inline-block bg-funBlue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors text-center"
            >
              Browse More Games
            </Link>
            <Link
              href="/"
              className="inline-block bg-gray-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PurchaseConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Navigation />
          <div className="pt-32 pb-16 px-4 md:px-8">
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
      <PurchaseConfirmationContent />
    </Suspense>
  );
}

