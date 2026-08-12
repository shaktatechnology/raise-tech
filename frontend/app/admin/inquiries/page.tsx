"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { ContactInquiry } from "@/lib/types";
import ProtectedRoute from "@/components/guards/ProtectedRoute";

export default function AdminInquiriesPage() {
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ contacts: ContactInquiry[] }>("/inquiries");
      setContacts(res.contacts || []);
    } catch (err: any) {
      if (err.status === 401) {
        setError("Unauthorized session. Please log in again as Admin.");
      } else {
        setError(err.message || "Failed to load inquiries.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleMarkAsRead = async (inquiry: ContactInquiry) => {
    if (inquiry.is_read) return;
    setActionLoading(inquiry.id);
    try {
      await fetchApi(`/inquiries/${inquiry.id}/read`, { method: "POST" });
      setContacts((prev) =>
        prev.map((item) =>
          item.id === inquiry.id ? { ...item, is_read: 1 } : item
        )
      );
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, is_read: 1 } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to mark inquiry as read.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact inquiry?")) return;
    setActionLoading(id);
    try {
      await fetchApi(`/inquiries/${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete inquiry.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (filter === "unread" && c.is_read !== 0) return false;
    if (filter === "read" && c.is_read !== 1) return false;

    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const fullName = `${c.first_name} ${c.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.contact_no.toLowerCase().includes(query) ||
      (c.message && c.message.toLowerCase().includes(query))
    );
  });

  const unreadCount = contacts.filter((c) => c.is_read === 0).length;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Contact Inquiries
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-xs rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage all user inquiry messages from the public contact page.
              </p>
            </div>

            <button
              onClick={loadInquiries}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition disabled:opacity-50 cursor-pointer"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : "text-slate-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Metric Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Inquiries</span>
              <p className="text-2xl font-bold text-white mt-1">{contacts.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Unread</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{unreadCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Read Messages</span>
              <p className="text-2xl font-bold text-slate-300 mt-1">{contacts.length - unreadCount}</p>
            </div>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
              {(["all", "unread", "read"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition ${
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

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Contact Table / List */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching contact inquiries...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-300">No Inquiries Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no messages matching your query.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Contact No</th>
                      <th className="py-3.5 px-4">Message Snippet</th>
                      <th className="py-3.5 px-4">Received At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredContacts.map((contact) => {
                      const isUnread = contact.is_read === 0;
                      return (
                        <tr
                          key={contact.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isUnread ? "bg-cyan-950/20 font-medium" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isUnread ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                Unread
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                                Read
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-white font-semibold whitespace-nowrap">
                            {contact.first_name} {contact.last_name || ""}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                            <a href={`mailto:${contact.email}`} className="hover:text-cyan-400">
                              {contact.email}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {contact.contact_no}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                            {contact.message || <span className="italic text-slate-600">No message</span>}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {contact.created_at
                              ? new Date(contact.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInquiry(contact);
                                if (contact.is_read === 0) {
                                  handleMarkAsRead(contact);
                                }
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition cursor-pointer"
                            >
                              View
                            </button>
                            {isUnread && (
                              <button
                                onClick={() => handleMarkAsRead(contact)}
                                disabled={actionLoading === contact.id}
                                className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                              >
                                Mark Read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(contact.id)}
                              disabled={actionLoading === contact.id}
                              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Detail View */}
          {selectedInquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">Inquiry Details</span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {selectedInquiry.first_name} {selectedInquiry.last_name || ""}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Received: {selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Email</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-cyan-400 font-medium hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Phone</span>
                    <a href={`tel:${selectedInquiry.contact_no}`} className="text-slate-200 font-medium">
                      {selectedInquiry.contact_no}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium block mb-1">Message:</span>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedInquiry.message || "No message content provided."}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Delete Inquiry
                  </button>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
