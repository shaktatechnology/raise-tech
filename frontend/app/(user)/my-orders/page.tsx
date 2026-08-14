"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function MyOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMyOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<{ status: string; data: Order[] }>("/my-orders");
      if (res && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      console.error("Failed to load user orders:", err);
      toast.error(getErrorMessage(err, "Failed to load your orders"));
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const timeoutId = window.setTimeout(() => void fetchMyOrders(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchMyOrders, user]);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "shipped":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatAddress = (address: Order["shipping_address"]) => {
    if (!address) return "Not available";

    return [address.address, address.city, address.province]
      .filter(Boolean)
      .join(", ");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f2fcff] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin"></div>
          Checking account details...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f2fcff] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Sign In Required</h1>
          <p className="text-sm text-gray-600">
            Please log in to your Raise Tech account to view your past orders and status.
          </p>
          <Link
            href="/login?redirect=/my-orders"
            className="inline-block px-8 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fcff] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              View your order history, delivery details, and order status updates.
            </p>
          </div>
          <button
            onClick={fetchMyOrders}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 shadow-2xs transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100">
            <div className="w-8 h-8 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto space-y-4">
            <div className="text-5xl">📦</div>
            <h2 className="text-2xl font-bold text-gray-900">No Orders Found</h2>
            <p className="text-sm text-gray-600">
              You haven&apos;t placed any orders yet. Explore our shop to find thermal paper rolls and label stickers!
            </p>
            <Link
              href="/products/shop"
              className="inline-block px-8 py-3 bg-[#01A7E5] text-white font-bold rounded-xl hover:bg-[#018bc0] transition-colors text-sm shadow-xs"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900 font-mono">
                      Order #{order.id}
                    </span>
                    <span
                      className={`px-3 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Placed on:{" "}
                    <span className="font-semibold text-gray-700">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">
                      Customer Info
                    </span>
                    <span className="font-semibold text-gray-800 block mt-0.5">{order.customer_name}</span>
                    <span>{order.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">
                      Shipping Address
                    </span>
                    <span className="font-semibold text-gray-800 block mt-0.5">
                      {formatAddress(order.shipping_address)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold text-[10px]">
                      Payment &amp; Total
                    </span>
                    <span className="font-semibold text-gray-800 block mt-0.5 capitalize">
                      {(order.payment_method || "COD").replace(/_/g, " ")}
                    </span>
                    <span className="text-base font-extrabold text-[#01A7E5] block mt-0.5">
                      NPR {Number(order.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items preview if exists */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      Ordered Items ({order.items.length})
                    </span>
                    <div className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-1.5 flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {item.product_title} <span className="text-gray-400">× {item.quantity}</span>
                          </span>
                          <span className="font-bold text-gray-900">
                            NPR {Number(item.subtotal || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
