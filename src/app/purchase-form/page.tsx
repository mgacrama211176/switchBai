"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Game } from "@/app/types/games";
import { fetchGameByBarcode } from "@/lib/api-client";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import {
  validatePurchaseData,
  calculateDeliveryFee,
  calculateTotal,
  formatPrice,
  METRO_MANILA_CITIES,
} from "@/lib/purchase-form-utils";
import { useCart } from "@/contexts/CartContext";

function PurchaseFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const gameBarcode = searchParams.get("game");
  const initialQuantity = parseInt(searchParams.get("qty") || "1");

  // Redirect to cart if game is provided (backward compatibility)
  useEffect(() => {
    if (gameBarcode) {
      // Add game to cart and redirect
      const loadAndAddToCart = async () => {
        try {
          const response = await fetchGameByBarcode(gameBarcode);
          if (response.success && response.data) {
            const game = response.data;
            // Set cart type to purchase if empty
            if (cart.items.length === 0 || !cart.type) {
              addToCart(game, initialQuantity, "purchase");
            } else if (cart.type === "purchase") {
              addToCart(game, initialQuantity, "purchase");
            }
            router.push("/cart");
          }
        } catch (error) {
          console.error("Error loading game:", error);
        }
      };
      loadAndAddToCart();
    }
  }, [gameBarcode, initialQuantity, addToCart, cart, router]);

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerFacebookUrl: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryLandmark: "",
    deliveryNotes: "",
    quantity: initialQuantity,
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate order summary values reactively (must be before any conditional returns)
  const { deliveryFee, subtotal, totalAmount } = useMemo(() => {
    if (!game) {
      return { deliveryFee: 0, subtotal: 0, totalAmount: 0 };
    }
    const fee = calculateDeliveryFee(formData.deliveryCity);
    const sub = game.gamePrice * formData.quantity;
    const total = calculateTotal(sub, fee);
    return { deliveryFee: fee, subtotal: sub, totalAmount: total };
  }, [game, formData.quantity, formData.deliveryCity]);

  useEffect(() => {
    if (gameBarcode) {
      loadGame();
    } else {
      setError("No game selected");
      setIsLoading(false);
    }
  }, [gameBarcode]);

  const loadGame = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchGameByBarcode(gameBarcode!);
      if (response.success && response.data) {
        setGame(response.data);
      } else {
        setError(response.error || "Game not found");
      }
    } catch (err) {
      console.error("Error loading game:", err);
      setError("Failed to load game details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (
      newQuantity >= 1 &&
      newQuantity <= Math.min(5, game?.gameAvailableStocks || 0)
    ) {
      setFormData((prev) => ({ ...prev, quantity: newQuantity }));
    }
  };

  const validateForm = () => {
    const validationErrors = validatePurchaseData({
      ...formData,
      gameBarcode: gameBarcode || "",
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !game) return;

    setIsSubmitting(true);

    try {
      const deliveryFee = calculateDeliveryFee(formData.deliveryCity);
      const subtotal = game.gamePrice * formData.quantity;
      const totalAmount = calculateTotal(subtotal, deliveryFee);

      const purchaseRequest = {
        // Customer details
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim() || undefined,
        customerEmail: formData.customerEmail.trim() || undefined,
        customerFacebookUrl: formData.customerFacebookUrl.trim() || undefined,

        // Games array (new format)
        games: [
          {
            gameBarcode: game.gameBarcode,
            gameTitle: game.gameTitle,
            gamePrice: game.gamePrice,
            quantity: formData.quantity,
          },
        ],

        // Delivery details
        deliveryAddress: formData.deliveryAddress.trim() || undefined,
        deliveryCity: formData.deliveryCity.trim() || undefined,
        deliveryLandmark: formData.deliveryLandmark.trim() || undefined,
        deliveryNotes: formData.deliveryNotes.trim() || undefined,

        // Payment details
        paymentMethod: formData.paymentMethod,
        deliveryFee,
        subtotal,
        totalAmount,

        // Metadata
        orderSource: "website",
      };

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseRequest),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push(`/purchase-confirmation?id=${result.purchaseId}`);
      } else {
        setErrors({
          submit: result.error || "Failed to submit purchase request",
        });
      }
    } catch (error) {
      console.error("Purchase submission error:", error);
      setErrors({ submit: "Failed to submit purchase request" });
    } finally {
      setIsSubmitting(false);
    }
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

  if (error || !game) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Game Not Found
            </h1>
            <p className="text-gray-800 mb-8">{error}</p>
            <button
              onClick={() => router.push("/games")}
              className="inline-block bg-funBlue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Browse Games
            </button>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-800">
              Fill in your details to place your order
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-5">
                  {/* Game Info */}
                  <div className="flex items-start gap-3">
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                      <Image
                        src={game.gameImageURL}
                        alt={game.gameTitle}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 break-words">
                        {game.gameTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1.5 font-mono truncate">
                        {game.gameBarcode}
                      </p>
                      <p className="text-sm font-semibold text-funBlue">
                        {formatPrice(game.gamePrice)}
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-600 font-medium">
                        Quantity:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formData.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-600 font-medium">
                        Subtotal:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-600 font-medium">
                        Delivery Fee:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">
                          Total:
                        </span>
                        <span className="text-lg font-bold text-funBlue">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
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
                        maxLength={100}
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
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                          errors.customerPhone
                            ? "border-red-300"
                            : "border-gray-400"
                        } text-gray-900 bg-white`}
                        placeholder="09XX-XXX-XXXX"
                        maxLength={20}
                        required
                      />
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                          errors.customerEmail
                            ? "border-red-300"
                            : "border-gray-400"
                        } text-gray-900 bg-white`}
                        placeholder="your@email.com"
                        maxLength={100}
                        required
                      />
                      {errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerEmail}
                        </p>
                      )}
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
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                          errors.customerFacebookUrl
                            ? "border-red-300"
                            : "border-gray-400"
                        } text-gray-900 bg-white`}
                        placeholder="https://facebook.com/yourprofile"
                        maxLength={200}
                      />
                      {errors.customerFacebookUrl && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customerFacebookUrl}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Delivery Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complete Address *
                      </label>
                      <textarea
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                          errors.deliveryAddress
                            ? "border-red-300"
                            : "border-gray-400"
                        } text-gray-900 bg-white`}
                        placeholder="House number, street, barangay"
                        maxLength={500}
                        required
                      />
                      {errors.deliveryAddress && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.deliveryAddress}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <select
                          name="deliveryCity"
                          value={formData.deliveryCity}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                            errors.deliveryCity
                              ? "border-red-300"
                              : "border-gray-400"
                          } text-gray-900 bg-white`}
                          required
                        >
                          <option value="">Select City</option>
                          {METRO_MANILA_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="Other">Other (Provincial)</option>
                        </select>
                        {errors.deliveryCity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.deliveryCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark *
                        </label>
                        <input
                          type="text"
                          name="deliveryLandmark"
                          value={formData.deliveryLandmark}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                            errors.deliveryLandmark
                              ? "border-red-300"
                              : "border-gray-400"
                          } text-gray-900 bg-white`}
                          placeholder="Near mall, school, etc."
                          maxLength={200}
                          required
                        />
                        {errors.deliveryLandmark && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.deliveryLandmark}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Notes (Optional)
                      </label>
                      <textarea
                        name="deliveryNotes"
                        value={formData.deliveryNotes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent text-gray-900 bg-white"
                        placeholder="Special delivery instructions"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Order Details
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(formData.quantity - 1)
                          }
                          disabled={formData.quantity <= 1}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {formData.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(formData.quantity + 1)
                          }
                          disabled={
                            formData.quantity >=
                            Math.min(5, game.gameAvailableStocks)
                          }
                          className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-600">
                          (Max: {Math.min(5, game.gameAvailableStocks)})
                        </span>
                      </div>
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <div className="space-y-3">
                        {[
                          {
                            value: "cod",
                            label: "Cash on Delivery (COD)",
                            description: "Pay when your order arrives",
                          },
                          {
                            value: "bank_transfer",
                            label: "Bank Transfer",
                            description: "Transfer to our bank account",
                          },
                          {
                            value: "gcash",
                            label: "GCash",
                            description: "Pay via GCash mobile wallet",
                          },
                          {
                            value: "cash",
                            label: "Cash (Meet-up)",
                            description: "Pay cash when we meet up",
                          },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={formData.paymentMethod === method.value}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-funBlue focus:ring-funBlue"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {method.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {method.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.paymentMethod && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.paymentMethod}
                        </p>
                      )}
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-funBlue to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : `Place Order - ${formatPrice(totalAmount)}`}
                  </button>

                  <p className="text-sm text-gray-600 text-center mt-4">
                    By placing this order, you agree to our terms and
                    conditions.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function PurchaseFormPage() {
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
      <PurchaseFormContent />
    </Suspense>
  );
}
