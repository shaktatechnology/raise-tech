"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function CartItemList() {
  const {
    items,
    removeItem,
    updateQuantity,
    refreshCart,
    totalItems,
    subtotal,
    isLoading,
    isUpdating,
    error,
  } = useCart();
  const { toast } = useToast();
  const deliveryFee = items.length > 0 ? 100 : 0;
  const grandTotal = subtotal + deliveryFee;

  const runCartAction = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (cartError) {
      toast.error(
        cartError instanceof Error ? cartError.message : "Failed to update your cart."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-2xl mx-auto my-12">
        <div className="w-8 h-8 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  const errorNotice = error ? (
    <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <span>{error}</span>
      <button
        type="button"
        onClick={() => void runCartAction(refreshCart)}
        className="font-bold text-rose-700 underline underline-offset-2 cursor-pointer"
      >
        Try again
      </button>
    </div>
  ) : null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        {errorNotice}
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center shadow-xs border border-gray-100">
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-8">
            Browse our thermal paper rolls, POS receipt supplies, and barcode label stickers to
            add items to your order.
          </p>
          <Link
            href="/products/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-md transition-colors text-sm"
          >
            <span>Browse Product Shop</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {errorNotice}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={`${item.id}-${item.size || "default"}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                  <div className="relative w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[#01A7E5] uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                    <Link href={`/products/shop/${item.productSlug}`}>
                      <h3 className="text-base font-bold text-gray-900 hover:text-[#01A7E5] transition-colors leading-snug truncate">
                        {item.name}
                      </h3>
                    </Link>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-1">
                        Package: <span className="font-semibold text-gray-700">{item.size}</span>
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-[#01A7E5] sm:hidden mt-1">
                      NPR {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="hidden sm:block text-right">
                    <span className="block text-xs text-gray-400">Unit Price</span>
                    <span className="text-sm font-bold text-gray-800">
                      NPR {item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() =>
                        void runCartAction(() =>
                          updateQuantity(item.id, item.quantity - 1, item.size)
                        )
                      }
                      disabled={isUpdating}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void runCartAction(() =>
                          updateQuantity(item.id, item.quantity + 1, item.size)
                        )
                      }
                      disabled={isUpdating}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="block text-xs text-gray-400">Total</span>
                    <span className="text-base font-extrabold text-gray-900">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void runCartAction(() => removeItem(item.id, item.size))
                    }
                    disabled={isUpdating}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="pt-4 flex justify-between items-center">
            <Link
              href="/products/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#01A7E5] hover:text-[#018bc0]"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 sticky top-24 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Total ({totalItems})</span>
                <span className="font-semibold text-gray-900">NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-gray-900">NPR {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-extrabold text-[#01A7E5]">
                  NPR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] text-center block text-base"
            >
              Proceed to Checkout →
            </Link>

            <p className="text-xs text-gray-400 text-center">
              Free shipping on orders over NPR 5,000 in Kathmandu Valley.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
