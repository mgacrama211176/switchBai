import { Game } from "@/app/types/games";
import {
  getPlatformInfo,
  getStockUrgency,
  calculateSavings,
} from "@/app/components/ui/home/game-utils";

// Helper function to consolidate game metadata calculations
export const getGameMetadata = (game: Game) => {
  return {
    platform: getPlatformInfo(game.gamePlatform),
    stock: getStockUrgency(game.gameAvailableStocks),
    savings: calculateSavings(game.gamePrice, game.gameBarcode),
  };
};
