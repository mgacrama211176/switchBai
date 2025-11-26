import { useEffect, useState, useCallback } from "react";
import { Game } from "@/app/types/games";
import { formatPrice } from "@/lib/game-utils";
import Image from "next/image";
import { HiPencil, HiTrash, HiSearch, HiRefresh } from "react-icons/hi";
import EditGameModal from "./EditGameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface GamesTableProps {
  refreshTrigger: number;
  onGameUpdated: () => void;
  onGameDeleted: () => void;
  activeFilter?: "inStock" | "outOfStock" | "rental" | null;
  onFilterClear?: () => void;
}

export default function GamesTable({
  refreshTrigger,
  onGameUpdated,
  onGameDeleted,
  activeFilter,
  onFilterClear,
}: GamesTableProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockSort, setStockSort] = useState<"asc" | "desc" | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchGames = useCallback(
    async (pageNum: number, isNewSearch: boolean = false) => {
      if (isNewSearch) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10", // Batch size of 10
          search: searchTerm,
          platform: platformFilter,
          category: categoryFilter,
        });

        if (activeFilter === "inStock") params.append("inStock", "true");
        if (activeFilter === "outOfStock") params.append("outOfStock", "true");
        if (activeFilter === "rental") params.append("rental", "true");

        if (stockSort) {
          params.append("sort", "gameAvailableStocks");
          params.append("order", stockSort);
        }

        const response = await fetch(`/api/games?${params.toString()}`);
        const data = await response.json();

        if (data.games) {
          setGames((prev) => {
            if (isNewSearch) return data.games;
            // Filter out duplicates
            const newGames = data.games.filter(
              (newGame: Game) => !prev.some((g) => g._id === newGame._id),
            );
            return [...prev, ...newGames];
          });
          setHasMore(data.games.length === 10);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setToast({ message: "Failed to fetch games", type: "error" });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchTerm, platformFilter, categoryFilter, stockSort, activeFilter],
  );

  // Initial fetch and refresh
  useEffect(() => {
    setPage(1);
    fetchGames(1, true);
  }, [refreshTrigger, fetchGames]);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGames(nextPage, false);
  }, [page, fetchGames]);

  const lastGameRef = useInfiniteScroll({
    isLoading: isLoading || isLoadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
  });

  // Hardcoded categories for filter (since we don't fetch all games at once anymore)
  const categories = [
    "Action",
    "Adventure",
    "RPG",
    "Strategy",
    "Sports",
    "Racing",
    "Fighting",
    "Shooter",
    "Puzzle",
    "Simulation",
    "Family",
    "Music",
  ];

  function handleEditSuccess() {
    setEditingGame(null);
    setToast({ message: "Game updated successfully!", type: "success" });
    onGameUpdated();
  }

  function handleDeleteSuccess() {
    setDeletingGame(null);
    setToast({ message: "Game deleted successfully!", type: "success" });
    onGameDeleted();
  }

  async function handleMigrateStocks() {
    if (
      !confirm(
        "This will migrate all games to the new stock schema and fix any stock inconsistencies. Continue?",
      )
    ) {
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch("/api/admin/migrate-stocks", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Migration failed");
      }

      setToast({
        message: `Migration complete! Migrated: ${data.summary.migrated}, Fixed: ${data.summary.fixed}, Already correct: ${data.summary.alreadyCorrect}`,
        type: "success",
      });

      // Refresh games list
      onGameUpdated();
    } catch (error) {
      console.error("Migration error:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to run migration",
        type: "error",
      });
    } finally {
      setIsMigrating(false);
    }
  }

  return (
    <div className="space-y-6 text-black">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingGame && (
        <DeleteConfirmModal
          game={deletingGame}
          onClose={() => setDeletingGame(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative text-black">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFilterClear?.();
            }}
            placeholder="Search by title or barcode..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
          />
        </div>

        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => {
            setPlatformFilter(e.target.value);
            onFilterClear?.();
          }}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
        >
          <option value="">All Platforms</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
          <option value="Nintendo Switch 2">Nintendo Switch 2</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            onFilterClear?.();
          }}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Stock Sort */}
        <select
          value={stockSort || ""}
          onChange={(e) => {
            setStockSort(
              e.target.value === "" ? null : (e.target.value as "asc" | "desc"),
            );
            onFilterClear?.();
          }}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
        >
          <option value="">No Sort</option>
          <option value="asc">Stock: Low to High</option>
          <option value="desc">Stock: High to Low</option>
        </select>
      </div>

      {/* Results Count and Migration */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {games.length > 0
            ? `Showing ${games.length} games`
            : "No games found"}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleMigrateStocks}
            disabled={isMigrating}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <HiRefresh
              className={`w-4 h-4 ${isMigrating ? "animate-spin" : ""}`}
            />
            {isMigrating ? "Migrating..." : "Migrate Stocks"}
          </button>
          {(searchTerm ||
            platformFilter ||
            categoryFilter ||
            stockSort ||
            activeFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setPlatformFilter("");
                setCategoryFilter("");
                setStockSort(null);
                onFilterClear?.();
              }}
              className="text-sm text-funBlue hover:text-funBlue/80 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tradable
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {games.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <p className="text-gray-500 text-lg">No games found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your filters or search term
                  </p>
                </td>
              </tr>
            ) : (
              games.map((game, index) => {
                const isLastElement = index === games.length - 1;
                return (
                  <tr
                    key={game.gameBarcode}
                    ref={isLastElement ? lastGameRef : null}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={game.gameImageURL}
                          alt={game.gameTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {game.gameTitle}
                          </p>
                          {game.isOnSale && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white">
                              🏷️ Sale
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {game.gameBarcode}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {game.isOnSale && game.salePrice ? (
                          <>
                            <p className="font-semibold text-red-600">
                              {formatPrice(game.salePrice)}
                            </p>
                            <p className="text-xs text-gray-500 line-through">
                              {formatPrice(game.gamePrice)}
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {formatPrice(game.gamePrice)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start space-y-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            game.gameAvailableStocks === 0
                              ? "bg-red-100 text-red-700"
                              : game.gameAvailableStocks < 5
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {game.gameAvailableStocks}
                        </span>
                        {(game.stockWithCase !== undefined ||
                          game.stockCartridgeOnly !== undefined) && (
                          <span className="text-xs text-gray-500">
                            WC: {game.stockWithCase ?? 0} | CO:{" "}
                            {game.stockCartridgeOnly ?? 0}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {game.gameCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        {Array.isArray(game.gamePlatform) ? (
                          game.gamePlatform.map((platform) => (
                            <span
                              key={platform}
                              className="text-xs px-2 py-1 bg-funBlue/10 text-funBlue rounded"
                            >
                              {platform.replace("Nintendo ", "")}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs px-2 py-1 bg-funBlue/10 text-funBlue rounded">
                            {game.gamePlatform.replace("Nintendo ", "")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          game.tradable
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {game.tradable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingGame(game)}
                          className="p-2 rounded-lg text-funBlue hover:bg-funBlue/10 transition-colors duration-300"
                          title="Edit"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingGame(game)}
                          className="p-2 rounded-lg text-lameRed hover:bg-lameRed/10 transition-colors duration-300"
                          title="Delete"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Loading Indicator */}
      {(isLoading || isLoadingMore) && (
        <div className="p-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-funBlue"></div>
        </div>
      )}
    </div>
  );
}
