import React from "react";
import Image from "next/image";
import { Game } from "@/app/types/games";
import { getGameMetadata } from "../helpers/game-metadata";
import { formatPrice } from "@/app/components/ui/home/game-utils";

interface GameSelectionSlotProps {
  game: Game | null;
  slotNumber: number;
  onRemove: (barcode: string) => void;
}

export const GameSelectionSlot: React.FC<GameSelectionSlotProps> = ({
  game,
  slotNumber,
  onRemove,
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 min-h-[400px] flex flex-col items-center justify-center">
      {game ? (
        <div className="w-full">
          {/* Selected Game */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex gap-4">
              <div className="w-24 h-32 relative flex-shrink-0">
                <Image
                  src={game.gameImageURL}
                  alt={game.gameTitle}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {game.gameTitle}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">
                    {getGameMetadata(game).platform.display}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {game.gameCategory}
                  </span>
                </div>
                <div className="text-xl font-bold text-funBlue mb-2">
                  {formatPrice(game.gamePrice)}
                </div>
                <button
                  onClick={() => onRemove(game.gameBarcode)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove from comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-4">
            Slot {slotNumber} - Select a game
          </p>
          <p className="text-gray-400 text-sm">Choose from the games below</p>
        </div>
      )}
    </div>
  );
};
