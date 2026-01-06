"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import {
  calculateTradeCashDifference,
  calculateGamesValue,
} from "@/lib/trade-utils";
import { formatPrice } from "@/lib/purchase-form-utils";
import { HiX, HiTrash } from "react-icons/hi";

function TradeFormContent() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerFacebookUrl: "",
    tradeLocation: "",
    notes: "",
  });

  // Redirect if cart is empty or not trade type
  useEffect(() => {
    if (cart.type !== "trade") {
      router.push("/cart");
      return;
    }
    if (
      cart.items.length === 0 ||
      !cart.gamesGiven ||
      cart.gamesGiven.length === 0
    ) {
      router.push("/cart");
      return;
    }
  }, [cart, router]);

  // Calculate trade summary
  const tradeSummary = (() => {
    if (cart.type !== "trade") {
      return {
        totalValueGiven: 0,
        totalValueReceived: 0,
        cashDifference: 0,
        tradeFee: 0,
        tradeType: "even" as const,
      };
    }

    const valueGiven = calculateGamesValue(cart.gamesGiven || []);
    const valueReceived = calculateGamesValue(cart.items);
    const { cashDifference, tradeFee, tradeType } =
      calculateTradeCashDifference(valueGiven, valueReceived);

    return {
      totalValueGiven: valueGiven,
      totalValueReceived: valueReceived,
      cashDifference,
      tradeFee,
      tradeType,
    };
  })();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (
      cart.type !== "trade" ||
      !cart.gamesGiven ||
      cart.gamesGiven.length === 0 ||
      cart.items.length === 0
    ) {
      setErrors({
        submit: "Invalid trade cart. Please go back and add games.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tradeData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim() || undefined,
        customerEmail: formData.customerEmail.trim() || undefined,
        customerFacebookUrl: formData.customerFacebookUrl.trim() || undefined,
        gamesGiven: cart.gamesGiven.map((game) => ({
          gameBarcode: game.gameBarcode,
          gameTitle: game.gameTitle,
          gamePrice: game.gamePrice,
          quantity: game.quantity,
          isNewGame: false,
        })),
        gamesReceived: cart.items.map((game) => ({
          gameBarcode: game.gameBarcode,
          gameTitle: game.gameTitle,
          // For trade transactions, always use original price, not sale price
          gamePrice: game.gamePrice,
          quantity: game.quantity,
          variant: game.variant || "withCase", // Include variant from cart
        })),
        tradeLocation: formData.tradeLocation.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        status: "pending",
      };

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create trade");
      }

      // Show success feedback before redirect
      setIsSuccess(true);

      // Clear cart and redirect after brief delay to show success message
      setTimeout(() => {
        clearCart();
        router.push(
          `/trade-confirmation?tradeId=${data.tradeId}&reference=${data.tradeReference}`,
        );
      }, 1500);
    } catch (error) {
      console.error("Error creating trade:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create trade",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    cart.type !== "trade" ||
    cart.items.length === 0 ||
    !cart.gamesGiven ||
    cart.gamesGiven.length === 0
  ) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                No Trade Items
              </h1>
              <p className="text-gray-700 mb-8 text-lg">
                Please add games to your trade cart first.
              </p>
              <Link
                href="/cart"
                className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Go to Trade Cart
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-black">
      <Navigation />

      <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Complete Your Trade
            </h1>
            <p className="text-gray-800">
              Review your trade and provide your information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Customer Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                          errors.customerName
                            ? "border-red-300"
                            : "border-gray-400"
                        } text-gray-900 bg-white`}
                        placeholder="Enter your full name"
                        required
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        placeholder="09XX-XXX-XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="customerFacebookUrl"
                        value={formData.customerFacebookUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        placeholder="https://facebook.com/yourprofile"
                      />
                    </div>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Trade Details
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trade Location (Optional)
                      </label>
                      <input
                        type="text"
                        name="tradeLocation"
                        value={formData.tradeLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        placeholder="Where would you like to meet for the trade?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        placeholder="Any additional notes about the trade..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  {errors.submit && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  {isSuccess && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-600 font-semibold">
                        ✓ Trade request saved successfully! Redirecting...
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Submitting Trade Request..."
                      : isSuccess
                        ? "Trade Request Saved!"
                        : "Submit Trade Request"}
                  </button>

                  <p className="text-sm text-gray-600 text-center mt-4">
                    By submitting, you agree to our terms and conditions.
                  </p>
                </div>
              </form>
            </div>

            {/* Trade Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Trade Summary
                </h2>

                {/* Games Given */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Games You're Trading In
                  </h3>
                  <div className="space-y-3">
                    {cart.gamesGiven.map((item) => (
                      <div
                        key={item.gameBarcode}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <Image
                            src={item.gameImageURL}
                            alt={item.gameTitle}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                            {item.gameTitle}
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-2 font-mono">
                            {item.gameBarcode}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-semibold">
                              ₱
                              {(
                                item.gamePrice * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Games Received */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Games You Want to Receive
                  </h3>
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.gameBarcode}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <Image
                            src={item.gameImageURL}
                            alt={item.gameTitle}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                            {item.gameTitle}
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-2 font-mono">
                            {item.gameBarcode}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm font-semibold">
                              ₱
                              {(
                                (item.isOnSale && item.salePrice
                                  ? item.salePrice
                                  : item.gamePrice) * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trade Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Value Given:</span>
                    <span className="font-semibold">
                      ₱{tradeSummary.totalValueGiven.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Value Received:</span>
                    <span className="font-semibold">
                      ₱{tradeSummary.totalValueReceived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trade Fee:</span>
                    <span className="font-semibold">
                      ₱{tradeSummary.tradeFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">
                        Cash Difference:
                      </span>
                      <span className="text-lg font-bold text-funBlue">
                        ₱{tradeSummary.cashDifference.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function TradeFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TradeFormContent />
    </Suspense>
  );
}
