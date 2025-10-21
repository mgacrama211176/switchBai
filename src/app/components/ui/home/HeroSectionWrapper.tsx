import { fetchLatestGames } from "@/lib/api-client";
import { Game } from "@/app/types/games";
import HeroSection from "./HeroSection";

interface HeroSectionWrapperProps {
  fallbackGames?: Game[];
}

export default async function HeroSectionWrapper({
  fallbackGames = [],
}: HeroSectionWrapperProps) {
  // Fetch initial data on the server
  const apiResponse = await fetchLatestGames(10);

  // Use API data if successful, otherwise fall back to provided games or empty array
  const initialGames =
    apiResponse.success && apiResponse.data ? apiResponse.data : fallbackGames;

  return <HeroSection initialGames={initialGames} />;
}
