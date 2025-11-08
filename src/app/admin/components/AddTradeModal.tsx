"use client";

import { useState, useEffect, useRef } from "react";
import { HiX, HiPlus, HiTrash, HiSearch } from "react-icons/hi";
import { Game } from "@/app/types/games";
import Toast from "./Toast";
import {
  calculateGamesValue,
  calculateTradeCashDifference,
} from "@/lib/trade-utils";

interface GameRowGiven {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
  isNewGame: boolean;
  newGameDetails?: {
    gamePlatform: string | string[];
    gameRatings: string;
    gameDescription: string;
    gameImageURL: string;
    gameCategory: string;
    gameReleaseDate: string;
  };
}

interface GameRowReceived {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
  availableStock: number;
}

interface GameSearchState {
  searchTerm: string;
  isOpen: boolean;
  selectedIndex: number;
}

interface AddTradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTradeModal({
  onClose,
  onSuccess,
}: AddTradeModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFacebookUrl, setCustomerFacebookUrl] = useState("");
  const [tradeLocation, setTradeLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "pending" | "confirmed" | "completed" | "cancelled"
  >("pending");

  // Games given and received
  const [gamesGiven, setGamesGiven] = useState<GameRowGiven[]>([]);
  const [gamesReceived, setGamesReceived] = useState<GameRowReceived[]>([]);

  // Search states for games received
  const [gameSearchStatesReceived, setGameSearchStatesReceived] = useState<
    Record<number, GameSearchState>
  >({});
  const [debouncedSearchTermsReceived, setDebouncedSearchTermsReceived] =
    useState<Record<number, string>>({});

  // Search states for games given
  const [gameSearchStatesGiven, setGameSearchStatesGiven] = useState<
    Record<number, GameSearchState>
  >({});
  const [debouncedSearchTermsGiven, setDebouncedSearchTermsGiven] = useState<
    Record<number, string>
  >({});

  const searchInputRefsReceived = useRef<
    Record<number, HTMLInputElement | null>
  >({});
  const searchResultsRefsReceived = useRef<
    Record<number, HTMLDivElement | null>
  >({});
  const searchInputRefsGiven = useRef<Record<number, HTMLInputElement | null>>(
    {},
  );
  const searchResultsRefsGiven = useRef<Record<number, HTMLDivElement | null>>(
    {},
  );
  const debounceTimeouts = useRef<Record<number, NodeJS.Timeout>>({});

  // New game form state (for games given)
  const [showNewGameForm, setShowNewGameForm] = useState<
    Record<number, boolean>
  >({});
  const [newGameForms, setNewGameForms] = useState<
    Record<
      number,
      {
        gamePlatform: string;
        gameRatings: string;
        gameDescription: string;
        gameImageURL: string;
        gameCategory: string;
        gameReleaseDate: string;
      }
    >
  >({});

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

  // Add initial game rows
  useEffect(() => {
    if (games.length > 0 && gamesGiven.length === 0) {
      setGamesGiven([
        {
          gameBarcode: "",
          gameTitle: "",
          gamePrice: 0,
          quantity: 1,
          isNewGame: false,
        },
      ]);
    }
    if (games.length > 0 && gamesReceived.length === 0) {
      setGamesReceived([
        {
          gameBarcode: "",
          gameTitle: "",
          gamePrice: 0,
          quantity: 1,
          availableStock: 0,
        },
      ]);
    }
  }, [games.length]);

  function addGameGiven() {
    setGamesGiven([
      ...gamesGiven,
      {
        gameBarcode: "",
        gameTitle: "",
        gamePrice: 0,
        quantity: 1,
        isNewGame: false,
      },
    ]);
  }

  function removeGameGiven(index: number) {
    setGamesGiven(gamesGiven.filter((_, i) => i !== index));
    // Clean up new game form if exists
    const newForms = { ...newGameForms };
    delete newForms[index];
    setNewGameForms(newForms);
    const newShow = { ...showNewGameForm };
    delete newShow[index];
    setShowNewGameForm(newShow);
  }

  function updateGameGiven(index: number, updates: Partial<GameRowGiven>) {
    const newGames = [...gamesGiven];
    newGames[index] = { ...newGames[index], ...updates };
    setGamesGiven(newGames);
  }

  function addGameReceived() {
    setGamesReceived([
      ...gamesReceived,
      {
        gameBarcode: "",
        gameTitle: "",
        gamePrice: 0,
        quantity: 1,
        availableStock: 0,
      },
    ]);
  }

  function removeGameReceived(index: number) {
    setGamesReceived(gamesReceived.filter((_, i) => i !== index));
    // Clean up search state
    const newStates = { ...gameSearchStates };
    delete newStates[index];
    setGameSearchStates(newStates);
    const newDebounced = { ...debouncedSearchTerms };
    delete newDebounced[index];
    setDebouncedSearchTerms(newDebounced);
  }

  function updateGameReceived(
    index: number,
    updates: Partial<GameRowReceived>,
  ) {
    const newGames = [...gamesReceived];
    newGames[index] = { ...newGames[index], ...updates };
    setGamesReceived(newGames);
  }

  function handleGameReceivedSelect(index: number, game: Game) {
    updateGameReceived(index, {
      gameBarcode: game.gameBarcode,
      gameTitle: game.gameTitle,
      gamePrice: game.gamePrice,
      availableStock: game.gameAvailableStocks,
      quantity: 1,
    });
    // Close search dropdown
    setGameSearchStatesReceived((prev) => ({
      ...prev,
      [index]: { searchTerm: "", isOpen: false, selectedIndex: 0 },
    }));
    setDebouncedSearchTermsReceived((prev) => ({
      ...prev,
      [index]: "",
    }));
    if (debounceTimeouts.current[index]) {
      clearTimeout(debounceTimeouts.current[index]);
    }
  }

  function handleGameGivenSelect(index: number, game: Game) {
    updateGameGiven(index, {
      gameBarcode: game.gameBarcode,
      gameTitle: game.gameTitle,
      gamePrice: game.gamePrice,
      quantity: 1,
      isNewGame: false,
      newGameDetails: undefined,
    });
    // Close search dropdown
    setGameSearchStatesGiven((prev) => ({
      ...prev,
      [index]: { searchTerm: "", isOpen: false, selectedIndex: 0 },
    }));
    setDebouncedSearchTermsGiven((prev) => ({
      ...prev,
      [index]: "",
    }));
    // Clear new game form for this index
    const forms = { ...newGameForms };
    delete forms[index];
    setNewGameForms(forms);
    if (debounceTimeouts.current[`given-${index}`]) {
      clearTimeout(debounceTimeouts.current[`given-${index}`]);
    }
  }

  function getFilteredGamesReceived(index: number): Game[] {
    const searchTerm = debouncedSearchTermsReceived[index] || "";
    if (!searchTerm.trim()) {
      return games.filter((g) => g.gameAvailableStocks > 0).slice(0, 10);
    }

    const searchLower = searchTerm.toLowerCase();
    return games
      .filter(
        (game) =>
          game.gameAvailableStocks > 0 &&
          (game.gameTitle.toLowerCase().includes(searchLower) ||
            game.gameBarcode.toLowerCase().includes(searchLower)),
      )
      .slice(0, 10);
  }

  function getFilteredGamesGiven(index: number): Game[] {
    const searchTerm = debouncedSearchTermsGiven[index] || "";
    if (!searchTerm.trim()) {
      return games.slice(0, 10); // Show first 10 games when no search
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

  function handleSearchChangeReceived(index: number, value: string) {
    setGameSearchStatesReceived((prev) => ({
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
      setDebouncedSearchTermsReceived((prev) => ({
        ...prev,
        [index]: value,
      }));
    }, 300);
  }

  function handleSearchChangeGiven(index: number, value: string) {
    setGameSearchStatesGiven((prev) => ({
      ...prev,
      [index]: {
        searchTerm: value,
        isOpen: true,
        selectedIndex: 0,
      },
    }));

    const timeoutKey = `given-${index}`;
    if (debounceTimeouts.current[timeoutKey]) {
      clearTimeout(debounceTimeouts.current[timeoutKey]);
    }

    debounceTimeouts.current[timeoutKey] = setTimeout(() => {
      setDebouncedSearchTermsGiven((prev) => ({
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle Games Received dropdowns
      Object.keys(searchResultsRefsReceived.current).forEach((key) => {
        const index = parseInt(key);
        const ref = searchResultsRefsReceived.current[index];
        const inputRef = searchInputRefsReceived.current[index];

        if (
          ref &&
          inputRef &&
          !ref.contains(event.target as Node) &&
          !inputRef.contains(event.target as Node)
        ) {
          setGameSearchStatesReceived((prev) => ({
            ...prev,
            [index]: { ...prev[index], isOpen: false },
          }));
        }
      });

      // Handle Games Given dropdowns
      Object.keys(searchResultsRefsGiven.current).forEach((key) => {
        const index = parseInt(key);
        const ref = searchResultsRefsGiven.current[index];
        const inputRef = searchInputRefsGiven.current[index];

        if (
          ref &&
          inputRef &&
          !ref.contains(event.target as Node) &&
          !inputRef.contains(event.target as Node)
        ) {
          setGameSearchStatesGiven((prev) => ({
            ...prev,
            [index]: { ...prev[index], isOpen: false },
          }));
        }
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function calculateTotalValueGiven() {
    return calculateGamesValue(gamesGiven);
  }

  function calculateTotalValueReceived() {
    return calculateGamesValue(gamesReceived);
  }

  function getTradeCalculations() {
    const valueGiven = calculateTotalValueGiven();
    const valueReceived = calculateTotalValueReceived();
    const { cashDifference, tradeFee, tradeType } =
      calculateTradeCashDifference(valueGiven, valueReceived);

    return {
      valueGiven,
      valueReceived,
      cashDifference,
      tradeFee,
      tradeType,
    };
  }

  function validateForm(): string | null {
    if (!customerName.trim()) return "Customer name is required";

    if (gamesGiven.length === 0) return "At least one game given is required";
    for (let i = 0; i < gamesGiven.length; i++) {
      const game = gamesGiven[i];
      if (!game.gameBarcode || !game.gameTitle) {
        return `Game Given ${i + 1} must be selected or created`;
      }
      if (game.gamePrice <= 0) {
        return `Game Given ${i + 1} must have a valid price`;
      }
      if (game.quantity < 1) {
        return `Game Given ${i + 1} quantity must be at least 1`;
      }
      if (game.isNewGame && !game.newGameDetails) {
        return `Game Given ${i + 1} is marked as new but missing details`;
      }
    }

    if (gamesReceived.length === 0) {
      return "At least one game received is required";
    }
    for (let i = 0; i < gamesReceived.length; i++) {
      const game = gamesReceived[i];
      if (!game.gameBarcode || !game.gameTitle) {
        return `Game Received ${i + 1} must be selected`;
      }
      if (game.quantity > game.availableStock) {
        return `Game Received ${i + 1} quantity exceeds available stock`;
      }
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
      const tradeData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        customerFacebookUrl: customerFacebookUrl.trim() || undefined,
        gamesGiven: gamesGiven.map((game) => ({
          gameBarcode: game.gameBarcode,
          gameTitle: game.gameTitle,
          gamePrice: game.gamePrice,
          quantity: game.quantity,
          isNewGame: game.isNewGame,
          newGameDetails: game.isNewGame ? game.newGameDetails : undefined,
        })),
        gamesReceived: gamesReceived.map((game) => ({
          gameBarcode: game.gameBarcode,
          gameTitle: game.gameTitle,
          gamePrice: game.gamePrice,
          quantity: game.quantity,
        })),
        tradeLocation: tradeLocation.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      };

      const response = await fetch("/api/trades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tradeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create trade");
      }

      setToast({ message: "Trade created successfully!", type: "success" });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error creating trade:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to create trade",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const calculations = getTradeCalculations();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Trade</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={customerFacebookUrl}
                    onChange={(e) => setCustomerFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Games Given Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Games Given (Customer Trading In)
                </h3>
                <button
                  type="button"
                  onClick={addGameGiven}
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
                  {gamesGiven.map((game, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Game {index + 1}
                        </span>
                        {gamesGiven.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGameGiven(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Game <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="relative">
                              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                ref={(el) => {
                                  searchInputRefsGiven.current[index] = el;
                                }}
                                type="text"
                                value={
                                  game.gameBarcode
                                    ? game.gameTitle
                                    : gameSearchStatesGiven[index]
                                        ?.searchTerm || ""
                                }
                                onChange={(e) => {
                                  if (!game.gameBarcode) {
                                    handleSearchChangeGiven(
                                      index,
                                      e.target.value,
                                    );
                                  }
                                }}
                                onFocus={() => {
                                  if (!game.gameBarcode) {
                                    setGameSearchStatesGiven((prev) => ({
                                      ...prev,
                                      [index]: {
                                        searchTerm:
                                          prev[index]?.searchTerm || "",
                                        isOpen: true,
                                        selectedIndex: 0,
                                      },
                                    }));
                                  }
                                }}
                                placeholder={
                                  game.gameBarcode
                                    ? game.gameTitle
                                    : "Search for a game..."
                                }
                                readOnly={!!game.gameBarcode}
                                required={!game.gameBarcode}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                              {game.gameBarcode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateGameGiven(index, {
                                      gameBarcode: "",
                                      gameTitle: "",
                                      gamePrice: 0,
                                      quantity: 1,
                                      isNewGame: false,
                                      newGameDetails: undefined,
                                    });
                                    setGameSearchStatesGiven((prev) => ({
                                      ...prev,
                                      [index]: {
                                        searchTerm: "",
                                        isOpen: false,
                                        selectedIndex: 0,
                                      },
                                    }));
                                    setDebouncedSearchTermsGiven((prev) => ({
                                      ...prev,
                                      [index]: "",
                                    }));
                                    const forms = { ...newGameForms };
                                    delete forms[index];
                                    setNewGameForms(forms);
                                    const timeoutKey = `given-${index}`;
                                    if (debounceTimeouts.current[timeoutKey]) {
                                      clearTimeout(
                                        debounceTimeouts.current[timeoutKey],
                                      );
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <HiX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {gameSearchStatesGiven[index]?.isOpen &&
                              !game.gameBarcode && (
                                <div
                                  ref={(el) => {
                                    searchResultsRefsGiven.current[index] = el;
                                  }}
                                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {getFilteredGamesGiven(index).length > 0 ? (
                                    getFilteredGamesGiven(index).map((g) => (
                                      <button
                                        key={g.gameBarcode}
                                        type="button"
                                        onClick={() =>
                                          handleGameGivenSelect(index, g)
                                        }
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {g.gameTitle}
                                            </div>
                                            <div className="text-sm text-gray-500 font-mono">
                                              {g.gameBarcode}
                                            </div>
                                          </div>
                                          <div className="text-right ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              ₱{g.gamePrice.toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                      No games found
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        {game.gameBarcode && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode
                              </label>
                              <input
                                type="text"
                                value={game.gameBarcode}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={game.gamePrice}
                                onChange={(e) =>
                                  updateGameGiven(index, {
                                    gamePrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={game.quantity}
                                onChange={(e) =>
                                  updateGameGiven(index, {
                                    quantity: parseInt(e.target.value) || 1,
                                  })
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {!game.gameBarcode && (
                        <div className="mt-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={game.isNewGame}
                              onChange={(e) => {
                                const isNew = e.target.checked;
                                updateGameGiven(index, {
                                  isNewGame: isNew,
                                });
                                // Initialize new game form if checked
                                if (isNew && !newGameForms[index]) {
                                  const forms = { ...newGameForms };
                                  forms[index] = {
                                    gamePlatform: "",
                                    gameRatings: "",
                                    gameDescription: "",
                                    gameImageURL: "",
                                    gameCategory: "",
                                    gameReleaseDate: "",
                                  };
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                } else if (!isNew) {
                                  // Clear new game form if unchecked
                                  const forms = { ...newGameForms };
                                  delete forms[index];
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: undefined,
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-funBlue focus:ring-funBlue"
                            />
                            <span className="text-sm text-gray-700">
                              This is a new game (not in our database)
                            </span>
                          </label>
                        </div>
                      )}

                      {!game.gameBarcode && game.isNewGame && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Game Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={game.gameTitle}
                              onChange={(e) =>
                                updateGameGiven(index, {
                                  gameTitle: e.target.value,
                                })
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Barcode <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={game.gameBarcode}
                              onChange={(e) =>
                                updateGameGiven(index, {
                                  gameBarcode: e.target.value,
                                })
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={game.gamePrice}
                              onChange={(e) =>
                                updateGameGiven(index, {
                                  gamePrice: parseFloat(e.target.value) || 0,
                                })
                              }
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
                              min={1}
                              value={game.quantity}
                              onChange={(e) =>
                                updateGameGiven(index, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}

                      {!game.gameBarcode && game.isNewGame && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                          <h4 className="font-medium text-gray-900">
                            New Game Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Platform <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={newGameForms[index]?.gamePlatform || ""}
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gamePlatform = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                placeholder="Nintendo Switch"
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ratings <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={newGameForms[index]?.gameRatings || ""}
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gameRatings = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              >
                                <option value="">Select rating</option>
                                <option value="E">E</option>
                                <option value="E10+">E10+</option>
                                <option value="T">T</option>
                                <option value="M">M</option>
                                <option value="AO">AO</option>
                                <option value="RP">RP</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={
                                  newGameForms[index]?.gameDescription || ""
                                }
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gameDescription = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                rows={3}
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image URL{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="url"
                                value={newGameForms[index]?.gameImageURL || ""}
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gameImageURL = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={newGameForms[index]?.gameCategory || ""}
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gameCategory = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Release Date{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={
                                  newGameForms[index]?.gameReleaseDate || ""
                                }
                                onChange={(e) => {
                                  const forms = { ...newGameForms };
                                  if (!forms[index]) {
                                    forms[index] = {
                                      gamePlatform: "",
                                      gameRatings: "",
                                      gameDescription: "",
                                      gameImageURL: "",
                                      gameCategory: "",
                                      gameReleaseDate: "",
                                    };
                                  }
                                  forms[index].gameReleaseDate = e.target.value;
                                  setNewGameForms(forms);
                                  updateGameGiven(index, {
                                    newGameDetails: forms[index],
                                  });
                                }}
                                required={game.isNewGame}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Games Received Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Games Received (Customer Receiving)
                </h3>
                <button
                  type="button"
                  onClick={addGameReceived}
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
                  {gamesReceived.map((game, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Game {index + 1}
                        </span>
                        {gamesReceived.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGameReceived(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Game <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="relative">
                              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                ref={(el) => {
                                  searchInputRefsReceived.current[index] = el;
                                }}
                                type="text"
                                value={
                                  game.gameBarcode
                                    ? game.gameTitle
                                    : gameSearchStatesReceived[index]
                                        ?.searchTerm || ""
                                }
                                onChange={(e) => {
                                  if (!game.gameBarcode) {
                                    handleSearchChangeReceived(
                                      index,
                                      e.target.value,
                                    );
                                  }
                                }}
                                onFocus={() => {
                                  if (!game.gameBarcode) {
                                    setGameSearchStatesReceived((prev) => ({
                                      ...prev,
                                      [index]: {
                                        searchTerm:
                                          prev[index]?.searchTerm || "",
                                        isOpen: true,
                                        selectedIndex: 0,
                                      },
                                    }));
                                  }
                                }}
                                placeholder={
                                  game.gameBarcode
                                    ? game.gameTitle
                                    : "Search for a game..."
                                }
                                readOnly={!!game.gameBarcode}
                                required={!game.gameBarcode}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                              />
                              {game.gameBarcode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateGameReceived(index, {
                                      gameBarcode: "",
                                      gameTitle: "",
                                      gamePrice: 0,
                                      quantity: 1,
                                      availableStock: 0,
                                    });
                                    setGameSearchStatesReceived((prev) => ({
                                      ...prev,
                                      [index]: {
                                        searchTerm: "",
                                        isOpen: false,
                                        selectedIndex: 0,
                                      },
                                    }));
                                    setDebouncedSearchTermsReceived((prev) => ({
                                      ...prev,
                                      [index]: "",
                                    }));
                                    if (debounceTimeouts.current[index]) {
                                      clearTimeout(
                                        debounceTimeouts.current[index],
                                      );
                                    }
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <HiX className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {gameSearchStatesReceived[index]?.isOpen &&
                              !game.gameBarcode && (
                                <div
                                  ref={(el) => {
                                    searchResultsRefsReceived.current[index] =
                                      el;
                                  }}
                                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                  {getFilteredGamesReceived(index).length >
                                  0 ? (
                                    getFilteredGamesReceived(index).map((g) => (
                                      <button
                                        key={g.gameBarcode}
                                        type="button"
                                        onClick={() =>
                                          handleGameReceivedSelect(index, g)
                                        }
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {g.gameTitle}
                                            </div>
                                            <div className="text-sm text-gray-500 font-mono">
                                              {g.gameBarcode}
                                            </div>
                                          </div>
                                          <div className="text-right ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              ₱{g.gamePrice.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Stock: {g.gameAvailableStocks}
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                      No games found
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={game.availableStock}
                            value={game.quantity}
                            onChange={(e) =>
                              updateGameReceived(index, {
                                quantity: parseInt(e.target.value) || 1,
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                          />
                          {game.availableStock > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Available: {game.availableStock}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                          </label>
                          <input
                            type="number"
                            value={game.gamePrice}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trade Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trade Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trade Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={tradeLocation}
                    onChange={(e) => setTradeLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "pending"
                          | "confirmed"
                          | "completed"
                          | "cancelled",
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Trade Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Value Given:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{calculations.valueGiven.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Total Value Received:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ₱{calculations.valueReceived.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trade Type:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculations.tradeType === "even"
                      ? "Even Trade"
                      : calculations.tradeType === "trade_up"
                        ? "Trade Up"
                        : "Trade Down"}
                  </span>
                </div>
                {calculations.tradeFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trade Fee:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ₱{calculations.tradeFee.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Cash Difference (Customer Pays):
                  </span>
                  <span className="text-base font-bold text-funBlue">
                    ₱{calculations.cashDifference.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Trade"}
              </button>
            </div>
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
