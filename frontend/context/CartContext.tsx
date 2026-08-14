"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchApi } from "@/lib/api";
import { CartItem } from "@/lib/types/product";
import { useAuth } from "@/context/AuthContext";

interface ApiCartItem {
  id: number;
  product_id: number;
  product_title: string;
  product_slug: string;
  product_sku: string | null;
  featured_image: string | null;
  unit_price: string;
  quantity: number;
  available_stock: number;
  is_active: boolean;
}

interface ApiCart {
  id: number;
  items: ApiCartItem[];
}

interface ApiCartResponse {
  data: ApiCart;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string, size?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, size?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "raise_tech_cart_v1";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getProductImageUrl(path: string | null): string {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage/")) return `${API_ORIGIN}${path}`;
  if (path.startsWith("storage/")) return `${API_ORIGIN}/${path}`;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/storage/${path}`;
}

function normalizeApiCart(cart: ApiCart): CartItem[] {
  return (cart.items || []).map((item) => ({
    id: String(item.id),
    productId: item.product_id,
    productSlug: item.product_slug,
    name: item.product_title,
    category: item.product_sku ? `SKU: ${item.product_sku}` : "Shop",
    price: Number(item.unit_price),
    quantity: item.quantity,
    image: getProductImageUrl(item.featured_image),
    inStock: item.is_active && item.available_stock > 0,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStoredCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;

  const productId = Number(value.productId ?? value.id);
  const quantity = Number(value.quantity);
  const price = Number(value.price);

  if (
    !Number.isInteger(productId) ||
    productId < 1 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    !Number.isFinite(price) ||
    typeof value.productSlug !== "string" ||
    typeof value.name !== "string" ||
    typeof value.image !== "string"
  ) {
    return null;
  }

  return {
    id: typeof value.id === "string" ? value.id : String(productId),
    productId,
    productSlug: value.productSlug,
    name: value.name,
    category: typeof value.category === "string" ? value.category : "Shop",
    price,
    quantity,
    size: typeof value.size === "string" ? value.size : undefined,
    image: value.image,
    inStock: typeof value.inStock === "boolean" ? value.inStock : true,
  };
}

function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeStoredCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    if (items.length === 0) {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Keep the in-memory guest cart usable when storage is unavailable.
  }
}

function buildMergeItems(items: CartItem[]): Array<{ product_id: number; quantity: number }> {
  const quantities = new Map<number, number>();

  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }

  return Array.from(quantities, ([product_id, quantity]) => ({ product_id, quantity }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synchronizedOwner, setSynchronizedOwner] = useState<number | "guest" | null>(null);
  const expectedOwner = user?.id ?? "guest";
  const cartIsLoading =
    isAuthLoading || !isStorageReady || isLoading || synchronizedOwner !== expectedOwner;

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      setItems(readGuestCart());
      setIsStorageReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady || isAuthLoading) return;

    let active = true;

    const synchronizeCart = async () => {
      await Promise.resolve();
      if (!active) return;

      setIsLoading(true);
      setError(null);
      setSynchronizedOwner(null);

      if (!user) {
        setItems(readGuestCart());
        setSynchronizedOwner("guest");
        setIsLoading(false);
        return;
      }

      const guestItems = readGuestCart();

      try {
        const response = guestItems.length
          ? await fetchApi<ApiCartResponse>("/cart/merge", {
              method: "POST",
              body: JSON.stringify({ items: buildMergeItems(guestItems) }),
            })
          : await fetchApi<ApiCartResponse>("/cart");

        if (!active) return;

        writeGuestCart([]);
        setItems(normalizeApiCart(response.data));
      } catch (syncError) {
        if (!active) return;

        setError(getErrorMessage(syncError, "Failed to synchronize your cart."));

        try {
          const response = await fetchApi<ApiCartResponse>("/cart");
          if (active) setItems(normalizeApiCart(response.data));
        } catch {
          if (active) setItems([]);
        }
      } finally {
        if (active) {
          setSynchronizedOwner(user.id);
          setIsLoading(false);
        }
      }
    };

    void synchronizeCart();

    return () => {
      active = false;
    };
  }, [isAuthLoading, isStorageReady, user]);

  const updateGuestItems = useCallback((updater: (current: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const updated = updater(current);
      writeGuestCart(updated);
      return updated;
    });
  }, []);

  const runApiMutation = useCallback(
    async (request: () => Promise<ApiCartResponse>): Promise<void> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await request();
        setItems(normalizeApiCart(response.data));
      } catch (operationError) {
        setError(getErrorMessage(operationError, "Failed to update your cart."));
        throw operationError;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const refreshCart = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        setItems(readGuestCart());
        return;
      }

      const response = await fetchApi<ApiCartResponse>("/cart");
      setItems(normalizeApiCart(response.data));
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, "Failed to load your cart."));
      throw refreshError;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addItem = useCallback(
    async (newItem: CartItem): Promise<void> => {
      if (cartIsLoading) throw new Error("Please wait while your cart is loading.");
      if (!Number.isInteger(newItem.productId) || newItem.productId < 1) {
        throw new Error("This product cannot be added to the online cart.");
      }

      if (user) {
        await runApiMutation(() =>
          fetchApi<ApiCartResponse>("/cart/items", {
            method: "POST",
            body: JSON.stringify({
              product_id: newItem.productId,
              quantity: newItem.quantity,
            }),
          })
        );
        return;
      }

      updateGuestItems((current) => {
        const existingIndex = current.findIndex(
          (item) => item.productId === newItem.productId && item.size === newItem.size
        );

        if (existingIndex < 0) return [...current, newItem];

        return current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      });
    },
    [cartIsLoading, runApiMutation, updateGuestItems, user]
  );

  const removeItem = useCallback(
    async (id: string, size?: string): Promise<void> => {
      if (user) {
        await runApiMutation(() =>
          fetchApi<ApiCartResponse>(`/cart/items/${id}`, { method: "DELETE" })
        );
        return;
      }

      updateGuestItems((current) =>
        current.filter((item) => !(item.id === id && item.size === size))
      );
    },
    [runApiMutation, updateGuestItems, user]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number, size?: string): Promise<void> => {
      if (quantity < 1) {
        await removeItem(id, size);
        return;
      }

      if (user) {
        await runApiMutation(() =>
          fetchApi<ApiCartResponse>(`/cart/items/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          })
        );
        return;
      }

      updateGuestItems((current) =>
        current.map((item) =>
          item.id === id && item.size === size ? { ...item, quantity } : item
        )
      );
    },
    [removeItem, runApiMutation, updateGuestItems, user]
  );

  const clearCart = useCallback(async (): Promise<void> => {
    if (user) {
      await runApiMutation(() => fetchApi<ApiCartResponse>("/cart", { method: "DELETE" }));
      return;
    }

    updateGuestItems(() => []);
  }, [runApiMutation, updateGuestItems, user]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        totalItems,
        subtotal,
        isLoading: cartIsLoading,
        isUpdating,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
