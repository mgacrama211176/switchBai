import { useState, useMemo, useEffect } from "react";
import { Game } from "@/app/types/games";
import { fetchGames } from "@/lib/api-client";

export function useTradeGameSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<"received" | "given">("given");
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  // Load games for trade search (all Nintendo Switch games)
  useEffect(() => {
    if (availableGames.length === 0) {
      setIsLoadingGames(true);
      fetchGames({ limit: 1000, nintendoOnly: true })
        .then((response) => {
          if (response.success && response.data) {
            setAvailableGames(response.data.games || []);
          }
        })
        .catch((error) => {
          console.error("Error fetching games:", error);
        })
        .finally(() => {
          setIsLoadingGames(false);
        });
    }
  }, [availableGames.length]);

  // Filter games for "Games Trading In" (all games, no tradable filter)
  const filteredGamesGiven = useMemo(() => {
    if (side !== "given") return [];

    if (!searchTerm.trim()) {
      return availableGames.slice(0, 10);
    }

    const searchLower = searchTerm.toLowerCase();
    return availableGames
      .filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.toLowerCase().includes(searchLower),
      )
      .slice(0, 10);
  }, [availableGames, searchTerm, side]);

  // Filter games for "Games Receiving" (only tradable games with stock > 0)
  const filteredGamesReceived = useMemo(() => {
    if (side !== "received") return [];

    const tradableInStock = availableGames.filter(
      (game) => game.tradable && game.gameAvailableStocks > 0,
    );

    if (!searchTerm.trim()) {
      return tradableInStock.slice(0, 10);
    }

    const searchLower = searchTerm.toLowerCase();
    return tradableInStock
      .filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.toLowerCase().includes(searchLower),
      )
      .slice(0, 10);
  }, [availableGames, searchTerm, side]);

  const openSearch = (newSide: "received" | "given") => {
    setSide(newSide);
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  return {
    searchTerm,
    setSearchTerm,
    isOpen,
    side,
    setSide,
    openSearch,
    closeSearch,
    filteredGamesGiven,
    filteredGamesReceived,
    isLoadingGames,
    availableGames,
  };
}
