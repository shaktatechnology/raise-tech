"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { Order } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useDeleteConfirmation } from "@/components/admin/DeleteConfirmation";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const { confirmDelete } = useDeleteConfirmation();

  const loadOrders = useCallback(async (statusFilter: string) => {
    setIsLoading(true);
    try {
      const endpoint =
        statusFilter && statusFilter !== "all"
          ? `/admin/orders?status=${statusFilter}`
          : "/admin/orders";

      const res = await fetchApi<{ status: string; data: Order[] }>(endpoint);
      if (res && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch orders:", err);
      toast.error(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadOrders(filter), 0);
    return () => window.clearTimeout(timeoutId);
  }, [filter, loadOrders]);

  // Fetch single order detail
  const handleViewDetail = async (orderId: number) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetchApi<{ status: string; data: Order }>(
        `/admin/orders/${orderId}`
      );
      if (res && res.data) {
        setSelectedOrder(res.data);
      } else {
        const found = orders.find((o) => o.id === orderId);
        if (found) setSelectedOrder(found);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to load order details"));
      const found = orders.find((o) => o.id === orderId);
      if (found) setSelectedOrder(found);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Update order status via POST /api/admin/orders/{order}/status
  const handleStatusChange = async (orderId: number, newStatus: Order["status"]) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetchApi<{ message: string; data: Order }>(
        `/admin/orders/${orderId}/status`,
        {
          method: "POST",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const updatedOrder = res.data;
      const successMsg = res.message || "Order status updated successfully";

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updatedOrder, status: newStatus } : o))
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, ...updatedOrder, status: newStatus } : null
        );
      }

      toast.success(successMsg);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update order status"));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete an order via DELETE /api/admin/orders/{order}
  const handleDelete = async (orderId: number) => {
    const confirmed = await confirmDelete({
      title: `Delete Order #${orderId}?`,
      message: "The order and its saved item records will be permanently removed. This action cannot be undone.",
      confirmLabel: "Delete order",
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetchApi<{ message: string }>(`/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const successMsg = res.message || "Order deleted successfully";

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }

      // Calculate total pages for current state, if deletion empties a page, go back a page
      const currentFiltered = orders.filter((o) => o.id !== orderId);
      const newTotalPages = Math.ceil(currentFiltered.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      toast.success(successMsg);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete order"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      o.id.toString().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_email.toLowerCase().includes(query) ||
      o.customer_phone.toLowerCase().includes(query) ||
      o.shipping_address?.city.toLowerCase().includes(query) ||
      o.shipping_address?.province.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "processing":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "shipped":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Orders Management
                </h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage customer orders, view detailed items, track status, and process requests.
              </p>
            </div>
            <button
              onClick={() => {
                loadOrders(filter);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-2 self-start sm:self-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Total Orders</span>
              <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Pending</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Delivered</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Revenue</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                NPR{" "}
                {orders
                  .reduce((acc, curr) => acc + Number(curr.total || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by Order ID, customer, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <svg
                className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <label className="w-full sm:w-52">
              <span className="sr-only">Filter orders by status</span>
              <select
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold capitalize text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="all">All orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-[850px]">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          Loading orders...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No orders matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                          #{order.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{order.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                          <div className="text-[10px] text-slate-500">{order.customer_email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {order.shipping_address?.city || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          NPR {Number(order.total || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={order.status}
                            disabled={isUpdatingStatus}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as Order["status"])
                            }
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider bg-slate-950 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            <option value="pending" className="bg-slate-900 text-amber-400">
                              PENDING
                            </option>
                            <option value="confirmed" className="bg-slate-900 text-blue-400">
                              CONFIRMED
                            </option>
                            <option value="processing" className="bg-slate-900 text-indigo-400">
                              PROCESSING
                            </option>
                            <option value="shipped" className="bg-slate-900 text-cyan-400">
                              SHIPPED
                            </option>
                            <option value="delivered" className="bg-slate-900 text-emerald-400">
                              DELIVERED
                            </option>
                            <option value="cancelled" className="bg-slate-900 text-red-400">
                              CANCELLED
                            </option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Eye Icon / Details Button */}
                            <button
                              onClick={() => handleViewDetail(order.id)}
                              title="View Details"
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Trash Icon / Delete Button */}
                            <button
                              onClick={() => handleDelete(order.id)}
                              disabled={isDeleting}
                              title="Delete Order"
                              className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl mt-4">
              <span className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
                {filteredOrders.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-slate-700 transition cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === page
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-50 hover:bg-slate-700 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Modal View Details */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                      Order Details
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      Order #{selectedOrder.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {isLoadingDetail ? (
                  <div className="py-12 text-center text-slate-400">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading order items...
                  </div>
                ) : (
                  <>
                    {/* Customer Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block">Customer Name</span>
                        <span className="text-white font-semibold">{selectedOrder.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Phone</span>
                        <span className="text-slate-200">{selectedOrder.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Email</span>
                        <span className="text-slate-200">{selectedOrder.customer_email}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Shipping Address</span>
                        <span className="text-slate-200">
                          {selectedOrder.shipping_address
                            ? [
                                selectedOrder.shipping_address.address,
                                selectedOrder.shipping_address.city,
                                selectedOrder.shipping_address.province,
                              ]
                                .filter(Boolean)
                                .join(", ")
                            : "Not available"}
                        </span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500 block">Notes</span>
                          <span className="text-amber-300 italic">{selectedOrder.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Update Status Control */}
                    <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Update Status:</span>
                      <select
                        value={selectedOrder.status}
                        disabled={isUpdatingStatus}
                        onChange={(e) =>
                          handleStatusChange(selectedOrder.id, e.target.value as Order["status"])
                        }
                        className="bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Items List */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                            >
                              <div>
                                <div className="text-white font-semibold">{item.product_title}</div>
                                <div className="text-[10px] text-slate-500">
                                  SKU: {item.product_sku || "N/A"} | Product ID: {item.product_id}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-slate-300">
                                  {item.quantity} x NPR {Number(item.unit_price).toLocaleString()}
                                </div>
                                <div className="text-cyan-400 font-bold">
                                  NPR {Number(item.subtotal).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                            No item details found for this order.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                      <div className="text-slate-400 space-y-1">
                        <div>
                          Payment Method:{" "}
                          <span className="text-white font-medium capitalize">
                            {(selectedOrder.payment_method || "COD").replace(/_/g, " ")}
                          </span>
                        </div>
                        <div>
                          Subtotal: NPR {Number(selectedOrder.subtotal || 0).toLocaleString()} | Shipping Charge: NPR {Number(selectedOrder.shipping_charge || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right self-end sm:self-auto">
                        <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                          Total Amount
                        </span>
                        <span className="text-xl font-black text-cyan-400">
                          NPR {Number(selectedOrder.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
