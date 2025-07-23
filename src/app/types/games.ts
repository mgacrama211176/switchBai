export type Game = {
  gameTitle: string;
  gamePlatform: string | string[]; // Updated to support both string and array formats
  gameRatings: string;
  gameBarcode: string;
  gameDescription: string;
  gameImageURL: string;
  gameAvailableStocks: number;
  gamePrice: number;
  gameCategory: string;
  gameReleaseDate: string;
  createdAt: string;
  updatedAt: string;
  numberOfSold?: number; // Now available in JSON
};
