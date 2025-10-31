"use client";

import { useEffect, useState } from "react";
import { Game } from "@/app/types/games";
import { formatPrice } from "@/lib/game-utils";
import Image from "next/image";
import {
  HiPencil,
  HiTrash,
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import EditGameModal from "./EditGameModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "./Toast";

interface GamesTableProps {
  refreshTrigger: number;
  onGameUpdated: () => void;
  onGameDeleted: () => void;
}

export default function GamesTable({
  refreshTrigger,
  onGameUpdated,
  onGameDeleted,
}: GamesTableProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data.games || []);
        setFilteredGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setToast({ message: "Failed to fetch games", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...games];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.includes(searchLower),
      );
    }

    // Platform filter
    if (platformFilter) {
      filtered = filtered.filter((game) => {
        if (Array.isArray(game.gamePlatform)) {
          return game.gamePlatform.includes(platformFilter);
        }
        return game.gamePlatform === platformFilter;
      });
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(
        (game) => game.gameCategory === categoryFilter,
      );
    }

    setFilteredGames(filtered);
    setCurrentPage(1);
  }, [searchTerm, platformFilter, categoryFilter, games]);

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  const categories = Array.from(new Set(games.map((g) => g.gameCategory)));

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative text-black">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 " />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or barcode..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
          />
        </div>

        {/* Platform Filter */}
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
        >
          <option value="">All Platforms</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
          <option value="Nintendo Switch 2">Nintendo Switch 2</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-funBlue focus:ring-2 focus:ring-funBlue/20 outline-none transition-all duration-300"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredGames.length)} of{" "}
          {filteredGames.length} games
        </p>
        {(searchTerm || platformFilter || categoryFilter) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setPlatformFilter("");
              setCategoryFilter("");
            }}
            className="text-sm text-funBlue hover:text-funBlue/80 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {currentGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No games found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : (
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
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGames.map((game) => (
                <tr
                  key={game.gameBarcode}
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
                      <p className="font-semibold text-gray-900">
                        {game.gameTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {game.gameBarcode}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(game.gamePrice)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
