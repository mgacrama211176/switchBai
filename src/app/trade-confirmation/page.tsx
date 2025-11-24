"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import { formatPrice } from "@/lib/purchase-form-utils";
import { fetchGameByBarcode } from "@/lib/api-client";
import { Game } from "@/app/types/games";

interface TradeData {
  _id: string;
  tradeReference: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;
  gamesGiven: Array<{
    gameBarcode: string;
    gameTitle: string;
    gamePrice: number;
    quantity: number;
  }>;
  gamesReceived: Array<{
    gameBarcode: string;
    gameTitle: string;
    gamePrice: number;
    quantity: number;
  }>;
  tradeLocation?: string;
  notes?: string;
  totalValueGiven: number;
  totalValueReceived: number;
  cashDifference: number;
  tradeFee: number;
  status: string;
  submittedAt: string;
}

function TradeConfirmationContent() {
  const searchParams = useSearchParams();
  const tradeId = searchParams.get("tradeId");
  const reference = searchParams.get("reference");
  const [trade, setTrade] = useState<TradeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameImages, setGameImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tradeId) {
      fetchTradeDetails(tradeId);
    } else {
      setError("No trade ID provided.");
      setIsLoading(false);
    }
  }, [tradeId]);

  const fetchTradeDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trade details");
      }
      const data = await response.json();
      if (data.success && data.data) {
        setTrade(data.data);
      } else {
        setError(data.error || "Trade not found.");
      }
    } catch (err) {
      console.error("Error fetching trade details:", err);
      setError("Failed to load trade details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trade) {
      const fetchGameImages = async () => {
        const imageMap: Record<string, string> = {};
        const allGames = [
          ...(trade.gamesGiven || []),
          ...(trade.gamesReceived || []),
        ];
        const promises = allGames.map(async (gameItem) => {
          try {
            const response = await fetchGameByBarcode(gameItem.gameBarcode);
            if (response.success && response.data?.gameImageURL) {
              imageMap[gameItem.gameBarcode] = response.data.gameImageURL;
            }
          } catch (err) {
            console.error(
              `Error fetching image for game ${gameItem.gameBarcode}:`,
              err,
            );
          }
        });

        await Promise.all(promises);
        setGameImages(imageMap);
      };

      fetchGameImages();
    }
  }, [trade]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <p className="text-gray-700">Loading trade details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !trade) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="pt-24 md:pt-32 pb-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Error
              </h1>
              <p className="text-gray-700 mb-8 text-lg">{error}</p>
              <Link
                href="/trade-game"
                className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Back to Trade Page
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
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Trade Request Submitted!
            </h1>
            <p className="text-gray-700 mb-6 text-lg">
              Your trade request has been received. Someone from our team will
              contact you via phone or email to process your trade and confirm
              the details.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Trade Reference</p>
              <p className="text-2xl font-bold text-funBlue">
                {trade.tradeReference}
              </p>
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Trade Summary
            </h2>

            {/* Games You're Trading In */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Games You're Trading In
              </h3>
              <div className="space-y-4">
                {trade.gamesGiven.map((game) => (
                  <div
                    key={game.gameBarcode}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      {gameImages[game.gameBarcode] ? (
                        <Image
                          src={gameImages[game.gameBarcode]}
                          alt={game.gameTitle}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {game.gameTitle}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mb-2">
                        {game.gameBarcode}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Quantity: {game.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₱{(game.gamePrice * game.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Games You Want to Receive */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Games You Want to Receive
              </h3>
              <div className="space-y-4">
                {trade.gamesReceived.map((game) => (
                  <div
                    key={game.gameBarcode}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      {gameImages[game.gameBarcode] ? (
                        <Image
                          src={gameImages[game.gameBarcode]}
                          alt={game.gameTitle}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {game.gameTitle}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mb-2">
                        {game.gameBarcode}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Quantity: {game.quantity}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₱{(game.gamePrice * game.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade Financial Summary */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Value Given:</span>
                  <span className="font-semibold">
                    ₱{trade.totalValueGiven.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Value Received:</span>
                  <span className="font-semibold">
                    ₱{trade.totalValueReceived.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trade Fee:</span>
                  <span className="font-semibold">
                    ₱{trade.tradeFee.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">
                      Cash Difference (You Pay):
                    </span>
                    <span className="text-lg font-bold text-funBlue">
                      ₱{trade.cashDifference.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What's Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-funBlue text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Team Contact
                  </h3>
                  <p className="text-gray-700">
                    Someone from our team will contact you via phone or email to
                    process your trade and confirm the details.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-funBlue text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Trade Confirmation
                  </h3>
                  <p className="text-gray-700">
                    We'll confirm the trade details, including game conditions
                    and meeting location.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-funBlue text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Complete Trade
                  </h3>
                  <p className="text-gray-700">
                    Meet at the agreed location, exchange games, and complete
                    any cash payment if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/trade-game"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-center"
            >
              Browse More Games to Trade
            </Link>
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function TradeConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TradeConfirmationContent />
    </Suspense>
  );
}
