"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/CartContext";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { validatePurchaseData, formatPrice } from "@/lib/purchase-form-utils";
import { calculateRentalPrice } from "@/lib/rental-pricing";
import { usePurchaseSummary } from "@/hooks/cart/usePurchaseSummary";
import { useRentalSummary } from "@/hooks/cart/useRentalSummary";
import { useCartForm } from "@/hooks/cart/useCartForm";
import EmptyCart from "@/app/components/ui/cart/EmptyCart";
import CartHeader from "@/app/components/ui/cart/CartHeader";
import CartTypeSelector from "@/app/components/ui/cart/CartTypeSelector";
import CustomerInfoForm from "@/app/components/ui/cart/forms/CustomerInfoForm";
import DeliveryInfoForm from "@/app/components/ui/cart/forms/DeliveryInfoForm";
import PaymentMethodForm from "@/app/components/ui/cart/forms/PaymentMethodForm";
import RentalDateForm from "@/app/components/ui/cart/forms/RentalDateForm";
import OrderSummary from "@/app/components/ui/cart/summary/OrderSummary";
import NegotiationChat from "@/app/components/ui/cart/NegotiationChat";

// Dynamic imports for code splitting
const PurchaseCart = dynamic(
  () => import("@/app/components/ui/cart/types/PurchaseCart"),
  {
    ssr: false,
  },
);
const RentalCart = dynamic(
  () => import("@/app/components/ui/cart/types/RentalCart"),
  {
    ssr: false,
  },
);
const TradeCart = dynamic(
  () => import("@/app/components/ui/cart/types/TradeCart"),
  {
    ssr: false,
  },
);

