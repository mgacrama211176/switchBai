import React from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import { getGameMetadata } from "../helpers/game-metadata";
import { renderActionButton } from "../helpers/render-helpers";
import { COMPARE_CONSTANTS } from "../utils/constants";
import { formatPrice } from "@/app/components/ui/home/game-utils";

interface SearchResultsProps {
  games: Game[];
  selectedGames: Game[];
  cartItems: string[];
  isLoading: boolean;
  error: string | null;
  onGameSelect: (game: Game) => void;
  onAddToCart: (game: Game) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  games,
  selectedGames,
  cartItems,
  isLoading,
  error,
  onGameSelect,
  onAddToCart,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-funBlue mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No games found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.slice(0, COMPARE_CONSTANTS.SEARCH_RESULTS_LIMIT).map((game) => {
        const metadata = getGameMetadata(game);
        const isSelected = selectedGames.some(
          (g) => g.gameBarcode === game.gameBarcode,
        );

        return (
          <div
            key={game.gameBarcode}
            className={`${COMPARE_CONSTANTS.CARD_BASE_CLASSES} ${
              isSelected ? "ring-2 ring-funBlue" : ""
            }`}
          >
            <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl">
              <Image
                src={game.gameImageURL}
                alt={game.gameTitle}
                fill
                className="object-cover"
              />
              {metadata.savings.percentage > 0 && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Save {metadata.savings.percentage}%
                </div>
              )}
            </div>

            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {game.gameTitle}
            </h4>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">
                {metadata.platform.display}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{game.gameCategory}</span>
            </div>

            <div className="text-xl font-bold text-funBlue mb-2">
              {formatPrice(game.gamePrice)}
            </div>

            <div
              className={`text-xs font-bold px-2 py-1 rounded-full ${metadata.stock.bgColor} ${metadata.stock.color}`}
            >
              {metadata.stock.text}
            </div>

            <button
              onClick={() => onGameSelect(game)}
              disabled={
                isSelected ||
                selectedGames.length >= COMPARE_CONSTANTS.MAX_COMPARISON_GAMES
              }
              className={`w-full mt-4 py-2 px-4 rounded-xl font-bold transition-all duration-300 ${
                isSelected
                  ? "bg-green-100 text-green-700 cursor-not-allowed"
                  : selectedGames.length >=
                      COMPARE_CONSTANTS.MAX_COMPARISON_GAMES
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-funBlue text-white hover:bg-blue-600"
              }`}
            >
              {isSelected ? "Selected" : "Add to Compare"}
            </button>
          </div>
        );
      })}
    </div>
  );
};
