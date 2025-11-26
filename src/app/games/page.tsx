"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useLayoutEffect,
  Suspense,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchGames } from "@/lib/api-client";
import { Game } from "@/app/types/games";
import Navigation from "@/app/components/ui/globalUI/Navigation";
import Footer from "@/app/components/ui/globalUI/Footer";
import GameCardSkeleton from "@/app/components/ui/home/GameCardSkeleton";
import ComparisonModal from "@/app/components/ui/home/ComparisonModal";
import {
  formatPrice,
  calculateSavings,
  getPlatformInfo,
  getStockUrgency,
} from "@/app/components/ui/home/game-utils";
import { useCart } from "@/contexts/CartContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const CATEGORIES = [
  "RPG",
  "Platformer",
  "Action-Adventure",
  "Racing",
  "Simulation",
  "Fighting",
  "Shooter",
  "Strategy",
  "Action",
  "Sports",
];

const PLATFORMS = ["Nintendo Switch", "Nintendo Switch 2", "PS4", "PS5"];

const PRICE_MIN = 500;
const PRICE_MAX = 3500;

const GamesPageContent = () => {
  // URL params handling
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data state
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (from URL or defaults)
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1,
  );
  // Fixed items per page for infinite scroll
  const itemsPerPage = 24;
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  // Parse price range from URL
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const initialPriceRange =
    priceMinParam && priceMaxParam
      ? { min: Number(priceMinParam), max: Number(priceMaxParam) }
      : { min: PRICE_MIN, max: PRICE_MAX };

  // Filter state (from URL or defaults)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    platforms: searchParams.get("platform")?.split(",").filter(Boolean) || [],
    categories: searchParams.get("category")?.split(",").filter(Boolean) || [],
    priceRange: initialPriceRange,
    availability: (searchParams.get("availability") || "inStock") as
      | "all"
      | "inStock"
      | "outOfStock"
      | "onSale",
    sortBy: searchParams.get("sort") || "newest",
    cartridgeOnly: searchParams.get("cartridgeOnly") === "true",
    tradable: searchParams.get("tradable") === "true",
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false); // Mobile filter drawer
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [showCartTypeModal, setShowCartTypeModal] = useState(false);
  const [pendingGame, setPendingGame] = useState<Game | null>(null);

  // Local price range state for immediate UI feedback (separate from filter state)
  const [localPriceRange, setLocalPriceRange] = useState(initialPriceRange);

  // Cart context
  const { addToCart, isInCart, cart } = useCart();

  // Load URL params on mount (for shared links)
  useEffect(() => {
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const urlFilters = {
      search: searchParams.get("search") || "",
      platforms: searchParams.get("platform")?.split(",").filter(Boolean) || [],
      categories:
        searchParams.get("category")?.split(",").filter(Boolean) || [],
      priceRange:
        priceMin && priceMax
          ? { min: Number(priceMin), max: Number(priceMax) }
          : { min: PRICE_MIN, max: PRICE_MAX },
      availability: (searchParams.get("availability") || "inStock") as
        | "all"
        | "inStock"
        | "outOfStock"
        | "onSale",
      sortBy: searchParams.get("sort") || "newest",
      cartridgeOnly: searchParams.get("cartridgeOnly") === "true",
      tradable: searchParams.get("tradable") === "true",
    };
    setFilters(urlFilters);
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, []); // Only on mount

  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Add all active filters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.platforms.length > 0)
      params.set("platform", filters.platforms.join(","));
    if (filters.categories.length > 0)
      params.set("category", filters.categories.join(","));
    if (
      filters.priceRange.min !== PRICE_MIN ||
      filters.priceRange.max !== PRICE_MAX
    ) {
      params.set("priceMin", filters.priceRange.min.toString());
      params.set("priceMax", filters.priceRange.max.toString());
    }
    if (filters.availability !== "inStock")
      params.set("availability", filters.availability);
    if (filters.sortBy !== "newest") params.set("sort", filters.sortBy);
    if (filters.cartridgeOnly) params.set("cartridgeOnly", "true");
    if (filters.tradable) params.set("tradable", "true");
    if (currentPage > 1) params.set("page", currentPage.toString());

    // Update URL without page reload
    const newUrl = params.toString() ? `?${params.toString()}` : "/games";
    router.push(newUrl, { scroll: false });
  }, [
    filters.search,
    filters.platforms.join(","),
    filters.categories.join(","),
    filters.availability,
    filters.sortBy,
    filters.cartridgeOnly,
    filters.tradable,
    currentPage,
    router,
  ]);

  // Update URL when price range filter is committed (separate from other filters)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (
      filters.priceRange.min !== PRICE_MIN ||
      filters.priceRange.max !== PRICE_MAX
    ) {
      params.set("priceMin", filters.priceRange.min.toString());
      params.set("priceMax", filters.priceRange.max.toString());
    } else {
      params.delete("priceMin");
      params.delete("priceMax");
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "/games";
    router.push(newUrl, { scroll: false });
  }, [filters.priceRange.min, filters.priceRange.max, router]);

  // Sync local price range with filter state when filter changes externally
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange.min, filters.priceRange.max]);

  // Initial load on mount
  useEffect(() => {
    loadGames(1, true);
  }, []);

  // Fetch games whenever filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    setGames([]);
    setHasMore(true);
    loadGames(1, true);
  }, [filters.search, filters.platforms, filters.categories]);

  const loadGames = async (
    pageNum: number = currentPage,
    isNewSearch: boolean = false,
  ) => {
    if (isNewSearch) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await fetchGames({
        limit: itemsPerPage,
        page: pageNum,
        platform: filters.platforms.join(","),
        category: filters.categories.join(","),
        search: filters.search, // API searches only titles
        nintendoOnly: true, // Filter out PS4/PS5 games on server-side
      });

      if (response.success && response.data) {
        if (isNewSearch) {
          setGames(response.data.games);
        } else {
          // Append new games, filtering out duplicates
          setGames((prev) => {
            const newGames = (response.data?.games || []).filter(
              (newGame: Game) =>
                !prev.some((g) => g.gameBarcode === newGame.gameBarcode),
            );
            return [...prev, ...newGames];
          });
        }

        // Check if there are more games to load
        setHasMore((response.data?.games?.length || 0) === itemsPerPage);

        // Use API pagination data for display
        setTotalPages(response.data.pagination.pages);
        setTotalGames(response.data.pagination.total);
      } else {
        setError(response.error || "Failed to load games");
      }
    } catch (err) {
      console.error("Error loading games:", err);
      setError("An unexpected error occurred while loading games");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Memoize price range calculations for UI
  const priceRangePercentages = useMemo(() => {
    const minPercent =
      ((localPriceRange.min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    const widthPercent =
      ((localPriceRange.max - localPriceRange.min) / (PRICE_MAX - PRICE_MIN)) *
      100;
    const rangePercent =
      ((localPriceRange.max - localPriceRange.min) / (PRICE_MAX - PRICE_MIN)) *
      100;
    return { minPercent, widthPercent, rangePercent };
  }, [localPriceRange.min, localPriceRange.max]);

  // Apply client-side filters and sorting
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    // Price range filter (client-side)
    if (
      filters.priceRange.min !== PRICE_MIN ||
      filters.priceRange.max !== PRICE_MAX
    ) {
      filtered = filtered.filter(
        (g) =>
          g.gamePrice >= filters.priceRange.min &&
          g.gamePrice <= filters.priceRange.max,
      );
    }

    // Cartridge only filter (client-side)
    if (filters.cartridgeOnly) {
      filtered = filtered.filter((g) => (g.stockCartridgeOnly || 0) > 0);
    }

    // Tradable filter (client-side)
    if (filters.tradable) {
      filtered = filtered.filter((g) => g.tradable === true);
    }

    // Availability filter (client-side)
    if (filters.availability === "inStock") {
      filtered = filtered.filter((g) => g.gameAvailableStocks > 0);
    } else if (filters.availability === "outOfStock") {
      filtered = filtered.filter((g) => g.gameAvailableStocks === 0);
    } else if (filters.availability === "onSale") {
      filtered = filtered.filter(
        (g) => g.isOnSale === true && g.gameAvailableStocks > 0,
      );
    }

    // Sort (client-side)
    switch (filters.sortBy) {
      case "priceLow":
        filtered.sort((a, b) => a.gamePrice - b.gamePrice);
        break;
      case "priceHigh":
        filtered.sort((a, b) => b.gamePrice - a.gamePrice);
        break;
      case "nameAsc":
        filtered.sort((a, b) => a.gameTitle.localeCompare(b.gameTitle));
        break;
      case "nameDesc":
        filtered.sort((a, b) => b.gameTitle.localeCompare(a.gameTitle));
        break;
      case "popular":
        filtered.sort((a, b) => (b.numberOfSold || 0) - (a.numberOfSold || 0));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return filtered;
  }, [
    games,
    filters.priceRange.min,
    filters.priceRange.max,
    filters.cartridgeOnly,
    filters.tradable,
    filters.availability,
    filters.sortBy,
  ]);

  // Calculate total filtered games for display
  const clientTotalGames = filteredAndSortedGames.length;

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadGames(nextPage, false);
    }
  }, [currentPage, isLoading, isLoadingMore, hasMore]);

  // Setup infinite scroll
  const lastElementRef = useInfiniteScroll({
    isLoading: isLoading || isLoadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
  });

  // Scroll to top smoothly when filters change (not on infinite scroll)
  useLayoutEffect(() => {
    if (!isLoading && games.length > 0 && currentPage === 1) {
      startTransition(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }
  }, [
    filters.search,
    filters.platforms.join(","),
    filters.categories.join(","),
    filters.priceRange.min,
    filters.priceRange.max,
    filters.availability,
    filters.cartridgeOnly,
    filters.tradable,
    filters.sortBy,
  ]);

  // Filter Handlers (Real-time, automatic)
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter((p) => p !== platform),
    }));
    setCurrentPage(1);
    setGames([]);
    setHasMore(true);
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
    setCurrentPage(1);
    setGames([]);
    setHasMore(true);
  };

  // Update local price range immediately for UI feedback
  const handlePriceRangeLocalChange = useCallback(
    (min: number, max: number) => {
      setLocalPriceRange({ min, max });
    },
    [],
  );

  // Commit price range to filter state (called on mouseUp or when user stops dragging)
  const handlePriceRangeCommit = useCallback((min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
    setCurrentPage(1);
  }, []);

  const handleAvailabilityChange = (
    availability: "all" | "inStock" | "outOfStock" | "onSale",
  ) => {
    setFilters((prev) => ({ ...prev, availability }));
    setCurrentPage(1);
  };

  const handleCartridgeOnlyChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, cartridgeOnly: checked }));
    setCurrentPage(1);
  };

  const handleTradableChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, tradable: checked }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearAllFilters = () => {
    const defaultPriceRange = { min: PRICE_MIN, max: PRICE_MAX };
    setLocalPriceRange(defaultPriceRange);
    setFilters({
      search: "",
      platforms: [],
      categories: [],
      priceRange: defaultPriceRange,
      availability: "inStock", // Default
      sortBy: "newest",
      cartridgeOnly: false,
      tradable: false,
    });
    setCurrentPage(1);
    setGames([]);
    setHasMore(true);
  };

  // Cart & Compare Handlers
  const handleAddToCart = (game: Game) => {
    if (game.gameAvailableStocks === 0) return;

    // If cart is empty, show type selection modal
    if (cart.items.length === 0 || !cart.type) {
      setPendingGame(game);
      setShowCartTypeModal(true);
      return;
    }

    // If cart has items, check if type matches
    if (cart.type) {
      addToCart(game, 1, cart.type);
    }
  };

  const handleCartTypeSelection = (type: "purchase" | "rental" | "trade") => {
    if (pendingGame) {
      addToCart(pendingGame, 1, type);
      setPendingGame(null);
      setShowCartTypeModal(false);
    }
  };

  const handleAddToCompare = (game: Game) => {
    setCompareItems((prev) => {
      if (prev.includes(game.gameBarcode)) {
        return prev.filter((barcode) => barcode !== game.gameBarcode); // Remove
      }

      if (prev.length >= 2) {
        alert("You can only compare 2 games at a time");
        return prev;
      }

      return [...prev, game.gameBarcode];
    });
  };

  const isInCompare = (barcode: string): boolean =>
    compareItems.includes(barcode);

  // Cart Type Selection Modal Component
  const CartTypeModal = () => {
    if (!showCartTypeModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Select Cart Type
          </h2>
          <p className="text-gray-700 mb-6">
            Would you like to purchase, rent, or trade this game?
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleCartTypeSelection("purchase")}
              className="bg-gradient-to-r from-funBlue to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Purchase
            </button>
            <button
              onClick={() => handleCartTypeSelection("rental")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Rent
            </button>
            <button
              onClick={() => handleCartTypeSelection("trade")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Trade
            </button>
            <button
              onClick={() => {
                setShowCartTypeModal(false);
                setPendingGame(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Game Card Component (inline for now)
  const GameCard: React.FC<{
    game: Game;
    isInCart: boolean;
    isInCompare: boolean;
    onAddToCart: () => void;
    onAddToCompare: () => void;
  }> = ({ game, isInCart, isInCompare, onAddToCart, onAddToCompare }) => {
    const platformInfo = getPlatformInfo(game.gamePlatform);
    const stockInfo = getStockUrgency(game.gameAvailableStocks);
    const displayPrice =
      game.isOnSale && game.salePrice ? game.salePrice : game.gamePrice;
    const savings = calculateSavings(displayPrice, game.gameBarcode, game);

    return (
      <article className="bg-white rounded-2xl overflow-hidden shadow-lg border hover:shadow-xl transition-all duration-300 group ">
        {/* Game Image - Clickable to detail page */}
        <Link href={`/games/${game.gameBarcode}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <Image
              src={game.gameImageURL}
              alt={`${game.gameTitle} game cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Sale Badge */}
            {game.isOnSale && savings.percentage > 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                🏷️ Save {savings.percentage}%
              </div>
            )}

            {/* Stock Badge */}
            <div
              className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full border ${stockInfo.bgColor} ${stockInfo.color}`}
            >
              {stockInfo.text}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2">
          {/* Title - Clickable to detail page */}
          <Link href={`/games/${game.gameBarcode}`}>
            <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-3 min-h-8 hover:text-funBlue transition-colors">
              {game.gameTitle}
            </h3>
          </Link>

          {/* Platform Badge */}
          <div className="flex justify-center">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${platformInfo.color}`}
            >
              <span>{platformInfo.icon}</span> {platformInfo.display}
            </span>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
            {game.isOnSale && game.salePrice ? (
              <>
                <div className="text-lg md:text-xl font-black text-red-600">
                  {formatPrice(game.salePrice)}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500 line-through">
                    {formatPrice(game.gamePrice)}
                  </span>
                  <span className="font-bold text-green-600">
                    Save ₱{savings.savings.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg md:text-xl font-black text-funBlue">
                  {formatPrice(game.gamePrice)}
                </div>
                {savings.percentage > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 line-through">
                      {formatPrice(savings.original)}
                    </span>
                    <span className="font-bold text-green-600">
                      Save ₱{savings.savings.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onAddToCart}
              disabled={game.gameAvailableStocks === 0}
              className={`flex-1 py-2.5 sm:py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                game.gameAvailableStocks === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : isInCart
                    ? "bg-green-500 text-white"
                    : "bg-funBlue text-white hover:bg-blue-600"
              }`}
            >
              {game.gameAvailableStocks === 0
                ? "Out of Stock"
                : isInCart
                  ? "✓ In Cart"
                  : "Add to Cart"}
            </button>

            <button
              onClick={onAddToCompare}
              disabled={!isInCompare && compareItems.length >= 2}
              className={`w-11 h-11 sm:w-10 sm:h-10 rounded-xl transition-all ${
                isInCompare
                  ? "bg-funBlue text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={isInCompare ? "Remove from compare" : "Add to compare"}
            >
              {isInCompare ? "✓" : "⚖"}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            background: #1d4ed8;
            transform: scale(1.1);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          input[type="range"]::-moz-range-thumb:hover {
            background: #1d4ed8;
            transform: scale(1.1);
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `,
        }}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-4 text-center">
            Browse All <span className="text-funBlue">Games</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-700 text-center mb-8">
            Discover Nintendo Switch games for rent or purchase
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search games by title..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 transition-all text-black"
            />
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Active Filters Display */}
          {(filters.platforms.length > 0 ||
            filters.categories.length > 0 ||
            filters.priceRange.min !== PRICE_MIN ||
            filters.priceRange.max !== PRICE_MAX ||
            filters.availability !== "inStock" ||
            filters.cartridgeOnly ||
            filters.tradable) && (
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <span className="text-sm text-gray-700 font-medium">
                Active filters:
              </span>

              {filters.platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => handlePlatformChange(platform, false)}
                  className="bg-funBlue text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-600"
                >
                  {platform}
                  <span className="text-xs">✕</span>
                </button>
              ))}

              {filters.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category, false)}
                  className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-600"
                >
                  {category}
                  <span className="text-xs">✕</span>
                </button>
              ))}

              {(filters.priceRange.min !== PRICE_MIN ||
                filters.priceRange.max !== PRICE_MAX) && (
                <button
                  onClick={() => {
                    setLocalPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
                    handlePriceRangeCommit(PRICE_MIN, PRICE_MAX);
                  }}
                  className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-600"
                >
                  ₱{filters.priceRange.min.toLocaleString()} - ₱
                  {filters.priceRange.max.toLocaleString()}
                  <span className="text-xs">✕</span>
                </button>
              )}

              {filters.availability !== "inStock" && (
                <button
                  onClick={() => handleAvailabilityChange("inStock")}
                  className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-orange-600"
                >
                  {filters.availability === "all"
                    ? "All Items"
                    : filters.availability === "outOfStock"
                      ? "Out of Stock"
                      : "On Sale"}
                  <span className="text-xs">✕</span>
                </button>
              )}

              {filters.cartridgeOnly && (
                <button
                  onClick={() => handleCartridgeOnlyChange(false)}
                  className="bg-teal-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-teal-600"
                >
                  Cartridge Only
                  <span className="text-xs">✕</span>
                </button>
              )}

              {filters.tradable && (
                <button
                  onClick={() => handleTradableChange(false)}
                  className="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-indigo-600"
                >
                  Open for Trades
                  <span className="text-xs">✕</span>
                </button>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside
              className={`lg:w-72 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              {/* Mobile Backdrop */}
              {showFilters && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
              )}

              {/* Sidebar - Slides from left on mobile */}
              <div
                className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 lg:w-72 bg-white z-50 lg:z-0 transform transition-transform duration-300 lg:transform-none overflow-y-auto ${
                  showFilters
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                }`}
              >
                <div className="p-6 lg:sticky lg:top-24">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Filters</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-funBlue hover:underline"
                      >
                        Clear All
                      </button>
                      {/* Mobile close button */}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Platform Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-bold mb-3 text-gray-800">Platform</h3>
                    <div className="space-y-2">
                      {PLATFORMS.map((platform) => (
                        <label
                          key={platform}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={filters.platforms.includes(platform)}
                            onChange={(e) =>
                              handlePlatformChange(platform, e.target.checked)
                            }
                            className="rounded border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                          />
                          <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                            {platform}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-bold mb-3 text-gray-800">Category</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                      {CATEGORIES.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={(e) =>
                              handleCategoryChange(category, e.target.checked)
                            }
                            className="rounded border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                          />
                          <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                            {category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-bold mb-3 text-gray-800">
                      Price Range
                    </h3>
                    <div className="space-y-4">
                      {/* Price Display */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-500 mb-1">
                            Min
                          </span>
                          <span className="text-lg font-bold text-funBlue">
                            ₱{localPriceRange.min.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="h-px bg-gray-300"></div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 mb-1">
                            Max
                          </span>
                          <span className="text-lg font-bold text-funBlue">
                            ₱{localPriceRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Dual Range Slider */}
                      <div className="relative py-2">
                        {/* Track */}
                        <div className="h-2 bg-gray-200 rounded-full"></div>

                        {/* Active Range */}
                        <div
                          className="absolute top-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-150"
                          style={{
                            left: `${priceRangePercentages.minPercent}%`,
                            width: `${priceRangePercentages.widthPercent}%`,
                          }}
                        ></div>

                        {/* Min Slider */}
                        <input
                          type="range"
                          min={PRICE_MIN}
                          max={localPriceRange.max}
                          value={localPriceRange.min}
                          onChange={(e) => {
                            const newMin = Math.min(
                              Number(e.target.value),
                              localPriceRange.max,
                            );
                            handlePriceRangeLocalChange(
                              newMin,
                              localPriceRange.max,
                            );
                          }}
                          onMouseUp={(e) => {
                            handlePriceRangeCommit(
                              localPriceRange.min,
                              localPriceRange.max,
                            );
                          }}
                          onTouchEnd={(e) => {
                            handlePriceRangeCommit(
                              localPriceRange.min,
                              localPriceRange.max,
                            );
                          }}
                          className="absolute top-2 w-full h-2 bg-transparent appearance-none cursor-pointer"
                          style={{ zIndex: 2 }}
                        />

                        {/* Max Slider */}
                        <input
                          type="range"
                          min={localPriceRange.min}
                          max={PRICE_MAX}
                          value={localPriceRange.max}
                          onChange={(e) => {
                            const newMax = Math.max(
                              Number(e.target.value),
                              localPriceRange.min,
                            );
                            handlePriceRangeLocalChange(
                              localPriceRange.min,
                              newMax,
                            );
                          }}
                          onMouseUp={(e) => {
                            handlePriceRangeCommit(
                              localPriceRange.min,
                              localPriceRange.max,
                            );
                          }}
                          onTouchEnd={(e) => {
                            handlePriceRangeCommit(
                              localPriceRange.min,
                              localPriceRange.max,
                            );
                          }}
                          className="absolute top-2 w-full h-2 bg-transparent appearance-none cursor-pointer"
                          style={{ zIndex: 3 }}
                        />
                      </div>

                      {/* Price Range Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>₱{PRICE_MIN.toLocaleString()}</span>
                        <span className="text-gray-400">
                          {localPriceRange.min === PRICE_MIN &&
                          localPriceRange.max === PRICE_MAX
                            ? "All prices"
                            : `${priceRangePercentages.rangePercent.toFixed(0)}% range`}
                        </span>
                        <span>₱{PRICE_MAX.toLocaleString()}</span>
                      </div>

                      {/* Reset Button */}
                      {(filters.priceRange.min !== PRICE_MIN ||
                        filters.priceRange.max !== PRICE_MAX) && (
                        <button
                          onClick={() => {
                            setLocalPriceRange({
                              min: PRICE_MIN,
                              max: PRICE_MAX,
                            });
                            handlePriceRangeCommit(PRICE_MIN, PRICE_MAX);
                          }}
                          className="text-sm text-funBlue hover:underline font-semibold transition-colors"
                        >
                          Reset to All Prices
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-bold mb-3 text-gray-800">
                      Availability
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="availability"
                          checked={filters.availability === "all"}
                          onChange={() => handleAvailabilityChange("all")}
                          className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          All Items
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="availability"
                          checked={filters.availability === "inStock"}
                          onChange={() => handleAvailabilityChange("inStock")}
                          className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          In Stock Only
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="availability"
                          checked={filters.availability === "outOfStock"}
                          onChange={() =>
                            handleAvailabilityChange("outOfStock")
                          }
                          className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          Out of Stock
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="availability"
                          checked={filters.availability === "onSale"}
                          onChange={() => handleAvailabilityChange("onSale")}
                          className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors font-semibold">
                          🏷️ On Sale
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Cartridge Only & Tradable Filters */}
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-bold mb-3 text-gray-800">Options</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.cartridgeOnly}
                          onChange={(e) =>
                            handleCartridgeOnlyChange(e.target.checked)
                          }
                          className="rounded border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          Cartridge Only Available
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.tradable}
                          onChange={(e) =>
                            handleTradableChange(e.target.checked)
                          }
                          className="rounded border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          Open for Trades
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-800">Sort By</h3>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent text-black"
                    >
                      <option value="newest">Newest First</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                      <option value="nameAsc">Name: A-Z</option>
                      <option value="nameDesc">Name: Z-A</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <p className="text-gray-700">
                  {totalGames > 0 ? (
                    <>
                      Loaded{" "}
                      <span className="font-bold text-gray-900">
                        {games.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-900">
                        {totalGames}
                      </span>{" "}
                      games
                      {hasMore && (
                        <span className="text-gray-500 text-sm ml-2">
                          (scroll for more)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-bold text-gray-900">
                        {filteredAndSortedGames.length}
                      </span>{" "}
                      games
                    </>
                  )}
                </p>

                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden bg-funBlue text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 xl:gap-6 min-h-[600px]">
                  {[...Array(itemsPerPage)].map((_, i) => (
                    <GameCardSkeleton key={`skeleton-${i}`} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
                    <svg
                      className="w-12 h-12 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-600 font-semibold mb-4">{error}</p>
                  <button
                    onClick={() => loadGames(1, true)}
                    className="bg-funBlue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Games Grid */}
              {!isLoading && !error && (
                <>
                  {filteredAndSortedGames.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-xl text-gray-800 font-semibold mb-2">
                        No games found
                      </p>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters or search criteria
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="text-funBlue hover:underline font-semibold"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 xl:gap-6 min-h-[600px] transition-all duration-300 ease-in-out">
                        {filteredAndSortedGames.map((game, index) => {
                          const isLastElement =
                            index === filteredAndSortedGames.length - 1;
                          return (
                            <div
                              key={game.gameBarcode}
                              ref={isLastElement ? lastElementRef : null}
                              className="opacity-0 animate-fade-in"
                              style={{
                                animationDelay: `${Math.min(index * 30, 200)}ms`,
                                animationFillMode: "forwards",
                              }}
                            >
                              <GameCard
                                game={game}
                                isInCart={isInCart(game.gameBarcode)}
                                isInCompare={isInCompare(game.gameBarcode)}
                                onAddToCart={() => handleAddToCart(game)}
                                onAddToCompare={() => handleAddToCompare(game)}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Loading More Indicator */}
                      {isLoadingMore && (
                        <div className="mt-8 flex justify-center">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 xl:gap-6 w-full">
                            {[...Array(4)].map((_, i) => (
                              <GameCardSkeleton key={`loading-more-${i}`} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* End of Results */}
                      {!hasMore && filteredAndSortedGames.length > 0 && (
                        <div className="mt-8 text-center py-6">
                          <p className="text-gray-500 text-sm">
                            You've reached the end of the results
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Compare Bar */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-funBlue to-blue-500 text-white p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-bold text-lg">
                {compareItems.length} game(s) selected for comparison
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCompareItems([])}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 font-semibold transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                disabled={compareItems.length < 2}
                className="px-6 py-2 bg-white text-funBlue font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Compare Now ({compareItems.length}/2)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        games={games.filter((g) => compareItems.includes(g.gameBarcode))}
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        onAddToCart={handleAddToCart}
        cartItems={cart.items.map((item) => item.gameBarcode)}
      />

      {/* Cart Type Selection Modal */}
      <CartTypeModal />

      <Footer />
    </main>
  );
};

const GamesPage = () => {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <Navigation />
          <div className="pt-32 pb-16 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-gray-200 rounded-2xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <GamesPageContent />
    </Suspense>
  );
};

export default GamesPage;
