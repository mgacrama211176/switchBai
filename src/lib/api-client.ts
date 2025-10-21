import axios, { AxiosResponse } from "axios";
import { Game } from "@/app/types/games";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface GamesApiResponse {
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Generic API request wrapper with error handling
 */
async function apiRequest<T>(url: string): Promise<ApiResponse<T>> {
  // Prevent API calls during build time
  if (typeof window === "undefined" && process.env.NODE_ENV === "production") {
    console.warn("API call blocked during build time:", url);
    return {
      error: "API calls not available during build time",
      success: false,
    };
  }

  try {
    // Ensure URL is properly formatted
    const fullUrl = url.startsWith("http")
      ? url
      : `${apiClient.defaults.baseURL}${url}`;

    const response: AxiosResponse<T> = await apiClient.get(fullUrl);
    return { data: response.data, success: true };
  } catch (error) {
    console.error("API request error:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error || error.message || "API request failed";
      return {
        error: errorMessage,
        success: false,
      };
    }
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false,
    };
  }
}

/**
 * Fetch latest games with pagination
 */
export async function fetchLatestGames(
  limit: number = 10
): Promise<ApiResponse<Game[]>> {
  const url = `/api/games?limit=${limit}&page=1`;
  const response = await apiRequest<GamesApiResponse>(url);

  if (response.success && response.data) {
    return {
      data: response.data.games,
      success: true,
    };
  }

  return {
    error: response.error || "Failed to fetch games",
    success: false,
  };
}

/**
 * Fetch games with filters
 */
export async function fetchGames(params: {
  limit?: number;
  page?: number;
  platform?: string;
  category?: string;
  search?: string;
}): Promise<ApiResponse<GamesApiResponse>> {
  const searchParams = new URLSearchParams();

  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.platform) searchParams.set("platform", params.platform);
  if (params.category) searchParams.set("category", params.category);
  if (params.search) searchParams.set("search", params.search);

  const url = `/api/games?${searchParams.toString()}`;
  return apiRequest<GamesApiResponse>(url);
}

/**
 * Fetch single game by barcode
 */
export async function fetchGameByBarcode(
  barcode: string
): Promise<ApiResponse<Game>> {
  const url = `/api/games/${barcode}`;
  const response = await apiRequest<{ game: Game }>(url);

  if (response.success && response.data) {
    return {
      data: response.data.game,
      success: true,
    };
  }

  return {
    error: response.error || "Failed to fetch game",
    success: false,
  };
}

/**
 * SWR fetcher function for client-side data fetching
 */
export const swrFetcher = async (url: string): Promise<any> => {
  try {
    // Ensure URL is properly formatted
    const fullUrl = url.startsWith("http")
      ? url
      : `${apiClient.defaults.baseURL}${url}`;

    const response = await apiClient.get(fullUrl);
    return response.data;
  } catch (error) {
    throw new Error(
      axios.isAxiosError(error) ? error.message : "Failed to fetch data"
    );
  }
};
