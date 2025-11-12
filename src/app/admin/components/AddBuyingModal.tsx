"use client";

import { useState, useEffect, useRef } from "react";
import { HiX, HiPlus, HiTrash, HiSearch } from "react-icons/hi";
import { Game, BuyingGame } from "@/app/types/games";
import Toast from "./Toast";

interface BuyingGameRow {
  gameBarcode: string;
  gameTitle: string;
  sellingPrice: number;
  quantity: number;
  expectedRevenue: number;
  isNewGame: boolean;
  existingGameId?: string;
  currentStock?: number;
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

interface GameSearchState {
  searchTerm: string;
  isOpen: boolean;
  selectedIndex: number;
}

interface AddBuyingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

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

const RATINGS = ["E", "E10+", "T", "M", "AO", "RP"];
const PLATFORMS = ["Nintendo Switch", "Nintendo Switch 2"];

export default function AddBuyingModal({
  onClose,
  onSuccess,
}: AddBuyingModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Supplier fields
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierNotes, setSupplierNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">(
    "pending",
  );

  // Game rows
  const [gameRows, setGameRows] = useState<BuyingGameRow[]>([]);
  const [gameSearchStates, setGameSearchStates] = useState<
    Record<number, GameSearchState>
  >({});
  const [debouncedSearchTerms, setDebouncedSearchTerms] = useState<
    Record<number, string>
  >({});
  const [newGameForms, setNewGameForms] = useState<
    Record<number, BuyingGameRow["newGameDetails"]>
  >({});
  const searchInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const searchResultsRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const debounceTimeouts = useRef<Record<number, NodeJS.Timeout>>({});

  // Financial
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    async function fetchGames() {
      setIsLoadingGames(true);
      try {
        const response = await fetch("/api/games");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setToast({ message: "Failed to fetch games", type: "error" });
      } finally {
        setIsLoadingGames(false);
      }
    }

