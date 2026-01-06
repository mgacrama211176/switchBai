"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Game } from "@/app/types/games";

export interface CartItem {
  gameBarcode: string;
  gameTitle: string;
  gameImageURL: string;
  gamePrice: number;
  quantity: number;
  maxStock: number;
  variant?: "withCase" | "cartridgeOnly";
  salePrice?: number;
  isOnSale?: boolean;
  tradable?: boolean;
}

export interface Cart {
  items: CartItem[]; // gamesReceived for trade
  gamesGiven?: CartItem[]; // games being traded in (only for trade type)
  type: "purchase" | "rental" | "trade" | null;
}

interface CartContextType {
  cart: Cart;
  addToCart: (
    game: Game,
    quantity: number,
    type: "purchase" | "rental" | "trade",
    variant?: "withCase" | "cartridgeOnly",
  ) => void;
  addToTradeCart: (
    game: Game,
    quantity: number,
    side: "received" | "given",
    variant?: "withCase" | "cartridgeOnly",
  ) => void;
  removeFromCart: (barcode: string) => void;
  removeFromTradeCart: (barcode: string, side: "received" | "given") => void;
  updateQuantity: (barcode: string, quantity: number) => void;
  updateTradeQuantity: (
    barcode: string,
    quantity: number,
    side: "received" | "given",
  ) => void;
  updateTradeVariant: (
    barcode: string,
    oldVariant: "withCase" | "cartridgeOnly",
    newVariant: "withCase" | "cartridgeOnly",
    side: "received" | "given",
    game: Game,
  ) => void;
  setCartType: (type: "purchase" | "rental" | "trade" | null) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  isInCart: (barcode: string) => boolean;
  getCartItem: (barcode: string) => CartItem | undefined;
  negotiatedDiscount: number;
  applyDiscount: (amount: number) => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "switchbai_cart";

function loadCartFromStorage(): Cart {
  if (typeof window === "undefined") {
    return { items: [], type: null };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (parsed && Array.isArray(parsed.items)) {
        return {
          items: parsed.items,
          gamesGiven: parsed.gamesGiven || undefined,
          type: parsed.type || null,
        };
      }
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }

  return { items: [], type: null };
}

function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Note: Storage events are automatically fired by the browser
    // when localStorage changes from another tab/window, not from the same tab
    // So we don't need to manually dispatch events
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
    // Handle quota exceeded or other errors gracefully
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start with empty cart to ensure server/client match
  const [cart, setCart] = useState<Cart>({
    items: [],
    gamesGiven: undefined,
    type: null,
  });
  const [negotiatedDiscount, setNegotiatedDiscount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInternalUpdateRef = useRef(false);
  const lastSavedCartRef = useRef<string>("");

  const applyDiscount = useCallback((amount: number) => {
    setNegotiatedDiscount(amount);
  }, []);

  // Load cart from localStorage after mount (client-side only)
  useEffect(() => {
    const loadedCart = loadCartFromStorage();
    setCart(loadedCart);
    lastSavedCartRef.current = JSON.stringify(loadedCart);
    setIsHydrated(true);
  }, []);

  // Sync cart across tabs (only from other tabs/windows)
  useEffect(() => {
    if (!isHydrated) return;

    function handleStorageChange(e: StorageEvent) {
      // Only handle storage events from other tabs/windows
      // The browser's native storage event only fires for changes from other tabs
      if (e.key !== CART_STORAGE_KEY || isInternalUpdateRef.current) {
        return;
      }

      const newCart = loadCartFromStorage();
      const newCartStr = JSON.stringify(newCart);

      // Only update if cart actually changed and it's different from what we last saved
      if (newCartStr !== lastSavedCartRef.current) {
        isInternalUpdateRef.current = true;
        setCart(newCart);
        lastSavedCartRef.current = newCartStr;
        // Reset flag after state update
        setTimeout(() => {
          isInternalUpdateRef.current = false;
        }, 0);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isHydrated]);

  // Save to localStorage whenever cart changes (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const cartStr = JSON.stringify(cart);

    // Only save if cart actually changed
    if (cartStr === lastSavedCartRef.current) {
      return;
    }

    // Mark as internal update to prevent storage event handler from firing
    isInternalUpdateRef.current = true;
    lastSavedCartRef.current = cartStr;
    saveCartToStorage(cart);

    // Reset flag after save completes
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  }, [cart, isHydrated]);

  const addToTradeCart = useCallback(
    (
      game: Game,
      quantity: number,
      side: "received" | "given",
      variant: "withCase" | "cartridgeOnly" = "withCase",
    ) => {
      // Get variant-specific stock and price
      const variantStock =
        side === "received"
          ? variant === "cartridgeOnly"
            ? (game.stockCartridgeOnly ?? 0)
            : (game.stockWithCase ?? 0)
          : 999; // No limit for games given
      const variantPrice =
        variant === "cartridgeOnly"
          ? game.cartridgeOnlyPrice || Math.max(0, game.gamePrice - 100)
          : game.gamePrice;

      setCart((prevCart) => {
        // Ensure cart type is trade
        const cartType = prevCart.type || "trade";
        if (cartType !== "trade") {
          // If switching to trade, initialize gamesGiven
          return {
            items:
              side === "received"
                ? [
                    {
                      gameBarcode: game.gameBarcode,
                      gameTitle: game.gameTitle,
                      gameImageURL: game.gameImageURL,
                      gamePrice: variantPrice,
                      quantity: Math.min(quantity, variantStock),
                      maxStock: variantStock,
                      variant: side === "received" ? variant : undefined,
                      salePrice: game.salePrice,
                      isOnSale: game.isOnSale,
                      tradable: game.tradable,
                    },
                  ]
                : [],
            gamesGiven:
              side === "given"
                ? [
                    {
                      gameBarcode: game.gameBarcode,
                      gameTitle: game.gameTitle,
                      gameImageURL: game.gameImageURL,
                      gamePrice: variantPrice,
                      quantity,
                      maxStock: 999, // No stock limit for games being traded in
                      variant: variant, // Store variant for games given
                      salePrice: game.salePrice,
                      isOnSale: game.isOnSale,
                      tradable: game.tradable,
                    },
                  ]
                : [],
            type: "trade",
          };
        }

        const targetArray =
          side === "received" ? prevCart.items : prevCart.gamesGiven || [];
        const existingIndex = targetArray.findIndex(
          (item) =>
            item.gameBarcode === game.gameBarcode &&
            (item.variant || "withCase") === variant,
        );

        if (existingIndex >= 0) {
          // Update existing item
          const existingItem = targetArray[existingIndex];
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity <= 0) {
            // Remove item
            if (side === "received") {
              return {
                ...prevCart,
                items: prevCart.items.filter(
                  (item) => item.gameBarcode !== game.gameBarcode,
                ),
              };
            } else {
              return {
                ...prevCart,
                gamesGiven: (prevCart.gamesGiven || []).filter(
                  (item) => item.gameBarcode !== game.gameBarcode,
                ),
              };
            }
          }

          const updatedItems = [...targetArray];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            maxStock: side === "received" ? variantStock : 999,
            tradable: game.tradable,
          };

          if (side === "received") {
            return {
              ...prevCart,
              items: updatedItems,
            };
          } else {
            return {
              ...prevCart,
              gamesGiven: updatedItems,
            };
          }
        }

        // Add new item
        const newItem: CartItem = {
          gameBarcode: game.gameBarcode,
          gameTitle: game.gameTitle,
          gameImageURL: game.gameImageURL,
          gamePrice: variantPrice,
          quantity:
            side === "received" ? Math.min(quantity, variantStock) : quantity,
          maxStock: side === "received" ? variantStock : 999,
          variant: variant, // Store variant for both received and given
          salePrice: game.salePrice,
          isOnSale: game.isOnSale,
          tradable: game.tradable,
        };

        if (side === "received") {
          return {
            ...prevCart,
            items: [...prevCart.items, newItem],
            type: "trade",
          };
        } else {
          return {
            ...prevCart,
            gamesGiven: [...(prevCart.gamesGiven || []), newItem],
            type: "trade",
          };
        }
      });
    },
    [],
  );

  const addToCart = useCallback(
    (
      game: Game,
      quantity: number,
      type: "purchase" | "rental" | "trade",
      variant: "withCase" | "cartridgeOnly" = "withCase",
    ) => {
      // For trade type, use addToTradeCart instead
      if (type === "trade") {
        addToTradeCart(game, quantity, "received", variant);
        return;
      }

      // Get variant-specific stock
      const variantStock =
        variant === "cartridgeOnly"
          ? (game.stockCartridgeOnly ?? 0)
          : (game.stockWithCase ?? 0);

      if (variantStock === 0) {
        return;
      }

      // Get variant-specific price
      const variantPrice =
        variant === "cartridgeOnly" && game.cartridgeOnlyPrice
          ? game.cartridgeOnlyPrice
          : game.gamePrice;

      setCart((prevCart) => {
        // If cart has items and type is different, clear cart first
        if (prevCart.items.length > 0 && prevCart.type !== type) {
          return {
            items: [
              {
                gameBarcode: game.gameBarcode,
                gameTitle: game.gameTitle,
                gameImageURL: game.gameImageURL,
                gamePrice: variantPrice,
                quantity: Math.min(quantity, variantStock),
                maxStock: variantStock,
                variant,
                salePrice: game.salePrice,
                isOnSale: game.isOnSale,
              },
            ],
            gamesGiven: undefined,
            type,
          };
        }

        // Check if item already exists (same barcode AND variant)
        const existingIndex = prevCart.items.findIndex(
          (item) =>
            item.gameBarcode === game.gameBarcode && item.variant === variant,
        );

        if (existingIndex >= 0) {
          // Update existing item
          const existingItem = prevCart.items[existingIndex];
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            variantStock,
          );

          if (newQuantity <= 0) return prevCart;

          const updatedItems = [...prevCart.items];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            maxStock: variantStock,
          };

          return {
            ...prevCart,
            items: updatedItems,
            type: prevCart.type || type,
          };
        }

        // Add new item
        return {
          items: [
            ...prevCart.items,
            {
              gameBarcode: game.gameBarcode,
              gameTitle: game.gameTitle,
              gameImageURL: game.gameImageURL,
              gamePrice: variantPrice,
              quantity: Math.min(quantity, variantStock),
              maxStock: variantStock,
              variant,
              salePrice: game.salePrice,
              isOnSale: game.isOnSale,
            },
          ],
          gamesGiven: undefined,
          type: prevCart.type || type,
        };
      });
    },
    [addToTradeCart],
  );

  const removeFromCart = useCallback((barcode: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.gameBarcode !== barcode,
      );
      return {
        ...prevCart,
        items: newItems,
        type:
          newItems.length === 0 &&
          (!prevCart.gamesGiven || prevCart.gamesGiven.length === 0)
            ? null
            : prevCart.type,
      };
    });
  }, []);

  const removeFromTradeCart = useCallback(
    (barcode: string, side: "received" | "given") => {
      setCart((prevCart) => {
        if (side === "received") {
          const newItems = prevCart.items.filter(
            (item) => item.gameBarcode !== barcode,
          );
          return {
            ...prevCart,
            items: newItems,
            type:
              newItems.length === 0 &&
              (!prevCart.gamesGiven || prevCart.gamesGiven.length === 0)
                ? null
                : prevCart.type,
          };
        } else {
          const newGamesGiven = (prevCart.gamesGiven || []).filter(
            (item) => item.gameBarcode !== barcode,
          );
          return {
            ...prevCart,
            gamesGiven: newGamesGiven,
            type:
              prevCart.items.length === 0 && newGamesGiven.length === 0
                ? null
                : prevCart.type,
          };
        }
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (barcode: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(barcode);
        return;
      }

      setCart((prevCart) => {
        const item = prevCart.items.find(
          (item) => item.gameBarcode === barcode,
        );
        if (!item) return prevCart;

        const newQuantity = Math.min(quantity, item.maxStock);
        if (newQuantity <= 0) {
          return {
            ...prevCart,
            items: prevCart.items.filter(
              (item) => item.gameBarcode !== barcode,
            ),
            type:
              prevCart.items.length === 1 &&
              (!prevCart.gamesGiven || prevCart.gamesGiven.length === 0)
                ? null
                : prevCart.type,
          };
        }

        return {
          ...prevCart,
          items: prevCart.items.map((item) =>
            item.gameBarcode === barcode
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        };
      });
    },
    [removeFromCart],
  );

  const updateTradeQuantity = useCallback(
    (barcode: string, quantity: number, side: "received" | "given") => {
      if (quantity <= 0) {
        removeFromTradeCart(barcode, side);
        return;
      }

      setCart((prevCart) => {
        if (side === "received") {
          const item = prevCart.items.find(
            (item) => item.gameBarcode === barcode,
          );
          if (!item) return prevCart;

          const newQuantity = Math.min(quantity, item.maxStock);
          if (newQuantity <= 0) {
            return {
              ...prevCart,
              items: prevCart.items.filter(
                (item) => item.gameBarcode !== barcode,
              ),
              type:
                prevCart.items.length === 1 &&
                (!prevCart.gamesGiven || prevCart.gamesGiven.length === 0)
                  ? null
                  : prevCart.type,
            };
          }

          return {
            ...prevCart,
            items: prevCart.items.map((item) =>
              item.gameBarcode === barcode
                ? { ...item, quantity: newQuantity }
                : item,
            ),
          };
        } else {
          const item = (prevCart.gamesGiven || []).find(
            (item) => item.gameBarcode === barcode,
          );
          if (!item) return prevCart;

          const newQuantity = quantity; // No max stock for games being traded in
          if (newQuantity <= 0) {
            return {
              ...prevCart,
              gamesGiven: (prevCart.gamesGiven || []).filter(
                (item) => item.gameBarcode !== barcode,
              ),
              type:
                prevCart.items.length === 0 &&
                (prevCart.gamesGiven || []).length === 1
                  ? null
                  : prevCart.type,
            };
          }

          return {
            ...prevCart,
            gamesGiven: (prevCart.gamesGiven || []).map((item) =>
              item.gameBarcode === barcode
                ? { ...item, quantity: newQuantity }
                : item,
            ),
          };
        }
      });
    },
    [removeFromTradeCart],
  );

  const updateTradeVariant = useCallback(
    (
      barcode: string,
      oldVariant: "withCase" | "cartridgeOnly",
      newVariant: "withCase" | "cartridgeOnly",
      side: "received" | "given",
      game: Game,
    ) => {
      setCart((prevCart) => {
        if (side === "received") {
          const itemIndex = prevCart.items.findIndex(
            (item) =>
              item.gameBarcode === barcode &&
              (item.variant || "withCase") === oldVariant,
          );
          if (itemIndex === -1) return prevCart;

          const item = prevCart.items[itemIndex];
          const newVariantStock =
            newVariant === "cartridgeOnly"
              ? (game.stockCartridgeOnly ?? 0)
              : (game.stockWithCase ?? 0);
          const newVariantPrice =
            newVariant === "cartridgeOnly"
              ? game.cartridgeOnlyPrice || Math.max(0, game.gamePrice - 100)
              : game.gamePrice;
          const newQuantity = Math.min(item.quantity, newVariantStock);

          if (newQuantity <= 0) return prevCart;

          const updatedItems = [...prevCart.items];
          updatedItems[itemIndex] = {
            ...item,
            variant: newVariant,
            gamePrice: newVariantPrice,
            quantity: newQuantity,
            maxStock: newVariantStock,
          };

          return {
            ...prevCart,
            items: updatedItems,
          };
        } else {
          const itemIndex = (prevCart.gamesGiven || []).findIndex(
            (item) =>
              item.gameBarcode === barcode &&
              (item.variant || "withCase") === oldVariant,
          );
          if (itemIndex === -1) return prevCart;

          const item = (prevCart.gamesGiven || [])[itemIndex];
          const newVariantPrice =
            newVariant === "cartridgeOnly"
              ? game.cartridgeOnlyPrice || Math.max(0, game.gamePrice - 100)
              : game.gamePrice;
          const updatedGamesGiven = [...(prevCart.gamesGiven || [])];
          updatedGamesGiven[itemIndex] = {
            ...item,
            variant: newVariant,
            gamePrice: newVariantPrice,
          };

          return {
            ...prevCart,
            gamesGiven: updatedGamesGiven,
          };
        }
      });
    },
    [],
  );

  const setCartType = useCallback(
    (type: "purchase" | "rental" | "trade" | null) => {
      setCart((prevCart) => ({
        ...prevCart,
        type,
        items: type === null ? [] : prevCart.items,
        gamesGiven: type !== "trade" ? undefined : prevCart.gamesGiven || [],
      }));
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart({ items: [], gamesGiven: undefined, type: null });
    setNegotiatedDiscount(0);
  }, []);

  const getCartItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const isInCart = useCallback(
    (barcode: string) => {
      return cart.items.some((item) => item.gameBarcode === barcode);
    },
    [cart.items],
  );

  const getCartItem = useCallback(
    (barcode: string) => {
      return cart.items.find((item) => item.gameBarcode === barcode);
    },
    [cart.items],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addToTradeCart,
        removeFromCart,
        removeFromTradeCart,
        updateQuantity,
        updateTradeQuantity,
        updateTradeVariant,
        setCartType,
        clearCart,
        getCartItemCount,
        isInCart,
        getCartItem,
        negotiatedDiscount,
        applyDiscount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
