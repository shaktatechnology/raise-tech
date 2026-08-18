"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    isUpdating,
  } = useCart();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside or ESC key
  useEffect(() => {
    if (isDrawerOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          // Check if click was on the cart button itself to prevent immediate re-opening
          const cartBtn = document.getElementById("header-cart-button");
          if (cartBtn && cartBtn.contains(e.target as Node)) {
            return;
          }
          closeDrawer();
        }
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeDrawer();
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update cart");
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-2xs md:hidden"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Cart Dropdown Flyout - anchored right below the Cart Icon */}
      <div
        ref={dropdownRef}
        className="absolute right-0 top-full mt-3 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        role="dialog"
        aria-label="Cart Dropdown"
      >
        {/* Top Caret Pointer Arrow pointing up to Cart Button */}
        <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-t border-l border-gray-200/80 rotate-45 z-10" />

        {/* Dropdown Header */}
        <div className="relative z-20 p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            My Cart ({totalItems})
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close cart menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="relative z-20 max-h-80 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-cyan-50 text-[#01A7E5] rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                🛒
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Your cart is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">
                Explore our store to add products to your cart.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="px-5 py-2 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size || "default"}`}
                  className="pt-3 first:pt-0 flex items-center gap-3 justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Info & Quantity */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </h4>

                    {/* Quantity Selector */}
                    <div className="inline-flex items-center rounded-lg bg-gray-100/90 border border-gray-200 mt-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          void handleAction(() =>
                            updateQuantity(item.id, item.quantity - 1, item.size)
                          )
                        }
                        disabled={isUpdating}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg font-bold transition-colors cursor-pointer disabled:opacity-50 text-xs"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void handleAction(() =>
                            updateQuantity(item.id, item.quantity + 1, item.size)
                          )
                        }
                        disabled={isUpdating}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg font-bold transition-colors cursor-pointer disabled:opacity-50 text-xs"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right shrink-0 flex flex-col items-end justify-between">
                    <span className="text-sm font-extrabold text-gray-900">
                      Rs.{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleAction(() => removeItem(item.id, item.size))
                      }
                      disabled={isUpdating}
                      className="mt-2 text-[11px] text-gray-400 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown Footer */}
        {items.length > 0 && (
          <div className="relative z-20 p-4 border-t border-gray-100 bg-white space-y-3 shrink-0 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium text-sm">Subtotal</span>
              <span className="text-lg font-extrabold text-gray-900">
                Rs.{subtotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full py-2.5 border border-[#01A7E5] text-[#01A7E5] hover:bg-cyan-50 font-bold rounded-xl text-center transition-all text-xs flex items-center justify-center cursor-pointer"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full py-2.5 bg-[#0166FF] hover:bg-[#0052cc] text-white font-bold rounded-xl text-center shadow-xs transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Checkout</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
