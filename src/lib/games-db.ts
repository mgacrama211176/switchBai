import fs from "fs/promises";
import path from "path";
import { Game } from "@/app/types/games";

const GAMES_JSON_PATH = path.join(process.cwd(), "src/app/data/games.json");

export async function readGamesFromJSON(): Promise<Game[]> {
  try {
    const fileContent = await fs.readFile(GAMES_JSON_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return data.games || [];
  } catch (error) {
    console.error("Error reading games.json:", error);
    return [];
  }
}

export async function writeGamesToJSON(games: Game[]): Promise<void> {
  try {
    const data = {
      games: games,
    };
    await fs.writeFile(GAMES_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing games.json:", error);
    throw new Error("Failed to write games to file");
  }
}

export async function findGameByBarcode(barcode: string): Promise<Game | null> {
  const games = await readGamesFromJSON();
  return games.find((game) => game.gameBarcode === barcode) || null;
}

export function validateGameData(game: Partial<Game>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!game.gameTitle?.trim()) {
    errors.push("Game title is required");
  }
  if (
    !game.gamePlatform ||
    (Array.isArray(game.gamePlatform) && game.gamePlatform.length === 0)
  ) {
    errors.push("At least one platform is required");
  }
  if (!game.gameRatings?.trim()) {
    errors.push("Game rating is required");
  }
  if (!game.gameBarcode?.trim()) {
    errors.push("Barcode is required");
  } else if (!/^\d{10,13}$/.test(game.gameBarcode)) {
    errors.push("Barcode must be 10-13 digits");
  }
  if (!game.gameDescription?.trim()) {
    errors.push("Description is required");
  }
  if (!game.gameImageURL?.trim()) {
    errors.push("Image URL is required");
  }
  if (game.gameAvailableStocks === undefined || game.gameAvailableStocks < 0) {
    errors.push("Available stocks must be 0 or greater");
  }
  if (!game.gamePrice || game.gamePrice <= 0) {
    errors.push("Price must be greater than 0");
  }
  if (!game.gameCategory?.trim()) {
    errors.push("Category is required");
  }
  if (!game.gameReleaseDate?.trim()) {
    errors.push("Release date is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
