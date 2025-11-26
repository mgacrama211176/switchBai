"use client";

import { useState, useEffect, useRef } from "react";
import { HiX, HiSearch } from "react-icons/hi";
import { Game } from "@/app/types/games";
import { calculateRentalPrice } from "@/lib/rental-pricing";
import { calculateDays } from "@/lib/rental-form-utils";
import Toast from "./Toast";

interface AddRentalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRentalModal({
  onClose,
  onSuccess,
}: AddRentalModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Game selection state
  const [gameSearchTerm, setGameSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGameSearchOpen, setIsGameSearchOpen] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<
    "withCase" | "cartridgeOnly"
  >("withCase");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFacebookUrl, setCustomerFacebookUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Cebu City");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [customerIdImageUrl, setCustomerIdImageUrl] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "">(
    "",
  );
  const [discountValue, setDiscountValue] = useState<number | "">("");

  // Calculate rental days and pricing
  const rentalDays = calculateDays(startDate, endDate);
  const variantPrice =
    selectedGame &&
    selectedVariant === "cartridgeOnly" &&
    selectedGame.cartridgeOnlyPrice
      ? selectedGame.cartridgeOnlyPrice
      : selectedGame?.gamePrice || 0;
  const baseRentalCalculation =
    selectedGame && rentalDays > 0
      ? calculateRentalPrice(variantPrice, rentalDays)
      : null;

  // Calculate discount
  function calculateDiscount() {
    if (
      !baseRentalCalculation ||
      !discountType ||
      discountValue === "" ||
      discountValue === 0
    ) {
      return 0;
    }
    if (discountType === "percentage") {
      return baseRentalCalculation.rentalFee * (Number(discountValue) / 100);
    } else {
      return Math.min(Number(discountValue), baseRentalCalculation.rentalFee);
    }
  }

  // Calculate adjusted rental fee after discount
  function calculateAdjustedRentalFee() {
    if (!baseRentalCalculation) return 0;
    return baseRentalCalculation.rentalFee - calculateDiscount();
  }

  // Calculate adjusted deposit (game price - discounted rental fee)
  function calculateAdjustedDeposit() {
    if (!selectedGame || !baseRentalCalculation) return 0;
    return variantPrice - calculateAdjustedRentalFee();
  }

  // Total due remains game price (variant-specific)
  function getTotalDue() {
    if (!selectedGame) return 0;
    return variantPrice;
  }

  // Fetch initial games (100 most recent) when modal opens
  useEffect(() => {
    async function fetchInitialGames() {
      setIsLoadingGames(true);
      try {
        const response = await fetch(
          "/api/games?limit=100&sort=updatedAt&order=desc",
        );
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setToast({ message: "Failed to fetch games", type: "error" });
      } finally {
        setIsLoadingGames(false);
      }
    }

    fetchInitialGames();
  }, []);

  // Fetch games from API when search term changes (server-side search)
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      // Clear search results when search term is empty
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    async function searchGames() {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/games?search=${encodeURIComponent(debouncedSearchTerm)}&limit=10000`,
        );
        const data = await response.json();
        setSearchResults(data.games || []);
      } catch (error) {
        console.error("Error searching games:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    searchGames();
  }, [debouncedSearchTerm]);

  // Set default end date when start date changes
  useEffect(() => {
    if (startDate && !endDate) {
      const start = new Date(startDate);
      const defaultEnd = new Date(start);
      defaultEnd.setDate(start.getDate() + 7);
      setEndDate(defaultEnd.toISOString().split("T")[0]);
    }
  }, [startDate, endDate]);

  // Debounce search term
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(gameSearchTerm);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [gameSearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current &&
        searchInputRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsGameSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getFilteredGames(): Game[] {
    if (!debouncedSearchTerm.trim()) {
      // When no search term, return initial games (limited to 10 for display)
      return games.slice(0, 10);
    }

    // When search term exists, return server-side search results
    return searchResults.slice(0, 10); // Limit to 10 for display
  }

  function handleGameSelect(game: Game) {
    setSelectedGame(game);
    setGameSearchTerm(game.gameTitle);
    setIsGameSearchOpen(false);
    setSelectedGameIndex(0);
    // Auto-select available variant
    if (game.stockWithCase && game.stockWithCase > 0) {
      setSelectedVariant("withCase");
    } else if (game.stockCartridgeOnly && game.stockCartridgeOnly > 0) {
      setSelectedVariant("cartridgeOnly");
    } else {
      setSelectedVariant("withCase"); // Default
    }
  }

  function handleSearchChange(value: string) {
    setGameSearchTerm(value);
    setIsGameSearchOpen(true);
    setSelectedGameIndex(0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const filtered = getFilteredGames();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedGameIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedGameIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedGameIndex]) {
        handleGameSelect(filtered[selectedGameIndex]);
      }
    } else if (e.key === "Escape") {
      setIsGameSearchOpen(false);
    }
  }

  function validateForm(): string | null {
    if (!customerName.trim()) return "Customer name is required";
    if (customerName.trim().length < 2)
      return "Customer name must be at least 2 characters";

    if (!customerPhone.trim()) return "Customer phone is required";
    const phoneRegex = /^(\+639|09)\d{9}$/;
    const cleanPhone = customerPhone.replace(/[-\s]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid Philippine phone number (09XX-XXX-XXXX)";
    }

    if (!customerEmail.trim()) return "Customer email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) return "Invalid email address";

    if (!startDate) return "Start date is required";
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return "Start date cannot be in the past";

    if (!endDate) return "End date is required";
    const end = new Date(endDate);
    if (end <= start) return "End date must be after start date";
    const maxEnd = new Date(start);
    maxEnd.setDate(start.getDate() + 30);
    if (end > maxEnd) return "Maximum rental period is 30 days";

    if (!selectedGame) return "Please select a game";

    if (!deliveryAddress.trim()) return "Delivery address is required";
    if (deliveryAddress.trim().length < 10)
      return "Address must be at least 10 characters";

    if (!deliveryCity.trim()) return "Delivery city is required";
    if (deliveryCity.trim().length < 2)
      return "City must be at least 2 characters";

    if (!deliveryLandmark.trim()) return "Delivery landmark is required";
    if (deliveryLandmark.trim().length < 3)
      return "Landmark must be at least 3 characters";

    if (!customerIdImageUrl.trim()) return "Customer ID image URL is required";

    if (customerFacebookUrl.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(customerFacebookUrl)) {
        return "Please enter a valid Facebook URL";
      }
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setToast({ message: validationError, type: "error" });
      return;
    }

    if (!selectedGame || !baseRentalCalculation) {
      setToast({
        message: "Please select a game and valid dates",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerFacebookUrl: customerFacebookUrl.trim() || undefined,
          customerIdImageUrl: customerIdImageUrl.trim(),
          gameBarcode: selectedGame.gameBarcode,
          gameTitle: selectedGame.gameTitle,
          gamePrice: variantPrice,
          variant: selectedVariant,
          startDate,
          endDate,
          rentalDays,
          deliveryAddress: deliveryAddress.trim(),
          deliveryCity: deliveryCity.trim(),
          deliveryLandmark: deliveryLandmark.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined,
          rentalFee: calculateAdjustedRentalFee(),
          deposit: calculateAdjustedDeposit(),
          totalDue: getTotalDue(),
          appliedPlan: baseRentalCalculation.appliedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create rental");
      }

      setToast({
        message: `Rental created successfully! Reference: ${data.referenceNumber}`,
        type: "success",
      });

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerFacebookUrl("");
      setStartDate("");
      setEndDate("");
      setDeliveryAddress("");
      setDeliveryCity("Cebu City");
      setDeliveryLandmark("");
      setDeliveryNotes("");
      setCustomerIdImageUrl("");
      setSelectedGame(null);
      setGameSearchTerm("");
      setDiscountType("");
      setDiscountValue("");

      // Close modal after short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error("Error creating rental:", error);
      setToast({
        message: error.message || "Failed to create rental",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredGames = getFilteredGames();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add Rental</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Game Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Game Selection
            </h3>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={gameSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsGameSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for a game by title or barcode..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
                {isGameSearchOpen && (
                  <div
                    ref={searchResultsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-4 text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : filteredGames.length > 0 ? (
                      filteredGames.map((game, index) => (
                        <div
                          key={game._id || game.gameBarcode}
                          onClick={() => handleGameSelect(game)}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            index === selectedGameIndex ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="font-medium text-gray-900">
                            {game.gameTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {game.gameBarcode} • ₱
                            {game.gamePrice.toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500">
                        No games found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedGame && (
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {selectedGame.gameTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      Price: ₱{selectedGame.gamePrice.toLocaleString()}
                    </div>
                  </div>
                  {(selectedGame.stockWithCase ||
                    selectedGame.stockCartridgeOnly) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variant
                      </label>
                      <select
                        value={selectedVariant}
                        onChange={(e) => {
                          const variant = e.target.value as
                            | "withCase"
                            | "cartridgeOnly";
                          setSelectedVariant(variant);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                      >
                        <option
                          value="withCase"
                          disabled={(selectedGame.stockWithCase || 0) === 0}
                        >
                          With Case ({selectedGame.stockWithCase || 0}{" "}
                          available)
                        </option>
                        <option
                          value="cartridgeOnly"
                          disabled={
                            (selectedGame.stockCartridgeOnly || 0) === 0
                          }
                        >
                          Cartridge Only ({selectedGame.stockCartridgeOnly || 0}{" "}
                          available)
                        </option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Selected price: ₱{variantPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
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
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer ID Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={customerIdImageUrl}
                  onChange={(e) => setCustomerIdImageUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rental Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rental Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              {rentalDays > 0 && (
                <div className="md:col-span-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      Rental Period: <strong>{rentalDays} days</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Discount Section */}
          {baseRentalCalculation && selectedGame && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Discount (Optional)
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                {discountType &&
                  discountValue !== "" &&
                  discountValue !== 0 && (
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
            </div>
          )}

          {/* Rental Pricing Summary */}
          {baseRentalCalculation && selectedGame && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing Summary
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Rental Fee:</span>
                  <span className="font-medium text-gray-900">
                    ₱{baseRentalCalculation.rentalFee.toLocaleString()}
                  </span>
                </div>
                {discountType &&
                  discountValue !== "" &&
                  discountValue !== 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">
                          -₱{calculateDiscount().toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                        <span className="text-gray-600">
                          Rental Fee After Discount:
                        </span>
                        <span className="font-medium text-gray-900">
                          ₱{calculateAdjustedRentalFee().toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium text-gray-900">
                    ₱{calculateAdjustedDeposit().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t-2 border-gray-400">
                  <span className="text-gray-900">Total Due:</span>
                  <span className="text-funBlue">
                    ₱{getTotalDue().toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Plan: {baseRentalCalculation.appliedPlan}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  required
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
              {isSubmitting ? "Creating..." : "Create Rental"}
            </button>
          </div>
        </form>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
