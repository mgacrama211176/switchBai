"use client";

import { useState, useEffect, useRef } from "react";
import { HiX, HiPlus, HiTrash, HiSearch } from "react-icons/hi";
import { Game } from "@/app/types/games";
import Toast from "./Toast";

interface GameRow {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
  availableStock: number;
}

interface GameSearchState {
  searchTerm: string;
  isOpen: boolean;
  selectedIndex: number;
}

interface AddOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddOrderModal({
  onClose,
  onSuccess,
}: AddOrderModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFacebookUrl, setCustomerFacebookUrl] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "bank_transfer" | "gcash" | "cash"
  >("cod");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "">(
    "",
  );
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [status, setStatus] = useState<
    "pending" | "preparing" | "shipped" | "delivered" | "cancelled"
  >("pending");
  const [gameRows, setGameRows] = useState<GameRow[]>([]);
  const [gameSearchStates, setGameSearchStates] = useState<
    Record<number, GameSearchState>
  >({});
  const [debouncedSearchTerms, setDebouncedSearchTerms] = useState<
    Record<number, string>
  >({});
  const searchInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const searchResultsRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const debounceTimeouts = useRef<Record<number, NodeJS.Timeout>>({});

  useEffect(() => {
    async function fetchGames() {
      setIsLoadingGames(true);
      try {
        // Use API filter to only get games with stock > 0
        const response = await fetch("/api/games?inStock=true");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setToast({ message: "Failed to fetch games", type: "error" });
      } finally {
        setIsLoadingGames(false);
      }
    }

    fetchGames();
  }, []);

  // Add initial game row
  useEffect(() => {
    if (games.length > 0 && gameRows.length === 0) {
      setGameRows([
        {
          gameBarcode: "",
          gameTitle: "",
          gamePrice: 0,
          quantity: 1,
          availableStock: 0,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games.length]);

  function addGameRow() {
    setGameRows([
      ...gameRows,
      {
        gameBarcode: "",
        gameTitle: "",
        gamePrice: 0,
        quantity: 1,
        availableStock: 0,
      },
    ]);
  }

  function removeGameRow(index: number) {
    setGameRows(gameRows.filter((_, i) => i !== index));
  }

  function updateGameRow(index: number, updates: Partial<GameRow>) {
    const newRows = [...gameRows];
    newRows[index] = { ...newRows[index], ...updates };
    setGameRows(newRows);
  }

  function handleGameSelect(index: number, game: Game) {
    updateGameRow(index, {
      gameBarcode: game.gameBarcode,
      gameTitle: game.gameTitle,
      gamePrice:
        game.isOnSale && game.salePrice ? game.salePrice : game.gamePrice,
      availableStock: game.gameAvailableStocks,
      quantity: 1,
    });
    // Close search dropdown and clear search terms
    setGameSearchStates((prev) => ({
      ...prev,
      [index]: { searchTerm: "", isOpen: false, selectedIndex: 0 },
    }));
    setDebouncedSearchTerms((prev) => ({
      ...prev,
      [index]: "",
    }));
    // Clear debounce timeout
    if (debounceTimeouts.current[index]) {
      clearTimeout(debounceTimeouts.current[index]);
    }
  }

  function getFilteredGames(index: number): Game[] {
    const searchTerm = debouncedSearchTerms[index] || "";
    if (!searchTerm.trim()) {
      return games.slice(0, 10); // Show first 10 games when no search
    }

    const searchLower = searchTerm.toLowerCase();
    return games
      .filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.toLowerCase().includes(searchLower),
      )
      .slice(0, 10); // Limit to 10 results
  }

  function handleSearchChange(index: number, value: string) {
    // Update immediate search term for input display
    setGameSearchStates((prev) => ({
      ...prev,
      [index]: {
        searchTerm: value,
        isOpen: true,
        selectedIndex: 0,
      },
    }));

    // Clear existing timeout for this index
    if (debounceTimeouts.current[index]) {
      clearTimeout(debounceTimeouts.current[index]);
    }

    // Set new timeout for debounced search
    debounceTimeouts.current[index] = setTimeout(() => {
      setDebouncedSearchTerms((prev) => ({
        ...prev,
        [index]: value,
      }));
    }, 300); // 300ms debounce delay
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.keys(searchResultsRefs.current).forEach((key) => {
        const index = parseInt(key);
        const ref = searchResultsRefs.current[index];
        const inputRef = searchInputRefs.current[index];

        if (
          ref &&
          inputRef &&
          !ref.contains(event.target as Node) &&
          !inputRef.contains(event.target as Node)
        ) {
          setGameSearchStates((prev) => ({
            ...prev,
            [index]: { ...prev[index], isOpen: false },
          }));
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function calculateSubtotal() {
    return gameRows.reduce((sum, row) => sum + row.gamePrice * row.quantity, 0);
  }

  function calculateDiscount() {
    const subtotal = calculateSubtotal();
    if (!discountType || discountValue === "" || discountValue === 0) {
      return 0;
    }
    if (discountType === "percentage") {
      return subtotal * (Number(discountValue) / 100);
    } else {
      return Math.min(Number(discountValue), subtotal);
    }
  }

  function calculateTotalAfterDiscount() {
    return calculateSubtotal() - calculateDiscount();
  }

  function calculateTotal() {
    return calculateTotalAfterDiscount() + deliveryFee;
  }

  function validateForm(): string | null {
    if (!customerName.trim()) return "Customer name is required";

    // Validate phone if provided
    if (customerPhone.trim()) {
      const phoneRegex = /^(\+639|09)\d{9}$/;
      const cleanPhone = customerPhone.replace(/[-\s]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return "Please enter a valid Philippine phone number";
      }
    }

    // Validate email if provided
    if (customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) return "Invalid email address";
    }

    // Validate address fields if any are provided (all or none)
    const hasAddress =
      deliveryAddress.trim() || deliveryCity.trim() || deliveryLandmark.trim();
    if (hasAddress) {
      if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
        return "If providing address, it must be at least 10 characters";
      }
      if (!deliveryCity.trim() || deliveryCity.trim().length < 2) {
        return "If providing address, city must be at least 2 characters";
      }
      if (!deliveryLandmark.trim() || deliveryLandmark.trim().length < 3) {
        return "If providing address, landmark must be at least 3 characters";
      }
    }

    if (gameRows.length === 0) return "At least one game is required";

    for (let i = 0; i < gameRows.length; i++) {
      const row = gameRows[i];
      if (!row.gameBarcode) return `Game ${i + 1} must be selected`;
      if (row.quantity < 1) return `Game ${i + 1} quantity must be at least 1`;
      if (row.quantity > row.availableStock) {
        return `Game ${i + 1} quantity exceeds available stock (${row.availableStock})`;
      }
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim()
          ? customerEmail.trim().toLowerCase()
          : undefined,
        customerFacebookUrl: customerFacebookUrl.trim() || undefined,
        games: gameRows.map((row) => ({
          gameBarcode: row.gameBarcode,
          gameTitle: row.gameTitle,
          gamePrice: row.gamePrice,
          quantity: row.quantity,
        })),
        deliveryAddress: deliveryAddress.trim() || undefined,
        deliveryCity: deliveryCity.trim() || undefined,
        deliveryLandmark: deliveryLandmark.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
        deliveryFee,
        discountType: discountType || undefined,
        discountValue:
          discountType && discountValue !== "" && discountValue !== 0
            ? Number(discountValue)
            : undefined,
        orderSource: "manual" as const,
        status,
      };

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setToast({ message: "Order created successfully!", type: "success" });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error creating order:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to create order",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add New Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Link (Optional)
                </label>
                <input
                  type="url"
                  value={customerFacebookUrl}
                  onChange={(e) => setCustomerFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Games Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Games</h3>
              <button
                type="button"
                onClick={addGameRow}
                className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Game</span>
              </button>
            </div>

            {isLoadingGames ? (
              <div className="text-center py-8 text-gray-500">
                Loading games...
              </div>
            ) : (
              <div className="space-y-4">
                {gameRows.map((row, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Game {index + 1}
                      </span>
                      {gameRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGameRow(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2 relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Game <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              ref={(el) => {
                                searchInputRefs.current[index] = el;
                              }}
                              type="text"
                              value={
                                row.gameBarcode
                                  ? row.gameTitle
                                  : gameSearchStates[index]?.searchTerm || ""
                              }
                              onChange={(e) => {
                                if (!row.gameBarcode) {
                                  handleSearchChange(index, e.target.value);
                                }
                              }}
                              onFocus={() => {
                                if (!row.gameBarcode) {
                                  setGameSearchStates((prev) => ({
                                    ...prev,
                                    [index]: {
                                      searchTerm: prev[index]?.searchTerm || "",
                                      isOpen: true,
                                      selectedIndex: 0,
                                    },
                                  }));
                                }
                              }}
                              placeholder={
                                row.gameBarcode
                                  ? row.gameTitle
                                  : "Search for a game..."
                              }
                              readOnly={!!row.gameBarcode}
                              required={!row.gameBarcode}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                            {row.gameBarcode && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateGameRow(index, {
                                    gameBarcode: "",
                                    gameTitle: "",
                                    gamePrice: 0,
                                    quantity: 1,
                                    availableStock: 0,
                                  });
                                  setGameSearchStates((prev) => ({
                                    ...prev,
                                    [index]: {
                                      searchTerm: "",
                                      isOpen: false,
                                      selectedIndex: 0,
                                    },
                                  }));
                                  setDebouncedSearchTerms((prev) => ({
                                    ...prev,
                                    [index]: "",
                                  }));
                                  // Clear debounce timeout
                                  if (debounceTimeouts.current[index]) {
                                    clearTimeout(
                                      debounceTimeouts.current[index],
                                    );
                                  }
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <HiX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          {gameSearchStates[index]?.isOpen &&
                            !row.gameBarcode && (
                              <div
                                ref={(el) => {
                                  searchResultsRefs.current[index] = el;
                                }}
                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                              >
                                {getFilteredGames(index).length > 0 ? (
                                  getFilteredGames(index).map((game) => (
                                    <button
                                      key={game.gameBarcode}
                                      type="button"
                                      onClick={() =>
                                        handleGameSelect(index, game)
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
                                          {game.isOnSale && game.salePrice ? (
                                            <div>
                                              <div className="text-sm font-medium line-through text-gray-400">
                                                ₱
                                                {game.gamePrice.toLocaleString()}
                                              </div>
                                              <div className="text-sm font-bold text-red-600">
                                                ₱
                                                {game.salePrice.toLocaleString()}
                                              </div>
                                              <div className="text-xs text-red-600 font-semibold">
                                                ON SALE
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-sm font-medium text-gray-900">
                                              ₱{game.gamePrice.toLocaleString()}
                                            </div>
                                          )}
                                          <div className="text-xs text-gray-500 mt-1">
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={row.availableStock}
                          value={row.quantity}
                          onChange={(e) =>
                            updateGameRow(index, {
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {row.availableStock}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          ₱{(row.gamePrice * row.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as
                        | "cod"
                        | "bank_transfer"
                        | "gcash"
                        | "cash",
                    )
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="gcash">GCash</option>
                  <option value="cash">Cash (Meet-up)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as
                        | "pending"
                        | "preparing"
                        | "shipped"
                        | "delivered"
                        | "cancelled",
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee
                </label>
                <input
                  type="number"
                  min={0}
                  value={deliveryFee}
                  onChange={(e) =>
                    setDeliveryFee(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
            </div>

            {/* Discount Section */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Discount (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => {
                      setDiscountType(
                        e.target.value as "percentage" | "fixed" | "",
                      );
                      if (e.target.value === "") {
                        setDiscountValue("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  >
                    <option value="">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>
                {discountType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value
                      {discountType === "percentage" ? " (%)" : " (₱)"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={discountType === "percentage" ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDiscountValue(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                      placeholder={
                        discountType === "percentage" ? "0-100" : "0"
                      }
                    />
                  </div>
                )}
              </div>
              {discountType && discountValue !== "" && (
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount Amount:</span>
                    <span className="font-semibold text-red-600">
                      -₱{calculateDiscount().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    ₱{subtotal.toLocaleString()}
                  </span>
                </div>
                {discountType && discountValue !== "" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">
                        -₱{calculateDiscount().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                      <span className="text-gray-600">
                        Subtotal After Discount:
                      </span>
                      <span className="font-medium text-gray-900">
                        ₱{calculateTotalAfterDiscount().toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium text-gray-900">
                    ₱{deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t-2 border-gray-400">
                  <span className="font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="font-bold text-lg text-funBlue">
                    ₱{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
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
