"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { Order } from "@/lib/types";

const MOCK_ORDERS: Order[] = [
  {
    id: 1001,
    user_id: 1,
    customer_name: "Aarav Sharma",
    customer_email: "aarav.sharma@example.com",
    customer_phone: "+977 9841234567",
    shipping_address: "New Road, Ward 22",
    city: "Kathmandu",
    payment_method: "cash_on_delivery",
    status: "pending",
    subtotal: 4500,
    shipping_charge: 0,
    total: 4500,
    notes: "Please call 30 mins prior to delivery.",
    created_at: "2026-08-11T14:30:00Z",
    items: [
      {
        id: 1,
        order_id: 1001,
        product_id: 101,
        product_title: "Thermal Paper Roll 80mm x 80mm",
        product_sku: "TPR-8080",
        unit_price: 150,
        quantity: 30,
        subtotal: 4500,
      },
    ],
  },
  {
    id: 1002,
    user_id: null,
    customer_name: "Summit Supermarket",
    customer_email: "contact@summitsupermarket.com",
    customer_phone: "+977 9801987654",
    shipping_address: "Lalitpur Heights",
    city: "Patan",
    payment_method: "cash_on_delivery",
    status: "confirmed",
    subtotal: 12000,
    shipping_charge: 0,
    total: 12000,
    notes: "Leave at main receiving counter.",
    created_at: "2026-08-10T09:15:00Z",
    items: [
      {
        id: 2,
        order_id: 1002,
        product_id: 102,
        product_title: "POS Receipt Paper 57mm x 40mm",
        product_sku: "POS-5740",
        unit_price: 60,
        quantity: 200,
        subtotal: 12000,
      },
    ],
  },
  {
    id: 1003,
    user_id: 3,
    customer_name: "Himalayan Bakery",
    customer_email: "info@himalayanbakery.np",
    customer_phone: "+977 9811223344",
    shipping_address: "Lakeside Street 5",
    city: "Pokhara",
    payment_method: "cash_on_delivery",
    status: "delivered",
    subtotal: 7500,
    shipping_charge: 0,
    total: 7500,
    notes: null,
    created_at: "2026-08-08T11:00:00Z",
    items: [
      {
        id: 3,
        order_id: 1003,
        product_id: 101,
        product_title: "Thermal Paper Roll 80mm x 80mm",
        product_sku: "TPR-8080",
        unit_price: 150,
        quantity: 50,
        subtotal: 7500,
      },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDelete = (orderId: number) => {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      o.id.toString().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_email.toLowerCase().includes(query) ||
      o.customer_phone.toLowerCase().includes(query) ||
      o.city.toLowerCase().includes(query)
    );
  });

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
                <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-semibold rounded-full">
                  Placeholder API Ready
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage client orders, review details, and update fulfillment statuses.
              </p>
            </div>
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
                NPR {orders.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex overflow-x-auto gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition whitespace-nowrap ${
                    filter === tab
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">City</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No orders matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                          #{order.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{order.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{order.city}</td>
                        <td className="py-3.5 px-4 text-white font-bold">
                          NPR {order.total.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal View Details */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                      Order Overview
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
                    <span className="text-slate-200">{selectedOrder.shipping_address}, {selectedOrder.city}</span>
                  </div>
                </div>

                {/* Update Status Control */}
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order["status"])}
                    className="bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
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
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                      >
                        <div>
                          <div className="text-white font-semibold">{item.product_title}</div>
                          <div className="text-[10px] text-slate-500">SKU: {item.product_sku || "N/A"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-300">
                            {item.quantity} x NPR {item.unit_price}
                          </div>
                          <div className="text-cyan-400 font-bold">NPR {item.subtotal}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs">
                  <div className="text-slate-400">
                    Payment Method: <span className="text-white font-medium capitalize">{selectedOrder.payment_method.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Total Amount:</span>
                    <span className="text-xl font-black text-cyan-400">NPR {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