    fetchGames();
  }, []);

  // Add initial game row
  useEffect(() => {
    if (games.length > 0 && gameRows.length === 0) {
      setGameRows([
        {
          gameBarcode: "",
          gameTitle: "",
          sellingPrice: 0,
          quantity: 1,
          expectedRevenue: 0,
          isNewGame: false,
        },
      ]);
    }
  }, [games.length, gameRows.length]);

  function addGameRow() {
    setGameRows([
      ...gameRows,
      {
        gameBarcode: "",
        gameTitle: "",
        sellingPrice: 0,
        quantity: 1,
        expectedRevenue: 0,
        isNewGame: false,
      },
    ]);
  }

  function removeGameRow(index: number) {
    setGameRows(gameRows.filter((_, i) => i !== index));
    // Clean up search states
    const newSearchStates = { ...gameSearchStates };
    delete newSearchStates[index];
    setGameSearchStates(newSearchStates);
    const newDebounced = { ...debouncedSearchTerms };
    delete newDebounced[index];
    setDebouncedSearchTerms(newDebounced);
  }

  function updateGameRow(index: number, updates: Partial<BuyingGameRow>) {
    const newRows = [...gameRows];
    newRows[index] = { ...newRows[index], ...updates };
    
    // Recalculate expected revenue
    if (updates.sellingPrice !== undefined || updates.quantity !== undefined) {
      const row = newRows[index];
      newRows[index].expectedRevenue = row.sellingPrice * row.quantity;
    }
    
    setGameRows(newRows);
    calculateTotals(newRows);
  }

  function toggleGameMode(index: number) {
    const newRows = [...gameRows];
    newRows[index].isNewGame = !newRows[index].isNewGame;
    
    if (newRows[index].isNewGame) {
      // Switch to new game: clear existing game data
      newRows[index].gameBarcode = "";
      newRows[index].gameTitle = "";
      newRows[index].existingGameId = undefined;
      newRows[index].currentStock = undefined;
      newRows[index].sellingPrice = 0;
      newRows[index].newGameDetails = {
        gamePlatform: [],
        gameRatings: "",
        gameDescription: "",
        gameImageURL: "",
        gameCategory: "",
        gameReleaseDate: "",
        tradable: true,
        rentalAvailable: false,
      };
    } else {
      // Switch to existing: clear new game data
      newRows[index].newGameDetails = undefined;
      newRows[index].gameBarcode = "";
      newRows[index].gameTitle = "";
      newRows[index].sellingPrice = 0;
    }
    
    setGameRows(newRows);
  }

  function handleExistingGameSelect(index: number, game: Game) {
    updateGameRow(index, {
      gameBarcode: game.gameBarcode,
      gameTitle: game.gameTitle,
      sellingPrice: game.isOnSale ? game.salePrice! : game.gamePrice,
      existingGameId: game._id,
      currentStock: game.gameAvailableStocks,
      isNewGame: false,
    });
    // Close search dropdown
    setGameSearchStates((prev) => ({
      ...prev,
      [index]: { searchTerm: "", isOpen: false, selectedIndex: 0 },
    }));
    setDebouncedSearchTerms((prev) => ({
      ...prev,
      [index]: "",
    }));
    if (debounceTimeouts.current[index]) {
      clearTimeout(debounceTimeouts.current[index]);
    }
  }

  function getFilteredGames(index: number): Game[] {
    const searchTerm = debouncedSearchTerms[index] || "";
    if (!searchTerm.trim()) {
      return games.slice(0, 10);
    }

    const searchLower = searchTerm.toLowerCase();
    return games
      .filter(
        (game) =>
          game.gameTitle.toLowerCase().includes(searchLower) ||
          game.gameBarcode.toLowerCase().includes(searchLower),
      )
      .slice(0, 10);
  }

  function handleSearchChange(index: number, value: string) {
    setGameSearchStates((prev) => ({
      ...prev,
      [index]: {
        searchTerm: value,
        isOpen: true,
        selectedIndex: 0,
      },
    }));

    if (debounceTimeouts.current[index]) {
      clearTimeout(debounceTimeouts.current[index]);
    }

    debounceTimeouts.current[index] = setTimeout(() => {
      setDebouncedSearchTerms((prev) => ({
        ...prev,
        [index]: value,
      }));
    }, 300);
  }

  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      Object.keys(searchResultsRefs.current).forEach((key) => {
        const index = parseInt(key);
        const ref = searchResultsRefs.current[index];
        const inputRef = searchInputRefs.current[index];

        if (
          ref &&
          inputRef &&
          !ref.contains(event.target as Node) &&
          !inputRef.contains(event.target as Node)
        ) {
          setGameSearchStates((prev) => ({
            ...prev,
            [index]: { ...prev[index], isOpen: false },
          }));
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function calculateTotals(rows?: BuyingGameRow[]) {
    const currentRows = rows || gameRows;
    // This will be called from useEffect when totalCost or gameRows change
  }

  useEffect(() => {
    calculateTotals();
  }, [gameRows, totalCost]);

  const totalExpectedRevenue = gameRows.reduce(
    (sum, row) => sum + row.expectedRevenue,
    0,
  );
  const totalExpectedProfit = totalExpectedRevenue - totalCost;
  const profitMargin =
    totalExpectedRevenue > 0
      ? (totalExpectedProfit / totalExpectedRevenue) * 100
      : 0;

  function validateForm(): string | null {
    if (gameRows.length === 0) return "At least one game is required";

    for (let i = 0; i < gameRows.length; i++) {
      const row = gameRows[i];
      
      if (!row.gameBarcode) {
        return `Game ${i + 1}: Barcode is required`;
      }
      
      if (!row.gameTitle) {
        return `Game ${i + 1}: Title is required`;
      }
      
      if (!row.sellingPrice || row.sellingPrice <= 0) {
        return `Game ${i + 1}: Selling price must be greater than 0`;
      }
      
      if (!row.quantity || row.quantity <= 0) {
        return `Game ${i + 1}: Quantity must be greater than 0`;
      }

      if (row.isNewGame) {
        if (!row.newGameDetails) {
          return `Game ${i + 1}: New game details are required`;
        }
        const details = row.newGameDetails;
        if (
          !details.gamePlatform ||
          (Array.isArray(details.gamePlatform) && details.gamePlatform.length === 0) ||
          !details.gameRatings ||
          !details.gameDescription ||
          !details.gameImageURL ||
          !details.gameCategory ||
          !details.gameReleaseDate
        ) {
          return `Game ${i + 1}: All new game fields are required`;
        }
      }
    }

    if (!totalCost || totalCost <= 0) {
      return "Total cost must be greater than 0";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const purchaseData = {
        supplierName: supplierName.trim() || undefined,
        supplierContact: supplierContact.trim() || undefined,
        supplierNotes: supplierNotes.trim() || undefined,
        games: gameRows.map((row) => ({
          gameBarcode: row.gameBarcode,
          gameTitle: row.gameTitle,
          sellingPrice: row.sellingPrice,
          quantity: row.quantity,
          isNewGame: row.isNewGame,
          newGameDetails: row.isNewGame ? row.newGameDetails : undefined,
        })),
        totalCost,
        status,
        adminNotes: adminNotes.trim() || undefined,
      };

      const response = await fetch("/api/buying", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create purchase");
      }

      setToast({ message: "Purchase created successfully!", type: "success" });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error creating purchase:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to create purchase",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Add Purchase</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplier Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Supplier Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Games Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Games</h3>
              <button
                type="button"
                onClick={addGameRow}
                className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
                <span>Add Game</span>
              </button>
            </div>

            {isLoadingGames ? (
              <div className="text-center py-8 text-gray-500">
                Loading games...
              </div>
            ) : (
              <div className="space-y-4">
                {gameRows.map((row, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-700">
                        Game {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (row.isNewGame) toggleGameMode(index);
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              !row.isNewGame
                                ? "bg-funBlue text-white"
                                : "text-gray-600"
                            }`}
                          >
                            Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!row.isNewGame) toggleGameMode(index);
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              row.isNewGame
                                ? "bg-funBlue text-white"
                                : "text-gray-600"
                            }`}
                          >
                            New
                          </button>
                        </div>
                        {gameRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGameRow(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {!row.isNewGame ? (
                      /* Existing Game Mode */
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Game <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              ref={(el) => {
                                searchInputRefs.current[index] = el;
                              }}
                              type="text"
                              value={
                                row.gameBarcode
                                  ? row.gameTitle
                                  : gameSearchStates[index]?.searchTerm || ""
                              }
                              onChange={(e) => {
                                if (!row.gameBarcode) {
                                  handleSearchChange(index, e.target.value);
                                }
                              }}
                              onFocus={() => {
                                if (!row.gameBarcode) {
                                  setGameSearchStates((prev) => ({
                                    ...prev,
                                    [index]: {
                                      searchTerm: prev[index]?.searchTerm || "",
                                      isOpen: true,
                                      selectedIndex: 0,
                                    },
                                  }));
                                }
                              }}
                              placeholder="Search by title or barcode..."
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                            {gameSearchStates[index]?.isOpen &&
                              !row.gameBarcode && (
                                <div
                                  ref={(el) => {
                                    searchResultsRefs.current[index] = el;
                                  }}
                                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {getFilteredGames(index).length === 0 ? (
                                    <div className="p-4 text-sm text-gray-500">
                                      No games found
                                    </div>
                                  ) : (
                                    getFilteredGames(index).map((game, idx) => (
                                      <button
                                        key={game._id}
                                        type="button"
                                        onClick={() =>
                                          handleExistingGameSelect(index, game)
                                        }
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                                          idx ===
                                          gameSearchStates[index]
                                            ?.selectedIndex
                                            ? "bg-gray-100"
                                            : ""
                                        }`}
                                      >
                                        <div className="font-medium">
                                          {game.gameTitle}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {game.gameBarcode}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          Stock: {game.gameAvailableStocks} | ₱
                                          {game.isOnSale && game.salePrice
                                            ? game.salePrice.toLocaleString()
                                            : game.gamePrice.toLocaleString()}
                                        </div>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {row.gameBarcode && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Stock
                              </label>
                              <input
                                type="text"
                                value={row.currentStock || 0}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selling Price <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={row.sellingPrice || ""}
                                onChange={(e) =>
                                  updateGameRow(index, {
                                    sellingPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                min="0"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={row.quantity || ""}
                                onChange={(e) =>
                                  updateGameRow(index, {
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                                min="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                  Expected Revenue:{" "}
                                  <span className="font-semibold text-gray-900">
                                    ₱{row.expectedRevenue.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* New Game Mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Barcode <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={row.gameBarcode}
                              onChange={(e) =>
                                updateGameRow(index, {
                                  gameBarcode: e.target.value,
                                })
                              }
                              placeholder="10-13 digits"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={row.gameTitle}
                              onChange={(e) =>
                                updateGameRow(index, {
                                  gameTitle: e.target.value,
                                })
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Platform <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={
                                Array.isArray(row.newGameDetails?.gamePlatform)
                                  ? row.newGameDetails.gamePlatform[0] || ""
                                  : row.newGameDetails?.gamePlatform || ""
                              }
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gamePlatform = [e.target.value];
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            >
                              <option value="">Select platform</option>
                              {PLATFORMS.map((platform) => (
                                <option key={platform} value={platform}>
                                  {platform}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ratings <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={row.newGameDetails?.gameRatings || ""}
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gameRatings = e.target.value;
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            >
                              <option value="">Select rating</option>
                              {RATINGS.map((rating) => (
                                <option key={rating} value={rating}>
                                  {rating}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={row.newGameDetails?.gameDescription || ""}
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gameDescription = e.target.value;
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              rows={3}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Image URL <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="url"
                              value={row.newGameDetails?.gameImageURL || ""}
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gameImageURL = e.target.value;
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={row.newGameDetails?.gameCategory || ""}
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gameCategory = e.target.value;
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              list={`categories-${index}`}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                            <datalist id={`categories-${index}`}>
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} />
                              ))}
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Release Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={row.newGameDetails?.gameReleaseDate || ""}
                              onChange={(e) => {
                                const forms = { ...newGameForms };
                                if (!forms[index]) {
                                  forms[index] = {
                                    gamePlatform: [],
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                }
                                forms[index].gameReleaseDate = e.target.value;
                                setNewGameForms(forms);
                                updateGameRow(index, {
                                  newGameDetails: forms[index],
                                });
                              }}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Selling Price <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={row.sellingPrice || ""}
                              onChange={(e) =>
                                updateGameRow(index, {
                                  sellingPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              min="0"
                              step="0.01"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={row.quantity || ""}
                              onChange={(e) =>
                                updateGameRow(index, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                              min="1"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm text-gray-600">
                                Expected Revenue:{" "}
                                <span className="font-semibold text-gray-900">
                                  ₱{row.expectedRevenue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Expected Revenue
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  ₱{totalExpectedRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost (What you paid) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalCost || ""}
                  onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent text-lg font-semibold"
                />
              </div>
              <div className="md:col-span-2 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-700">
                    Total Expected Profit:
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      totalExpectedProfit > 0
                        ? "text-green-600"
                        : totalExpectedProfit === 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {totalExpectedProfit >= 0 ? "+" : ""}
                    ₱{totalExpectedProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit Margin:</span>
                  <span
                    className={`text-lg font-semibold ${
                      profitMargin > 0
                        ? "text-green-600"
                        : profitMargin === 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                {totalExpectedProfit > 0 && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <span className="text-green-800 font-medium">
                      ✅ Profitable Purchase
                    </span>
                  </div>
                )}
                {totalExpectedProfit < 0 && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <span className="text-red-800 font-medium">
                      ⚠️ Loss: You're paying more than expected revenue
                    </span>
                  </div>
                )}
                {totalExpectedProfit === 0 && (
                  <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-800 font-medium">
                      ⚖️ Break Even
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "pending" | "completed" | "cancelled",
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Stock will be updated when status is set to "Completed"
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Purchase"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

