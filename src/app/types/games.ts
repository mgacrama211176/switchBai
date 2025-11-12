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
  costPrice?: number;
}

export interface BuyingGame {
  gameBarcode: string;
  gameTitle: string;
  sellingPrice: number;
  quantity: number;
  isNewGame: boolean;
  newGameDetails?: {
    gamePlatform: string | string[];
    gameRatings: string;
    gameDescription: string;
    gameImageURL: string;
    gameCategory: string;
    gameReleaseDate: string;
    tradable?: boolean;
    rentalAvailable?: boolean;
    rentalWeeklyRate?: number;
    class?: string;
  };
}

export interface Buying {
  _id?: string;
  purchaseReference: string;
  supplierName?: string;
  supplierContact?: string;
  supplierNotes?: string;
  games: BuyingGame[];
  totalCost: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  profitMargin: number;
  status: "pending" | "completed" | "cancelled";
  purchasedAt: string;
  completedAt?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  totalCosts: number;
  totalRevenue: number;
  rentalRevenue: number;
  totalRevenueWithRentals: number;
  grossProfit: number;
  profitMargin: number;
  status: "profit" | "loss" | "break-even";
}

export interface FinancialTimeSeries {
  date: string;
  revenue: number;
  costs: number;
  profit: number;
  orderCount: number;
  rentalCount: number;
}

export interface RevenueBreakdown {
  byStatus: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  bySource: Record<string, number>;
  totalDiscounts: number;
}

export interface CostBreakdown {
  total: number;
  bySupplier: Array<{ supplier: string; amount: number }>;
}

export interface TopGame {
  gameTitle: string;
  revenue: number;
  cost: number;
  profit: number;
  quantitySold: number;
}

export interface InventoryMetrics {
  totalValue: number;
  potentialRevenue: number;
  potentialProfit: number;
}

export interface MarketProjections {
  projectedMonthlyRevenue: number;
  projectedMonthlyProfit: number;
  salesVelocity: number;
  inventoryTurnover: number;
  growthRate: number;
}

export interface FinancialData {
  summary: FinancialSummary;
  timeSeries: FinancialTimeSeries[];
  revenueBreakdown: RevenueBreakdown;
  costBreakdown: CostBreakdown;
  topGames: TopGame[];
  inventory: InventoryMetrics;
  projections: MarketProjections;
}
