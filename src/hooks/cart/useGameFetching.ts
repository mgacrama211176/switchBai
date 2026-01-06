import { useState, useEffect } from "react";
import { Game } from "@/app/types/games";
import { fetchGameByBarcode } from "@/lib/api-client";
import { CartItem } from "@/contexts/CartContext";

export function useGameFetching(
  cartItems: CartItem[],
  gamesGiven: CartItem[] | undefined,
  availableGames: Game[],
) {
  const [fetchedGames, setFetchedGames] = useState<Map<string, Game>>(
    new Map(),
  );
  const [fetchingGames, setFetchingGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch games for items (games received)
    cartItems.forEach((item) => {
      const game =
        availableGames.find((g) => g.gameBarcode === item.gameBarcode) ||
        fetchedGames.get(item.gameBarcode);

      if (!game && !fetchingGames.has(item.gameBarcode)) {
        setFetchingGames((prev) => {
          const newSet = new Set(prev);
          newSet.add(item.gameBarcode);
          return newSet;
        });
        fetchGameByBarcode(item.gameBarcode)
          .then((response) => {
            if (response.success && response.data) {
              setFetchedGames((prev) => {
                const newMap = new Map(prev);
                newMap.set(item.gameBarcode, response.data!);
                return newMap;
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching game:", error);
          })
          .finally(() => {
            setFetchingGames((prev) => {
              const newSet = new Set(prev);
              newSet.delete(item.gameBarcode);
              return newSet;
            });
          });
      }
    });

    // Fetch games for gamesGiven (games trading in)
    if (gamesGiven) {
      gamesGiven.forEach((item) => {
        const game =
          availableGames.find((g) => g.gameBarcode === item.gameBarcode) ||
          fetchedGames.get(item.gameBarcode);

        if (!game && !fetchingGames.has(item.gameBarcode)) {
          setFetchingGames((prev) => {
            const newSet = new Set(prev);
            newSet.add(item.gameBarcode);
            return newSet;
          });
          fetchGameByBarcode(item.gameBarcode)
            .then((response) => {
              if (response.success && response.data) {
                setFetchedGames((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(item.gameBarcode, response.data!);
                  return newMap;
                });
              }
            })
            .catch((error) => {
              console.error("Error fetching game:", error);
            })
            .finally(() => {
              setFetchingGames((prev) => {
                const newSet = new Set(prev);
                newSet.delete(item.gameBarcode);
                return newSet;
              });
            });
        }
      });
    }
  }, [cartItems, gamesGiven, availableGames, fetchedGames, fetchingGames]);

  return { fetchedGames };
}
