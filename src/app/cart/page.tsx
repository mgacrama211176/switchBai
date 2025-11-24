"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Game } from "@/app/types/games";
import { fetchGames } from "@/lib/api-client";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import {
  validatePurchaseData,
  calculateDeliveryFee,
  calculateTotal,
  formatPrice,
} from "@/lib/purchase-form-utils";
import { calculateRentalPrice } from "@/lib/rental-pricing";
import { calculateSavings } from "@/app/components/ui/home/game-utils";
import {
  calculateTradeCashDifference,
  calculateGamesValue,
} from "@/lib/trade-utils";
import NegotiationChat from "@/app/components/ui/cart/NegotiationChat";
import {
  HiX,
  HiTrash,
  HiMinus,
  HiPlus,
  HiChatAlt2,
  HiSearch,
} from "react-icons/hi";

function CartContent() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    removeFromTradeCart,
    updateQuantity,
    updateTradeQuantity,
    addToTradeCart,
    setCartType,
    clearCart,
    negotiatedDiscount,
    isHydrated,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Trade cart game search state
  const [tradeGameSearch, setTradeGameSearch] = useState({
    term: "",
    isOpen: false,
    side: "given" as "received" | "given",
  });
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

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
    paymentMethod: "cod",
  });

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

  // Calculate order summary for purchase
  const purchaseSummary = useMemo(() => {
    if (cart.type !== "purchase" || cart.items.length === 0) {
      return { deliveryFee: 0, subtotal: 0, totalAmount: 0, totalQuantity: 0 };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
      return sum + price * item.quantity;
    }, 0);

    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Delivery fee is set to 0 by default - will be added manually after customer discussion
    const deliveryFee = 0;

    // Calculate total with discount
    const totalBeforeDiscount = calculateTotal(subtotal, deliveryFee);
    const totalAmount = Math.max(
      0,
      totalBeforeDiscount - (negotiatedDiscount || 0),
    );

    return { deliveryFee, subtotal, totalAmount, totalQuantity };
  }, [cart.type, cart.items, negotiatedDiscount]);

  // Calculate rental summary
  const rentalSummary = useMemo(() => {
    if (
      cart.type !== "rental" ||
      cart.items.length === 0 ||
      rentalDates.rentalDays === 0
    ) {
      return { totalRentalFee: 0, totalDeposit: 0, totalDue: 0, items: [] };
    }

    const items = cart.items.map((item) => {
      const price =
        item.isOnSale && item.salePrice ? item.salePrice : item.gamePrice;
      const calculation = calculateRentalPrice(price, rentalDates.rentalDays);
      return {
        ...item,
        rentalFee: calculation.rentalFee * item.quantity,
        deposit: calculation.deposit * item.quantity,
        totalDue: calculation.totalDue * item.quantity,
        calculation,
      };
    });

    const totalRentalFee = items.reduce((sum, item) => sum + item.rentalFee, 0);
    const totalDeposit = items.reduce((sum, item) => sum + item.deposit, 0);
    const totalDue = items.reduce((sum, item) => sum + item.totalDue, 0);

    return { totalRentalFee, totalDeposit, totalDue, items };
  }, [cart.type, cart.items, rentalDates.rentalDays]);

  // Calculate trade summary
  const tradeSummary = useMemo(() => {
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
  }, [cart.type, cart.items, cart.gamesGiven]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRentalDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    setRentalDates((prev) => ({ ...prev, [field]: value }));
  };

  // Load games for trade search
  useEffect(() => {
    if (cart.type === "trade" && availableGames.length === 0) {
      setIsLoadingGames(true);
      fetchGames({ limit: 1000, nintendoOnly: true })
        .then((response) => {
          if (response.success && response.data) {
            setAvailableGames(response.data.games || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching games:", error);
        })
        .finally(() => {
          setIsLoadingGames(false);
        });
    }
  }, [cart.type]);

  // Filter games for search
  const filteredGames = useMemo(() => {
    if (!tradeGameSearch.term.trim()) {
      return availableGames.slice(0, 10);
    }
    const searchLower = tradeGameSearch.term.toLowerCase();
    return availableGames
      .filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.toLowerCase().includes(searchLower),
      )
      .slice(0, 10);
  }, [availableGames, tradeGameSearch.term]);

  const handleTradeGameSelect = (game: Game, side: "received" | "given") => {
    addToTradeCart(game, 1, side);
    setTradeGameSearch({ term: "", isOpen: false, side });
  };

  const handleProceedToTradeForm = () => {
    if (cart.items.length === 0) {
      setErrors({ submit: "Please add at least one game you want to receive" });
      return;
    }
    if (!cart.gamesGiven || cart.gamesGiven.length === 0) {
      setErrors({ submit: "Please add at least one game you're trading in" });
      return;
    }
    router.push("/trade-form");
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

    // Validate purchase form data
    const validationErrors = validatePurchaseData({
      ...formData,
      gameBarcode: cart.items[0]?.gameBarcode || "",
      quantity: 1,
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (cart.type === "purchase") {
        // Submit purchase
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
        // Submit rentals (one API call per game)
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
              customerIdImageUrl: "", // Will need to be handled separately
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
          // Redirect to home with success message (rental confirmation page can be added later)
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
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="text-6xl mb-6">🛒</div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-gray-700 mb-8 text-lg">
                Add some games to get started!
              </p>

              {/* Cart Type Selector */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  What would you like to do?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setCartType("purchase");
                      router.push("/games");
                    }}
                    className="bg-gradient-to-r from-funBlue to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Browse Games to Buy
                  </button>
                  <button
                    onClick={() => {
                      setCartType("rental");
                      router.push("/games");
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Browse Games to Rent
                  </button>
                  <button
                    onClick={() => {
                      setCartType("trade");
                      router.push("/trade-game");
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Browse Games to Trade
                  </button>
                </div>
              </div>

              <Link
                href="/games"
                className="inline-block text-funBlue hover:underline font-semibold"
              >
                ← Back to Games
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
              {cart.type === "rental"
                ? "Rental Cart"
                : cart.type === "trade"
                  ? "Trade Cart"
                  : "Shopping Cart"}
            </h1>
            <p className="text-gray-800">
              {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in
              your cart
            </p>
          </div>

          {/* Cart Type Selector */}
          {cart.type && (
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Cart Type:{" "}
                    <span className="text-funBlue">
                      {cart.type === "purchase"
                        ? "Purchase"
                        : cart.type === "rental"
                          ? "Rental"
                          : "Trade"}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600">
                    {cart.type === "purchase"
                      ? "You're purchasing these games"
                      : cart.type === "rental"
                        ? "You're renting these games"
                        : "You're trading games"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {cart.type !== "purchase" && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Changing cart type will clear your cart. Are you sure?",
                          )
                        ) {
                          setCartType("purchase");
                        }
                      }}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                    >
                      Switch to Purchase
                    </button>
                  )}
                  {cart.type !== "rental" && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Changing cart type will clear your cart. Are you sure?",
                          )
                        ) {
                          setCartType("rental");
                        }
                      }}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                    >
                      Switch to Rental
                    </button>
                  )}
                  {cart.type !== "trade" && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Changing cart type will clear your cart. Are you sure?",
                          )
                        ) {
                          setCartType("trade");
                        }
                      }}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                    >
                      Switch to Trade
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
            {/* Cart Items & Form - Shows ABOVE on mobile, LEFT on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trade Cart - Two Sided */}
              {cart.type === "trade" && (
                <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Trade Cart
                  </h2>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Games You're Trading In */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Games You're Trading In
                      </h3>

                      {/* Search for games to trade */}
                      <div className="relative">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={
                              tradeGameSearch.side === "given"
                                ? tradeGameSearch.term
                                : ""
                            }
                            onChange={(e) =>
                              setTradeGameSearch({
                                term: e.target.value,
                                isOpen: true,
                                side: "given",
                              })
                            }
                            onFocus={() =>
                              setTradeGameSearch((prev) => ({
                                ...prev,
                                isOpen: prev.side === "given",
                                side: "given",
                              }))
                            }
                            placeholder="Search games to trade..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                          />
                        </div>
                        {tradeGameSearch.isOpen &&
                          tradeGameSearch.side === "given" && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {isLoadingGames ? (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  Loading games...
                                </div>
                              ) : filteredGames.length > 0 ? (
                                filteredGames.map((game) => (
                                  <button
                                    key={game.gameBarcode}
                                    type="button"
                                    onClick={() =>
                                      handleTradeGameSelect(game, "given")
                                    }
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                          {game.gameTitle}
                                        </div>
                                        <div className="text-sm text-gray-500 font-mono">
                                          {game.gameBarcode}
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          ₱{game.gamePrice.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  No games found
                                </div>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Games Given List */}
                      <div className="space-y-3">
                        {cart.gamesGiven && cart.gamesGiven.length > 0 ? (
                          cart.gamesGiven.map((item) => (
                            <div
                              key={item.gameBarcode}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <Image
                                src={item.gameImageURL}
                                alt={item.gameTitle}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {item.gameTitle}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  ₱{item.gamePrice.toLocaleString()} ×{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTradeQuantity(
                                      item.gameBarcode,
                                      item.quantity - 1,
                                      "given",
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <HiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTradeQuantity(
                                      item.gameBarcode,
                                      item.quantity + 1,
                                      "given",
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <HiPlus className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromTradeCart(
                                      item.gameBarcode,
                                      "given",
                                    )
                                  }
                                  className="p-1 hover:bg-red-50 text-red-600 rounded"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No games added yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Games You Want to Receive */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Games You Want to Receive
                      </h3>

                      {/* Search for games to receive */}
                      <div className="relative">
                        <div className="relative">
                          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={
                              tradeGameSearch.side === "received"
                                ? tradeGameSearch.term
                                : ""
                            }
                            onChange={(e) =>
                              setTradeGameSearch({
                                term: e.target.value,
                                isOpen: true,
                                side: "received",
                              })
                            }
                            onFocus={() =>
                              setTradeGameSearch((prev) => ({
                                ...prev,
                                isOpen: prev.side === "received",
                                side: "received",
                              }))
                            }
                            placeholder="Search games to receive..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                          />
                        </div>
                        {tradeGameSearch.isOpen &&
                          tradeGameSearch.side === "received" && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {isLoadingGames ? (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  Loading games...
                                </div>
                              ) : filteredGames.length > 0 ? (
                                filteredGames
                                  .filter((g) => g.gameAvailableStocks > 0)
                                  .map((game) => (
                                    <button
                                      key={game.gameBarcode}
                                      type="button"
                                      onClick={() =>
                                        handleTradeGameSelect(game, "received")
                                      }
                                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">
                                            {game.gameTitle}
                                          </div>
                                          <div className="text-sm text-gray-500 font-mono">
                                            {game.gameBarcode}
                                          </div>
                                        </div>
                                        <div className="text-right ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            ₱{game.gamePrice.toLocaleString()}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Stock: {game.gameAvailableStocks}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                              ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  No games found
                                </div>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Games Received List */}
                      <div className="space-y-3">
                        {cart.items.length > 0 ? (
                          cart.items.map((item) => (
                            <div
                              key={item.gameBarcode}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                            >
                              <Image
                                src={item.gameImageURL}
                                alt={item.gameTitle}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {item.gameTitle}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  ₱{item.gamePrice.toLocaleString()} ×{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTradeQuantity(
                                      item.gameBarcode,
                                      item.quantity - 1,
                                      "received",
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <HiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTradeQuantity(
                                      item.gameBarcode,
                                      item.quantity + 1,
                                      "received",
                                    )
                                  }
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <HiPlus className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromTradeCart(
                                      item.gameBarcode,
                                      "received",
                                    )
                                  }
                                  className="p-1 hover:bg-red-50 text-red-600 rounded"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No games added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trade Summary */}
                  {(cart.gamesGiven && cart.gamesGiven.length > 0) ||
                  cart.items.length > 0 ? (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Total Value Given:
                          </span>
                          <span className="font-medium">
                            ₱{tradeSummary.totalValueGiven.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Total Value Received:
                          </span>
                          <span className="font-medium">
                            ₱{tradeSummary.totalValueReceived.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Trade Fee:</span>
                          <span className="font-medium">
                            ₱{tradeSummary.tradeFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                          <span>Cash Difference (You Pay):</span>
                          <span className="text-funBlue">
                            ₱{tradeSummary.cashDifference.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Proceed to Trade Form Button */}
                  <div className="mt-6">
                    {errors.submit && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{errors.submit}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleProceedToTradeForm}
                      disabled={
                        cart.items.length === 0 ||
                        !cart.gamesGiven ||
                        cart.gamesGiven.length === 0
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Proceed to Trade Form
                    </button>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      By proceeding, you agree to our terms and conditions.
                    </p>
                  </div>
                </div>
              )}

              {/* Rental Date Selection */}
              {cart.type === "rental" && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Rental Dates
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={rentalDates.startDate}
                        onChange={(e) =>
                          handleRentalDateChange("startDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={rentalDates.endDate}
                        onChange={(e) =>
                          handleRentalDateChange("endDate", e.target.value)
                        }
                        min={
                          rentalDates.startDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        max={
                          rentalDates.startDate
                            ? new Date(
                                new Date(rentalDates.startDate).getTime() +
                                  30 * 24 * 60 * 60 * 1000,
                              )
                                .toISOString()
                                .split("T")[0]
                            : undefined
                        }
                        className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent border-gray-400 text-gray-900 bg-white"
                        required
                      />
                    </div>
                  </div>
                  {rentalDates.rentalDays > 0 && (
                    <p className="mt-4 text-sm text-gray-700">
                      Rental Duration:{" "}
                      <span className="font-semibold">
                        {rentalDates.rentalDays} days
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Customer Information Form - Only show for purchase/rental */}
              {cart.type !== "trade" && (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                          Email Address (Optional)
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
                          <input
                            type="text"
                            name="deliveryCity"
                            value={formData.deliveryCity}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent ${
                              errors.deliveryCity
                                ? "border-red-300"
                                : "border-gray-400"
                            } text-gray-900 bg-white`}
                            placeholder="Enter your city"
                            maxLength={100}
                            required
                          />
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

                  {/* Payment Method (Purchase only) */}
                  {cart.type === "purchase" && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Payment Method *
                      </h2>
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
                  )}

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
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {cart.type === "trade" ? (
                  <div className="space-y-4">
                    {/* Games Given */}
                    {cart.gamesGiven && cart.gamesGiven.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Games You're Trading In
                        </h3>
                        {cart.gamesGiven.map((item) => (
                          <div
                            key={item.gameBarcode}
                            className="flex items-start gap-3 pb-3 mb-3 border-b border-gray-100"
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
                    )}

                    {/* Games Received */}
                    {cart.items.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Games You Want to Receive
                        </h3>
                        {cart.items.map((item) => (
                          <div
                            key={item.gameBarcode}
                            className="flex items-start gap-3 pb-3 mb-3 border-b border-gray-100"
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
                    )}

                    {/* Trade Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Total Value Given:
                        </span>
                        <span className="font-semibold">
                          ₱{tradeSummary.totalValueGiven.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Total Value Received:
                        </span>
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
                ) : cart.type === "purchase" ? (
                  <div className="space-y-4">
                    {cart.items.map((item) => {
                      const price =
                        item.isOnSale && item.salePrice
                          ? item.salePrice
                          : item.gamePrice;
                      const savings = calculateSavings(
                        price,
                        item.gameBarcode,
                        {
                          isOnSale: item.isOnSale,
                          salePrice: item.salePrice,
                          gamePrice: item.gamePrice,
                        },
                      );
                      return (
                        <div
                          key={item.gameBarcode}
                          className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                        >
                          <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <Image
                              src={item.gameImageURL}
                              alt={item.gameTitle}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                            {/* Sale Badge */}
                            {item.isOnSale && savings.percentage > 0 && (
                              <div className="absolute top-0.5 left-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-1 py-0.5 rounded-full text-[9px] font-bold shadow-lg z-10">
                                🏷️
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 pr-2">
                                {item.gameTitle}
                              </h3>
                              <button
                                onClick={() => removeFromCart(item.gameBarcode)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1 -mr-1"
                                title="Remove item"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-[10px] text-gray-400 mb-2 font-mono">
                              {item.gameBarcode}
                            </p>

                            <div className="flex items-end justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.gameBarcode,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                  <HiMinus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.gameBarcode,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={item.quantity >= item.maxStock}
                                  className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                  <HiPlus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                {item.isOnSale && item.salePrice ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(
                                        item.gamePrice * item.quantity,
                                      )}
                                    </span>
                                    <span className="text-sm font-semibold text-funBlue">
                                      {formatPrice(price * item.quantity)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-semibold text-funBlue">
                                    {formatPrice(price * item.quantity)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.isOnSale && savings.percentage > 0 && (
                              <p className="text-[10px] font-semibold text-green-600 text-right mt-1">
                                Save ₱
                                {(
                                  savings.savings * item.quantity
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      {/* Summary Details */}
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Items:</span>
                        <span className="font-semibold">
                          {cart.items.length} unique,{" "}
                          {purchaseSummary.totalQuantity} total
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          {formatPrice(purchaseSummary.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span className="font-semibold text-gray-500">₱0</span>
                      </div>

                      {/* Negotiated Discount Display */}
                      {isHydrated && negotiatedDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-semibold">
                          <span>Negotiated Discount:</span>
                          <span>-{formatPrice(negotiatedDiscount)}</span>
                        </div>
                      )}

                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between mb-4">
                          <span className="text-base font-bold text-gray-900">
                            Total:
                          </span>
                          <span className="text-lg font-bold text-funBlue">
                            {formatPrice(purchaseSummary.totalAmount)}
                          </span>
                        </div>

                        {/* Negotiate Button */}
                        <button
                          onClick={() => setIsChatOpen(true)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg mb-2"
                        >
                          <HiChatAlt2 className="w-5 h-5" />
                          Negotiate Price
                        </button>
                        <p className="text-xs text-center text-gray-500">
                          Talk to our AI shopkeeper for a better deal!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rentalSummary.items.map((item) => {
                      const savings = calculateSavings(
                        item.isOnSale && item.salePrice
                          ? item.salePrice
                          : item.gamePrice,
                        item.gameBarcode,
                        {
                          isOnSale: item.isOnSale,
                          salePrice: item.salePrice,
                          gamePrice: item.gamePrice,
                        },
                      );
                      return (
                        <div
                          key={item.gameBarcode}
                          className="flex items-start gap-3"
                        >
                          <div className="relative w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <Image
                              src={item.gameImageURL}
                              alt={item.gameTitle}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                            {/* Sale Badge */}
                            {item.isOnSale && savings.percentage > 0 && (
                              <div className="absolute top-0.5 left-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-1 py-0.5 rounded-full text-[9px] font-bold shadow-lg z-10">
                                🏷️
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                              {item.gameTitle}
                            </h3>
                            <p className="text-xs text-gray-500 mb-1">
                              {item.quantity} × {rentalDates.rentalDays} days
                            </p>
                            <p className="text-xs text-gray-600">
                              Rental: {formatPrice(item.rentalFee)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Deposit: {formatPrice(item.deposit)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {rentalDates.rentalDays > 0 && (
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Total Rental Fee:
                          </span>
                          <span className="font-semibold">
                            {formatPrice(rentalSummary.totalRentalFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Deposit:</span>
                          <span className="font-semibold">
                            {formatPrice(rentalSummary.totalDeposit)}
                          </span>
                        </div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="flex justify-between">
                            <span className="text-base font-bold text-gray-900">
                              Total Due:
                            </span>
                            <span className="text-lg font-bold text-funBlue">
                              {formatPrice(rentalSummary.totalDue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
