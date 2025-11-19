import { Game } from "@/app/types/games";
import { filterNintendoSwitchGames } from "@/app/components/ui/home/game-utils";

// Service for managing game search and filtering
export class GameSearchService {
  static filterGames(games: Game[], searchQuery: string): Game[] {
    if (!searchQuery.trim()) return games;

    return games.filter(
      (game) =>
        game.gameTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameDescription.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  static async loadGames(
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setGames: React.Dispatch<React.SetStateAction<Game[]>>,
  ) {
    try {
      setIsLoading(true);
      const { fetchGames } = await import("@/lib/api-client");
      const response = await fetchGames({ limit: 100, page: 1 });

      if (response.success && response.data) {
        // Filter out PS4/PS5 games - only show Nintendo Switch games
        const filteredGames = filterNintendoSwitchGames(
          response.data.games || [],
        );
        setGames(filteredGames);
      } else {
        setError("Failed to load games");
      }
    } catch (err) {
      setError("An error occurred while loading games");
    } finally {
      setIsLoading(false);
    }
  }
}
