"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";

interface RentalData {
  _id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  gameTitle: string;
  gameBarcode: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  rentalFee: number;
  deposit: number;
  totalDue: number;
  appliedPlan: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  submittedAt: string;
}

function RentalConfirmationContent() {
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("id");
  const [rental, setRental] = useState<RentalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rentalId) {
      fetchRentalDetails(rentalId);
    } else {
      setError("No rental ID provided");
      setIsLoading(false);
    }
  }, [rentalId]);

  const fetchRentalDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/rentals/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch rental details");
      }
      const data = await response.json();
      setRental(data.rental);
    } catch (err) {
      console.error("Error fetching rental:", err);
      setError("Failed to load rental details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
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

  if (error || !rental) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Rental Not Found
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
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
              Rental Request Submitted!
            </h1>
            <p className="text-gray-800">
              Thank you for choosing SwitchBai. We'll contact you shortly to
              confirm your rental.
            </p>
          </div>

          {/* Rental Reference */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rental Reference
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-black text-funBlue">
                {rental.referenceNumber}
              </div>
              <p className="text-sm text-gray-700 mt-1">
                Keep this reference number for your records
              </p>
            </div>
          </div>

          {/* Rental Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Rental Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-700">Game:</span>
                <span className="font-semibold text-gray-900">
                  {rental.gameTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Rental Period:</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duration:</span>
                <span className="font-semibold text-gray-900">
                  {rental.rentalDays} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Plan:</span>
                <span className="font-semibold text-green-700">
                  {rental.appliedPlan}
                </span>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Rental Fee:</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(rental.rentalFee)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Refundable Deposit:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(rental.deposit)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black text-green-900 pt-3 border-t-2 border-green-300">
                  <span>Total Due Upfront:</span>
                  <span>{formatPrice(rental.totalDue)}</span>
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
                <span className="text-gray-900">{rental.deliveryAddress}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Landmark:</span>{" "}
                <span className="text-gray-900">{rental.deliveryLandmark}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">City:</span>{" "}
                <span className="text-gray-900">{rental.deliveryCity}</span>
              </p>
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
                <span className="text-gray-900">{rental.customerName}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Phone:</span>{" "}
                <span className="text-gray-900">{rental.customerPhone}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{rental.customerEmail}</span>
              </p>
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
                  <strong>email</strong> to confirm your rental within 24 hours.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <p>
                  Once confirmed, we'll arrange delivery of your game to the
                  address provided.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <p>
                  Enjoy your game rental! Return it on or before the end date to
                  get your full deposit back.
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

export default function RentalConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
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
      <RentalConfirmationContent />
    </Suspense>
  );
}
