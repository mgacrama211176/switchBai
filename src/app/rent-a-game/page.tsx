import type { Metadata } from "next";
import { RentalHeroSection } from "@/app/components/ui/rent/RentalHeroSection";
import { HowItWorksSection } from "@/app/components/ui/rent/HowItWorksSection";
import { PricingCalculator } from "@/app/components/ui/rent/PricingCalculator";
import { PricingTableSection } from "@/app/components/ui/rent/PricingTableSection";
import { RentalPolicySection } from "@/app/components/ui/rent/RentalPolicySection";
import { CheckoutInstructionsSection } from "@/app/components/ui/rent/CheckoutInstructionsSection";
import { RentalFAQSection } from "@/app/components/ui/rent/RentalFAQSection";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";

export const metadata: Metadata = {
  title: "Rent Nintendo Switch Games | SwitchBai Rentals - Cebu City",
  description:
    "Rent premium Nintendo Switch games in Cebu City at affordable weekly rates. Starting at ₱300/week with refundable deposits. Play, swap, and extend anytime!",
  keywords: [
    "Nintendo Switch rentals",
    "game rental Cebu",
    "rent Switch games",
    "affordable game rentals",
    "Cebu game rental",
  ],
};

export default function RentGamePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <RentalHeroSection />
      <HowItWorksSection />
      <PricingCalculator />
      <PricingTableSection />
      <RentalPolicySection />
      <CheckoutInstructionsSection />
      <RentalFAQSection />
      <Footer />
    </main>
  );
}
