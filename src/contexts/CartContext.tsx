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
  salePrice?: number;
  isOnSale?: boolean;
}

export interface Cart {
  items: CartItem[];
  type: "purchase" | "rental" | null;
}

interface CartContextType {
  cart: Cart;
  addToCart: (
    game: Game,
    quantity: number,
    type: "purchase" | "rental",
  ) => void;
  removeFromCart: (barcode: string) => void;
  updateQuantity: (barcode: string, quantity: number) => void;
  setCartType: (type: "purchase" | "rental" | null) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  isInCart: (barcode: string) => boolean;
  getCartItem: (barcode: string) => CartItem | undefined;
  negotiatedDiscount: number;
  applyDiscount: (amount: number) => void;
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
  const [cart, setCart] = useState<Cart>({ items: [], type: null });
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

  const addToCart = useCallback(
    (game: Game, quantity: number, type: "purchase" | "rental") => {
      if (game.gameAvailableStocks === 0) {
        return;
      }

      setCart((prevCart) => {
        // If cart has items and type is different, clear cart first
        if (prevCart.items.length > 0 && prevCart.type !== type) {
          return {
            items: [
              {
                gameBarcode: game.gameBarcode,
                gameTitle: game.gameTitle,
                gameImageURL: game.gameImageURL,
                gamePrice: game.gamePrice,
                quantity: Math.min(quantity, game.gameAvailableStocks),
                maxStock: game.gameAvailableStocks,
                salePrice: game.salePrice,
                isOnSale: game.isOnSale,
              },
            ],
            type,
          };
        }

        // Check if item already exists
        const existingIndex = prevCart.items.findIndex(
          (item) => item.gameBarcode === game.gameBarcode,
        );

        if (existingIndex >= 0) {
          // Update existing item
          const existingItem = prevCart.items[existingIndex];
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            game.gameAvailableStocks,
          );

          if (newQuantity <= 0) return prevCart;

          const updatedItems = [...prevCart.items];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
            maxStock: game.gameAvailableStocks,
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
              gamePrice: game.gamePrice,
              quantity: Math.min(quantity, game.gameAvailableStocks),
              maxStock: game.gameAvailableStocks,
              salePrice: game.salePrice,
              isOnSale: game.isOnSale,
            },
          ],
          type: prevCart.type || type,
        };
      });
    },
    [],
  );

  const removeFromCart = useCallback((barcode: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter((item) => item.gameBarcode !== barcode),
      type: prevCart.items.length === 1 ? null : prevCart.type,
    }));
  }, []);

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
            type: prevCart.items.length === 1 ? null : prevCart.type,
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

  const setCartType = useCallback((type: "purchase" | "rental" | null) => {
    setCart((prevCart) => ({
      ...prevCart,
      type,
      items: type === null ? [] : prevCart.items,
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], type: null });
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
        removeFromCart,
        updateQuantity,
        setCartType,
        clearCart,
        getCartItemCount,
        isInCart,
        getCartItem,
        negotiatedDiscount,
        applyDiscount,
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
