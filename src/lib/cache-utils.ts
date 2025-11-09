import { Game } from "@/app/types/games";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Default TTL: 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a value from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance
const cache = new SimpleCache();

// Clean expired entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      cache.cleanExpired();
    },
    5 * 60 * 1000,
  );
}

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  LATEST_GAMES: "latest_games",
  GAMES_LIST: (page: number, limit: number) => `games_list_${page}_${limit}`,
  GAME_BY_BARCODE: (barcode: string) => `game_${barcode}`,
} as const;

/**
 * Get cached games
 */
export function getCachedGames(key: string): Game[] | null {
  return cache.get<Game[]>(key);
}

/**
 * Set cached games
 */
export function setCachedGames(
  key: string,
  games: Game[],
  ttl: number = 5 * 60 * 1000,
): void {
  cache.set(key, games, ttl);
}

/**
 * Clear games cache
 */
export function clearGamesCache(): void {
  cache.delete(CACHE_KEYS.LATEST_GAMES);
  // Could clear all game-related cache here
}

/**
 * Get cache instance (for advanced usage)
 */
export function getCache(): SimpleCache {
  return cache;
}
