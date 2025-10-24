import { useState, useEffect } from "react";
import { Game } from "@/app/types/games";
import { GameComparisonService } from "../services/game-comparison";
import { GameSearchService } from "../services/game-search";

export const useGameComparison = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter games based on search query
  const filteredGames = GameSearchService.filterGames(games, searchQuery);

  // Fetch games on component mount
  useEffect(() => {
    GameSearchService.loadGames(setIsLoading, setError, setGames);
  }, []);

  // Game selection handlers
  const handleGameSelect = (game: Game) => {
    GameComparisonService.handleGameSelect(
      game,
      selectedGames,
      setSelectedGames,
    );
  };

  const handleGameRemove = (barcode: string) => {
    GameComparisonService.handleGameRemove(barcode, setSelectedGames);
  };

  const handleReset = () => {
    GameComparisonService.handleReset(setSelectedGames);
  };

  const handleAddToCart = (game: Game) => {
    GameComparisonService.handleAddToCart(game, cartItems, setCartItems);
  };

  const isInCart = (barcode: string) => {
    return GameComparisonService.isInCart(barcode, cartItems);
  };

  return {
    games,
    selectedGames,
    searchQuery,
    setSearchQuery,
    cartItems,
    isLoading,
    error,
    filteredGames,
    handleGameSelect,
    handleGameRemove,
    handleReset,
    handleAddToCart,
    isInCart,
  };
};
