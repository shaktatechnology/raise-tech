"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types/product';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'raise_tech_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage after initial client mount
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(() => {
      if (!mounted) return;
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // LocalStorage read error fallback
      }
      setIsMounted(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // LocalStorage write error fallback
      }
    }
  }, [items, isMounted]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === newItem.id && i.size === newItem.size
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prevItems, newItem];
    });
  };

  const removeItem = (id: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.id === id && i.size === size))
    );
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity < 1) {
      removeItem(id, size);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((i) => {
        if (i.id === id && i.size === size) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems: isMounted ? totalItems : 0,
        subtotal: isMounted ? subtotal : 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
