import { Game } from "@/app/types/games";
import HeroSection from "./HeroSection";

interface HeroSectionWrapperProps {
  fallbackGames?: Game[];
}

export default function HeroSectionWrapper({
  fallbackGames = [],
}: HeroSectionWrapperProps) {
  // Always pass empty array to prevent build-time API calls
  // The HeroSection will handle data fetching on the client side
  return <HeroSection initialGames={[]} />;
}
