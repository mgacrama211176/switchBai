import type { Metadata } from "next";
import { TradeHeroSection } from "@/app/components/ui/trade/TradeHeroSection";
import { TradingPolicySection } from "@/app/components/ui/trade/TradingPolicySection";
import { TradingFlowSection } from "@/app/components/ui/trade/TradingFlowSection";
import { TradingProcessSection } from "@/app/components/ui/trade/TradingProcessSection";
import { TradableGamesSection } from "@/app/components/ui/trade/TradableGamesSection";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";

export const metadata: Metadata = {
  title: "Trade Nintendo Switch Games | SwitchBai Trading - Cebu City",
  description:
    "Trade your Nintendo Switch games for new ones at SwitchBai. Fair valuations, transparent pricing, and easy process. Browse games open for trade in Cebu City.",
  keywords: [
    "Nintendo Switch game trading",
    "trade Switch games Cebu",
    "game trade Cebu City",
    "Switch game exchange",
    "trade in games",
  ],
};

export default function TradeGamePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <TradeHeroSection />
      <TradingFlowSection />
      <TradingProcessSection />
      <TradingPolicySection />
      <TradableGamesSection />
      <Footer />
    </main>
  );
}
