"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";

export default function EmptyCart() {
  const router = useRouter();
  const { setCartType } = useCart();

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
