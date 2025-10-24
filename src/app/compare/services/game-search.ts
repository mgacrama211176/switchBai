import { Game } from "@/app/types/games";

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
        setGames(response.data.games);
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