function CartContent() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    negotiatedDiscount,
    isHydrated,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    formData,
    errors,
    setErrors,
    handleInputChange,
    validateForm: validateCartForm,
  } = useCartForm();

  // Rental-specific form data
  const [rentalDates, setRentalDates] = useState({
    startDate: "",
    endDate: "",
    rentalDays: 0,
  });

  // Calculate rental days from dates
  useEffect(() => {
    if (rentalDates.startDate && rentalDates.endDate) {
      const start = new Date(rentalDates.startDate);
      const end = new Date(rentalDates.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 1 && diffDays <= 30) {
        setRentalDates((prev) => ({ ...prev, rentalDays: diffDays }));
      }
    }
  }, [rentalDates.startDate, rentalDates.endDate]);

  const purchaseSummary = usePurchaseSummary();
  const rentalSummary = useRentalSummary({
    rentalDays: rentalDates.rentalDays,
  });

  const handleRentalDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    setRentalDates((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (cart.items.length === 0) {
      setErrors({ submit: "Your cart is empty" });
      return false;
    }

    if (!cart.type) {
      setErrors({
        submit: "Please select cart type (Purchase, Rental, or Trade)",
      });
      return false;
    }

    // Validate trade cart
    if (cart.type === "trade") {
      if (cart.items.length === 0) {
        setErrors({
          submit: "Please add at least one game you want to receive",
        });
        return false;
      }
      if (!cart.gamesGiven || cart.gamesGiven.length === 0) {
        setErrors({ submit: "Please add at least one game you're trading in" });
        return false;
      }
      return true;
    }

    // Validate rental dates
    if (cart.type === "rental") {
      if (!rentalDates.startDate || !rentalDates.endDate) {
        setErrors({ submit: "Please select rental start and end dates" });
        return false;
      }
      if (rentalDates.rentalDays < 1 || rentalDates.rentalDays > 30) {
        setErrors({ submit: "Rental duration must be between 1 and 30 days" });
        return false;
      }
    }

    // Validate purchase/rental form data
    return validateCartForm(cart.type, cart.items.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (cart.type === "purchase") {
        const purchaseRequest = {
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim() || undefined,
          customerEmail: formData.customerEmail.trim() || undefined,
          customerFacebookUrl: formData.customerFacebookUrl.trim() || undefined,
          games: cart.items.map((item) => ({
            gameBarcode: item.gameBarcode,
            gameTitle: item.gameTitle,
            gamePrice:
              item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice,
            quantity: item.quantity,
          })),
          deliveryAddress: formData.deliveryAddress.trim() || undefined,
          deliveryCity: formData.deliveryCity.trim() || undefined,
          deliveryLandmark: formData.deliveryLandmark.trim() || undefined,
          deliveryNotes: formData.deliveryNotes.trim() || undefined,
          paymentMethod: formData.paymentMethod,
          deliveryFee: purchaseSummary.deliveryFee,
          subtotal: purchaseSummary.subtotal,
          totalAmount: purchaseSummary.totalAmount,
          orderSource: "website",
          discountType: negotiatedDiscount > 0 ? "fixed" : undefined,
          discountValue:
            negotiatedDiscount > 0 ? negotiatedDiscount : undefined,
        };

        const response = await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(purchaseRequest),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          clearCart();
          router.push(`/purchase-confirmation?id=${result.purchaseId}`);
        } else {
          setErrors({
            submit: result.error || "Failed to submit purchase request",
          });
        }
      } else if (cart.type === "rental") {
        const rentalPromises = cart.items.map((item) => {
          const price =
            item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
          const calculation = calculateRentalPrice(
            price,
            rentalDates.rentalDays,
          );

          return fetch("/api/rentals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: formData.customerName.trim(),
              customerPhone: formData.customerPhone.trim(),
              customerEmail: formData.customerEmail.trim(),
              customerFacebookUrl:
                formData.customerFacebookUrl.trim() || undefined,
              customerIdImageUrl: "",
              gameBarcode: item.gameBarcode,
              gameTitle: item.gameTitle,
              gamePrice: price,
              startDate: rentalDates.startDate,
              endDate: rentalDates.endDate,
              rentalDays: rentalDates.rentalDays,
              deliveryAddress: formData.deliveryAddress.trim(),
              deliveryCity: formData.deliveryCity.trim(),
              deliveryLandmark: formData.deliveryLandmark.trim(),
              deliveryNotes: formData.deliveryNotes.trim() || undefined,
              rentalFee: calculation.rentalFee * item.quantity,
              deposit: calculation.deposit * item.quantity,
              totalDue: calculation.totalDue * item.quantity,
              appliedPlan: calculation.appliedPlan,
            }),
          });
        });

        const responses = await Promise.all(rentalPromises);
        const results = await Promise.all(responses.map((r) => r.json()));

        const failed = results.find((r) => !r.success);
        if (failed) {
          setErrors({
            submit: failed.error || "Failed to submit rental request",
          });
        } else {
          clearCart();
          router.push("/?rentalSuccess=true");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart state
  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-black">
      <Navigation />

      <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <CartHeader cartType={cart.type} itemCount={cart.items.length} />
          <CartTypeSelector />

          <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Type Components */}
              <Suspense fallback={<div>Loading cart...</div>}>
                {cart.type === "trade" && <TradeCart />}
                {cart.type === "purchase" && <PurchaseCart />}
                {cart.type === "rental" && <RentalCart />}
              </Suspense>

              {/* Rental Date Selection */}
              {cart.type === "rental" && (
                <RentalDateForm
                  startDate={rentalDates.startDate}
                  endDate={rentalDates.endDate}
                  rentalDays={rentalDates.rentalDays}
                  errors={errors}
                  onStartDateChange={(value) =>
                    handleRentalDateChange("startDate", value)
                  }
                  onEndDateChange={(value) =>
                    handleRentalDateChange("endDate", value)
                  }
                />
              )}

              {/* Customer Information Form - Only show for purchase/rental */}
              {cart.type !== "trade" && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <CustomerInfoForm
                    formData={{
                      customerName: formData.customerName,
                      customerPhone: formData.customerPhone,
                      customerEmail: formData.customerEmail,
                      customerFacebookUrl: formData.customerFacebookUrl,
                    }}
                    errors={errors}
                    onChange={handleInputChange}
                  />

                  <DeliveryInfoForm
                    formData={{
                      deliveryAddress: formData.deliveryAddress,
                      deliveryCity: formData.deliveryCity,
                      deliveryLandmark: formData.deliveryLandmark,
                      deliveryNotes: formData.deliveryNotes,
                    }}
                    errors={errors}
                    onChange={handleInputChange}
                  />

                  {cart.type === "purchase" && (
                    <PaymentMethodForm
                      paymentMethod={formData.paymentMethod}
                      error={errors.paymentMethod}
                      onChange={handleInputChange}
                    />
                  )}

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
                        : cart.type === "purchase"
                          ? `Place Order - ${formatPrice(purchaseSummary.totalAmount)}`
                          : `Submit Rental - ${formatPrice(rentalSummary.totalDue)}`}
                    </button>

                    <p className="text-sm text-gray-600 text-center mt-4">
                      By submitting, you agree to our terms and conditions.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <OrderSummary
              rentalDays={rentalDates.rentalDays}
              onRemove={removeFromCart}
              onQuantityChange={updateQuantity}
              onNegotiateClick={() => setIsChatOpen(true)}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Negotiation Chat Modal */}
      {isHydrated && (
        <NegotiationChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          totalAmount={purchaseSummary.subtotal}
        />
      )}
    </main>
  );
}

export default function CartPage() {
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
      <CartContent />
    </Suspense>
  );
}
