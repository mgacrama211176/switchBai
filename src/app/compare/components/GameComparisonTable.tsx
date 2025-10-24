import React from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import { getGameMetadata } from "../helpers/game-metadata";
import {
  renderDetailField,
  renderActionButton,
} from "../helpers/render-helpers";
import { formatPrice } from "@/app/components/ui/home/game-utils";

interface GameComparisonTableProps {
  selectedGames: Game[];
  cartItems: string[];
  onAddToCart: (game: Game) => void;
  onRemoveGame: (barcode: string) => void;
  isInCart: (barcode: string) => boolean;
}

export const GameComparisonTable: React.FC<GameComparisonTableProps> = ({
  selectedGames,
  cartItems,
  onAddToCart,
  onRemoveGame,
  isInCart,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-funBlue to-blue-500 text-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedGames.map((game, index) => (
            <div key={game.gameBarcode} className="text-center">
              <h3 className="text-2xl font-bold mb-2">Game {index + 1}</h3>
              <p className="text-blue-100">{game.gameTitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedGames.map((game, index) => {
            const metadata = getGameMetadata(game);

            return (
              <div key={game.gameBarcode} className="space-y-6">
                {/* Game Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={game.gameImageURL}
                    alt={game.gameTitle}
                    fill
                    className="object-cover"
                  />
                  {metadata.savings.percentage > 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Save {metadata.savings.percentage}%
                    </div>
                  )}
                </div>

                {/* Game Details */}
                <div className="space-y-4">
                  {/* Title */}
                  {renderDetailField(
                    "Title",
                    <p className="text-xl font-bold text-gray-900">
                      {game.gameTitle}
                    </p>,
                  )}

                  {/* Platform */}
                  {renderDetailField(
                    "Platform",
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${metadata.platform.color}`}
                    >
                      <span>{metadata.platform.icon}</span>
                      <span>{metadata.platform.display}</span>
                    </span>,
                  )}

                  {/* Category & Rating */}
                  <div className="grid grid-cols-2 gap-4">
                    {renderDetailField(
                      "Category",
                      <span className="text-sm font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {game.gameCategory}
                      </span>,
                    )}
                    {renderDetailField(
                      "Rating",
                      <span className="text-sm font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        {game.gameRatings}
                      </span>,
                    )}
                  </div>

                  {/* Price */}
                  {renderDetailField(
                    "Price",
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-funBlue">
                        {formatPrice(game.gamePrice)}
                      </div>
                      {metadata.savings.percentage > 0 && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">
                            {formatPrice(metadata.savings.original)}
                          </span>
                          <span className="ml-2 text-green-600 font-bold">
                            Save ₱{metadata.savings.savings.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>,
                  )}

                  {/* Stock */}
                  {renderDetailField(
                    "Availability",
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${metadata.stock.bgColor} ${metadata.stock.color}`}
                    >
                      {metadata.stock.text}
                    </span>,
                  )}

                  {/* Release Date */}
                  {renderDetailField(
                    "Release Date",
                    <p className="text-sm text-gray-700">
                      {new Date(game.gameReleaseDate).toLocaleDateString()}
                    </p>,
                  )}

                  {/* Description */}
                  {renderDetailField(
                    "Description",
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {game.gameDescription}
                    </p>,
                  )}

                  {/* Rental Info */}
                  {game.rentalAvailable &&
                    renderDetailField(
                      "Rental",
                      <p className="text-sm text-gray-700">
                        Available • ₱{game.rentalWeeklyRate}/week
                      </p>,
                    )}

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-2">
                    {renderActionButton(
                      game,
                      isInCart(game.gameBarcode),
                      game.gameAvailableStocks === 0,
                      () => onAddToCart(game),
                      game.gameAvailableStocks === 0
                        ? "🚫 Out of Stock"
                        : "🛒 Add to Cart",
                    )}

                    <button
                      onClick={() => onRemoveGame(game.gameBarcode)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors duration-300"
                    >
                      Remove from Comparison
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
