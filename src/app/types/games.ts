export interface Game {
  _id?: string; // MongoDB document ID
  gameTitle: string;
  gamePlatform: string | string[];
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
  numberOfSold?: number;
  rentalAvailable?: boolean;
  rentalWeeklyRate?: number;
  class?: string;
  tradable?: boolean;
  isOnSale?: boolean;
  salePrice?: number;
}
