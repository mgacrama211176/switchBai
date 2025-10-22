"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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

const PLATFORMS = ["Nintendo Switch", "Nintendo Switch 2"];

const PRICE_RANGES = [
  { label: "Under ₱1,000", min: 0, max: 999, value: "0-999" },
  { label: "₱1,000 - ₱2,000", min: 1000, max: 2000, value: "1000-2000" },
  { label: "₱2,000 - ₱3,000", min: 2000, max: 3000, value: "2000-3000" },
  { label: "₱3,000 - ₱4,000", min: 3000, max: 4000, value: "3000-4000" },
  { label: "Over ₱4,000", min: 4001, max: 99999, value: "4001-99999" },
];

const GamesPageContent = () => {
  // URL params handling
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data state
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (from URL or defaults)
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => Number(searchParams.get("limit")) || 24,
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  // Filter state (from URL or defaults)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    platforms: searchParams.get("platform")?.split(",").filter(Boolean) || [],
    categories: searchParams.get("category")?.split(",").filter(Boolean) || [],
    priceRange: searchParams.get("priceRange") || "", // e.g., "1000-2000"
    availability: (searchParams.get("availability") || "inStock") as
      | "all"
      | "inStock"
      | "outOfStock",
    sortBy: searchParams.get("sort") || "newest",
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false); // Mobile filter drawer
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Load URL params on mount (for shared links)
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get("search") || "",
      platforms: searchParams.get("platform")?.split(",").filter(Boolean) || [],
      categories:
        searchParams.get("category")?.split(",").filter(Boolean) || [],
      priceRange: searchParams.get("priceRange") || "",
      availability: (searchParams.get("availability") || "inStock") as
        | "all"
        | "inStock"
        | "outOfStock",
      sortBy: searchParams.get("sort") || "newest",
    };
    setFilters(urlFilters);
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setItemsPerPage(Number(searchParams.get("limit")) || 24);
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
    if (filters.priceRange) params.set("priceRange", filters.priceRange);
    if (filters.availability !== "inStock")
      params.set("availability", filters.availability);
    if (filters.sortBy !== "newest") params.set("sort", filters.sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 24) params.set("limit", itemsPerPage.toString());

    // Update URL without page reload
    const newUrl = params.toString() ? `?${params.toString()}` : "/games";
    router.push(newUrl, { scroll: false });
  }, [filters, currentPage, itemsPerPage, router]);

  // Fetch games whenever filters or pagination changes
  useEffect(() => {
    loadGames();
  }, [
    currentPage,
    itemsPerPage,
    filters.search,
    filters.platforms,
    filters.categories,
  ]);

  const loadGames = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchGames({
        limit: itemsPerPage,
        page: currentPage,
        platform: filters.platforms.join(","),
        category: filters.categories.join(","),
        search: filters.search, // API searches only titles
      });

      if (response.success && response.data) {
        setGames(response.data.games);
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
    }
  };

  // Apply client-side filters and sorting
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...games];

    // Price range filter (client-side)
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter(
        (g) => g.gamePrice >= min && g.gamePrice <= max,
      );
    }

    // Availability filter (client-side)
    if (filters.availability === "inStock") {
      filtered = filtered.filter((g) => g.gameAvailableStocks > 0);
    } else if (filters.availability === "outOfStock") {
      filtered = filtered.filter((g) => g.gameAvailableStocks === 0);
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
  }, [games, filters.priceRange, filters.availability, filters.sortBy]);

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
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: string) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (
    availability: "all" | "inStock" | "outOfStock",
  ) => {
    setFilters((prev) => ({ ...prev, availability }));
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      platforms: [],
      categories: [],
      priceRange: "",
      availability: "inStock", // Default
      sortBy: "newest",
    });
    setCurrentPage(1);
  };

  // Cart & Compare Handlers (No localStorage)
  const handleAddToCart = (game: Game) => {
    if (game.gameAvailableStocks === 0) return;

    setCartItems((prev) => {
      if (prev.includes(game.gameBarcode)) {
        return prev; // Already in cart
      }
      return [...prev, game.gameBarcode];
    });
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

  const isInCart = (barcode: string): boolean => cartItems.includes(barcode);
  const isInCompare = (barcode: string): boolean =>
    compareItems.includes(barcode);

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
    const savings = calculateSavings(game.gamePrice, game.gameBarcode);

    return (
      <article className="bg-white rounded-2xl overflow-hidden shadow-lg border hover:shadow-xl transition-all duration-300 group">
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

            {/* Savings Badge */}
            {savings.percentage > 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                Save {savings.percentage}%
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
        <div className="p-3 space-y-2">
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onAddToCart}
              disabled={game.gameAvailableStocks === 0}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
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
              className={`w-10 h-10 rounded-xl transition-all ${
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
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-6xl font-black text-gray-900 mb-4 text-center">
            Browse All <span className="text-funBlue">Games</span>
          </h1>
          <p className="text-xl text-gray-700 text-center mb-8">
            Discover {totalGames}+ Nintendo Switch games for rent or purchase
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
            filters.priceRange ||
            filters.availability !== "inStock") && (
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

              {filters.priceRange && (
                <button
                  onClick={() => handlePriceRangeChange("")}
                  className="bg-green-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1 hover:bg-green-600"
                >
                  {
                    PRICE_RANGES.find((r) => r.value === filters.priceRange)
                      ?.label
                  }
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
                    : "Out of Stock"}
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
        <div className="max-w-7xl mx-auto px-8">
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
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={!filters.priceRange}
                          onChange={() => handlePriceRangeChange("")}
                          className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                        />
                        <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                          All Prices
                        </span>
                      </label>
                      {PRICE_RANGES.map((range) => (
                        <label
                          key={range.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange === range.value}
                            onChange={() => handlePriceRangeChange(range.value)}
                            className="border-gray-300 text-funBlue focus:ring-funBlue cursor-pointer"
                          />
                          <span className="text-gray-700 group-hover:text-funBlue transition-colors">
                            {range.label}
                          </span>
                        </label>
                      ))}
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
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <h3 className="font-bold mb-3 text-gray-800">Sort By</h3>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
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
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filteredAndSortedGames.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">{totalGames}</span>{" "}
                  games
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

                  {/* Items per page */}
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue"
                  >
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={48}>48 per page</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    onClick={loadGames}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredAndSortedGames.map((game) => (
                        <GameCard
                          key={game.gameBarcode}
                          game={game}
                          isInCart={isInCart(game.gameBarcode)}
                          isInCompare={isInCompare(game.gameBarcode)}
                          onAddToCart={() => handleAddToCart(game)}
                          onAddToCompare={() => handleAddToCompare(game)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {filteredAndSortedGames.length > 0 && totalPages > 1 && (
                    <div className="mt-12 flex flex-col items-center gap-4 text-black">
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Show first, last, current, and neighbors
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 &&
                                pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                                    currentPage === pageNum
                                      ? "bg-funBlue text-white"
                                      : "border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="px-2 text-gray-500"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                        >
                          Next
                        </button>
                      </div>

                      <p className="text-sm text-gray-700">
                        Page{" "}
                        <span className="font-bold text-gray-900">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-gray-900">
                          {totalPages}
                        </span>{" "}
                        (
                        <span className="font-bold text-gray-900">
                          {totalGames}
                        </span>{" "}
                        total games)
                      </p>
                    </div>
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
        cartItems={cartItems}
      />

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
