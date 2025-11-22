"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { fetchGameByBarcode } from "@/lib/api-client";
import { calculateRentalPrice } from "@/lib/rental-pricing";
import {
  calculateDays,
  validateFormData,
  getTodayString,
  getMaxDateString,
} from "@/lib/rental-form-utils";
import { Game } from "@/app/types/games";
import {
  formatPrice,
  getPlatformInfo,
} from "@/app/components/ui/home/game-utils";

function RentalFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameBarcode = searchParams.get("game");

  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Cebu City");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [landmark, setLandmark] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [idImageUrl, setIdImageUrl] = useState("");
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate rental days and pricing
  const rentalDays = calculateDays(startDate, endDate);
  const rentalCalculation =
    game && rentalDays > 0
      ? calculateRentalPrice(game.gamePrice, rentalDays)
      : null;

  // Load game data
  useEffect(() => {
    if (gameBarcode) {
      loadGame(gameBarcode);
    } else {
      setError("No game selected");
      setIsLoading(false);
    }
  }, [gameBarcode]);

  const loadGame = async (barcode: string) => {
    try {
      const response = await fetchGameByBarcode(barcode);
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

  // Update end date when start date changes
  useEffect(() => {
    if (startDate && !endDate) {
      const start = new Date(startDate);
      const defaultEnd = new Date(start);
      defaultEnd.setDate(start.getDate() + 7);
      setEndDate(defaultEnd.toISOString().split("T")[0]);
    }
  }, [startDate, endDate]);

  // Validation
  const validateForm = () => {
    const formData = {
      customerName,
      phoneNumber,
      email,
      startDate,
      endDate,
      address,
      city,
      landmark,
      facebookUrl,
      idImageUrl,
    };

    const newErrors = validateFormData(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle ID upload
  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        idImageUrl: "Please upload a JPG, JPEG, or PNG file",
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        idImageUrl: "File size must be less than 5MB",
      }));
      return;
    }

    setIsUploadingId(true);
    setErrors((prev) => ({ ...prev, idImageUrl: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload?folder=customer-ids", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setIdImageUrl(result.url);
      setIdImageFile(file);
    } catch (error) {
      console.error("ID upload error:", error);
      setErrors((prev) => ({
        ...prev,
        idImageUrl: error instanceof Error ? error.message : "Upload failed",
      }));
    } finally {
      setIsUploadingId(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create rental request object
      if (!game || !rentalCalculation) {
        throw new Error("Missing game or rental calculation data");
      }

      const rentalRequest = {
        customerName,
        customerPhone: phoneNumber,
        customerEmail: email,
        customerFacebookUrl: facebookUrl,
        customerIdImageUrl: idImageUrl,
        gameBarcode: game.gameBarcode,
        gameTitle: game.gameTitle,
        gamePrice: game.gamePrice,
        startDate,
        endDate,
        rentalDays,
        deliveryAddress: address,
        deliveryCity: city,
        deliveryLandmark: landmark,
        deliveryNotes: deliveryNotes,
        rentalFee: rentalCalculation.rentalFee,
        deposit: rentalCalculation.deposit,
        totalDue: rentalCalculation.totalDue,
        appliedPlan: rentalCalculation.appliedPlan,
      };

      // Submit to API endpoint
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit rental request");
      }

      const result = await response.json();

      // Redirect to confirmation page with rental ID
      router.push(`/rental-confirmation?id=${result.rentalId}`);
    } catch (err) {
      console.error("Error submitting rental request:", err);
      alert("Failed to submit rental request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-[3/4] bg-gray-200 rounded-2xl"></div>
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <Navigation />
        <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Game Not Found
            </h1>
            <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8">
              {error}
            </p>
            <Link
              href="/games"
              className="inline-block min-h-[44px] bg-funBlue text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              Browse All Games
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const platformInfo = getPlatformInfo(game.gamePlatform);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <Navigation />

      <div className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Rent This Game
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              Fill out your details to request a rental
            </p>
          </div>

          {/* Game Info */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={game.gameImageURL}
                  alt={game.gameTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  {game.gameTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${platformInfo.color}`}
                  >
                    {platformInfo.icon} {platformInfo.display}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {game.gameCategory}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-funBlue">
                  {formatPrice(game.gamePrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={100}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.customerName ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={20}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="09XX-XXX-XXXX"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={100}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.email ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Facebook URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    maxLength={200}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.facebookUrl ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="https://facebook.com/yourprofile"
                  />
                  {errors.facebookUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.facebookUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Rental Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={getTodayString()}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.startDate ? "border-red-500" : "border-gray-400"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || getTodayString()}
                    max={getMaxDateString(startDate)}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.endDate ? "border-red-500" : "border-gray-400"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                {rentalDays > 0 && (
                  <div className="md:col-span-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-700 mb-1">
                          {rentalDays} {rentalDays === 1 ? "Day" : "Days"}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600">
                          Rental Duration
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Delivery Information
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    maxLength={500}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.address ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="Enter your complete delivery address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Landmark *
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    maxLength={200}
                    required
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                      errors.landmark ? "border-red-500" : "border-gray-400"
                    }`}
                    placeholder="e.g., Near SM Mall, Beside 7-Eleven"
                  />
                  {errors.landmark && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.landmark}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      maxLength={100}
                      required
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base ${
                        errors.city ? "border-red-500" : "border-gray-400"
                      }`}
                      placeholder="Cebu City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={2}
                      maxLength={500}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-400 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-sm sm:text-base"
                      placeholder="Any special delivery instructions"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Identity Verification
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Upload Valid ID *
                  </label>
                  <div className="space-y-3 sm:space-y-4">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleIdUpload}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-400 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 bg-white text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-md sm:file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      disabled={isUploadingId}
                    />
                    {errors.idImageUrl && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.idImageUrl}
                      </p>
                    )}
                    {idImageUrl && (
                      <div className="mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm text-green-600 font-semibold mb-2">
                          ✓ ID uploaded successfully
                        </p>
                        <div className="relative w-full max-w-32 sm:w-32 h-20 border-2 border-green-200 rounded-lg overflow-hidden">
                          <img
                            src={idImageUrl}
                            alt="Uploaded ID"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {isUploadingId && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Uploading ID...</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPG, JPEG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Summary */}
            {rentalCalculation && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-300 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-3 sm:mb-4">
                  Rental Summary
                </h3>

                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-800">
                  <div className="flex justify-between">
                    <span>Game:</span>
                    <span className="font-semibold text-right ml-2">
                      {game.gameTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{rentalDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold text-green-700">
                      {rentalCalculation.appliedPlan}
                    </span>
                  </div>

                  <div className="border-t-2 border-green-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="flex justify-between mb-1.5 sm:mb-2">
                      <span>Rental Fee:</span>
                      <span className="font-bold text-base sm:text-lg">
                        ₱{rentalCalculation.rentalFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1.5 sm:mb-2">
                      <span>Refundable Deposit:</span>
                      <span className="font-bold text-base sm:text-lg text-green-600">
                        ₱{rentalCalculation.deposit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg sm:text-xl font-black text-green-900 pt-2 sm:pt-3 border-t-2 border-green-300">
                      <span>Total Due Upfront:</span>
                      <span>
                        ₱{rentalCalculation.totalDue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm text-green-800 mt-3 sm:mt-4">
                    <div className="font-semibold mb-1">
                      ✓ {rentalCalculation.promoMessage}
                    </div>
                    <div>💡 Deposit fully refundable upon game return</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !rentalCalculation}
                className={`min-h-[44px] px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all ${
                  isSubmitting || !rentalCalculation
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl active:scale-95"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Rental Request"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function RentalFormPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
          <Navigation />
          <div className="pt-32 pb-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-[3/4] bg-gray-200 rounded-2xl"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <RentalFormContent />
    </Suspense>
  );
}
