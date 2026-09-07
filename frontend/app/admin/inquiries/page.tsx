"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchApi, getApiErrorMessage } from "@/lib/api";
import { ContactInquiry } from "@/lib/types";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import { useDeleteConfirmation } from "@/components/admin/DeleteConfirmation";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AdminInquiriesPage() {
  const { showToast } = useToast();
  const { confirmDelete } = useDeleteConfirmation();
  const { settings: globalSettings, refetch: refetchGlobalSettings } = useSiteSettings();

  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Recipient Email State & Modal
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [savingEmail, setSavingEmail] = useState<boolean>(false);

  // Contact Page Dynamic Content Modal State
  const [showContentModal, setShowContentModal] = useState<boolean>(false);
  const [savingContent, setSavingContent] = useState<boolean>(false);
  const [contentForm, setContentForm] = useState({
    contact_eyebrow: "",
    contact_title: "",
    contact_description: "",
    company_name: "",
    location: "",
    operating_hours: "",
    operating_hours_note: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
  });

  // Sync global settings to contentForm
  useEffect(() => {
    if (globalSettings) {
      setContentForm({
        contact_eyebrow: globalSettings.contact_eyebrow || "Contact Raise Tech",
        contact_title: globalSettings.contact_title || "Let's Build Something Exceptional Together",
        contact_description:
          globalSettings.contact_description ||
          "Have a project in mind, need technical assistance, or want to discuss enterprise solutions? Our expert team is ready to help you succeed.",
        company_name: globalSettings.company_name || "Raise Tech Pvt. Ltd.",
        location: globalSettings.location || "Kathmandu, Nepal",
        operating_hours: globalSettings.operating_hours || "Sun - Fri: 9:00 AM - 6:00 PM (NPT)",
        operating_hours_note: globalSettings.operating_hours_note || "24/7 client portal access for critical issues.",
        phone1: globalSettings.phone1 || "+977-9844702792",
        phone2: globalSettings.phone2 || "015705475",
        email1: globalSettings.email1 || "info@raisetech.com.np",
        email2: globalSettings.email2 || "support@raisetech.com.np",
      });
    }
  }, [globalSettings]);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ contacts: ContactInquiry[] }>("/inquiries");
      setContacts(res.contacts || []);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to load inquiries.");
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadRecipientEmail = useCallback(async () => {
    try {
      const res = await fetchApi<{ recipient_email: string }>("/inquiries/notification-settings");
      if (res?.recipient_email) {
        setRecipientEmail(res.recipient_email);
        setEmailInput(res.recipient_email);
      }
    } catch {
      // Silently fall back to global settings email
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInquiries();
      void loadRecipientEmail();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadInquiries, loadRecipientEmail]);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      showToast("Please enter an email address.", "error");
      return;
    }
    setSavingEmail(true);
    try {
      const res = await fetchApi<{ message: string; settings: { recipient_email: string } }>(
        "/inquiries/notification-settings",
        {
          method: "POST",
          body: JSON.stringify({
            recipient_email: emailInput.trim(),
            is_enabled: true,
          }),
        }
      );
      setRecipientEmail(res.settings?.recipient_email || emailInput.trim());
      showToast(res.message || "Forwarding email updated successfully!", "success");
      setShowEmailModal(false);
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to update email address."), "error");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const formData = new FormData();
      formData.append("contact_eyebrow", contentForm.contact_eyebrow);
      formData.append("contact_title", contentForm.contact_title);
      formData.append("contact_description", contentForm.contact_description);
      formData.append("company_name", contentForm.company_name);
      formData.append("location", contentForm.location);
      formData.append("operating_hours", contentForm.operating_hours);
      formData.append("operating_hours_note", contentForm.operating_hours_note);
      formData.append("phone1", contentForm.phone1);
      formData.append("phone2", contentForm.phone2);
      formData.append("email1", contentForm.email1);
      formData.append("email2", contentForm.email2);

      await fetchApi("/settings", {
        method: "POST",
        body: formData,
      });

      await refetchGlobalSettings();
      showToast("Contact Page content updated successfully!", "success");
      setShowContentModal(false);
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to update Contact Page content."), "error");
    } finally {
      setSavingContent(false);
    }
  };

  const handleToggleStatus = async (inquiry: ContactInquiry) => {
    const newStatus = inquiry.is_read === 0 ? 1 : 0;
    setActionLoading(inquiry.id);
    try {
      await fetchApi(`/inquiries/${inquiry.id}/toggle-status`, { method: "POST" });
      setContacts((prev) =>
        prev.map((item) =>
          item.id === inquiry.id ? { ...item, is_read: newStatus } : item
        )
      );
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, is_read: newStatus } : null));
      }
      showToast(newStatus === 1 ? "Inquiry marked as read." : "Inquiry marked as unread.", "success");
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to update inquiry status."), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsRead = async (inquiry: ContactInquiry) => {
    if (inquiry.is_read) return;
    await handleToggleStatus(inquiry);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete({
      title: "Delete inquiry?",
      message: "This contact inquiry will be permanently removed. This action cannot be undone.",
      confirmLabel: "Delete inquiry",
    });
    if (!confirmed) return;
    setActionLoading(id);
    try {
      await fetchApi(`/inquiries/${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
      showToast("Inquiry deleted successfully.", "success");
    } catch (err: unknown) {
      showToast(getApiErrorMessage(err, "Failed to delete inquiry."), "error");
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
                Manage user messages and customize live Contact Page content.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Button: Edit Contact Page Content */}
              <button
                onClick={() => setShowContentModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Contact Page Content</span>
              </button>

              {/* Refresh Button */}
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

          {/* Controls: Search & Filter */}
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

            {/* Right Group: Edit Email Button (placed exactly as requested) & Status Filter */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              {/* Edit Email Button */}
              <button
                type="button"
                onClick={() => {
                  setEmailInput(recipientEmail);
                  setShowEmailModal(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-slate-200 transition cursor-pointer shadow-sm shrink-0"
                title="Edit Gmail/admin address where inquiries are forwarded"
              >
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Edit Email</span>
                {recipientEmail && (
                  <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40 hidden md:inline-block max-w-[150px] truncate">
                    {recipientEmail}
                  </span>
                )}
              </button>

              {/* Status Filter */}
              <label className="w-full sm:w-48">
                <span className="sr-only">Filter inquiries by read status</span>
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as "all" | "unread" | "read")
                  }
                  className="w-full cursor-pointer rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold capitalize text-slate-200 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="all">All inquiries</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </label>
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
                <table className="w-full table-fixed text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-2 w-10 text-center">S.No</th>
                      <th className="py-3 px-2 w-20 text-center">Status</th>
                      <th className="py-3 px-2.5 w-[14%]">Name</th>
                      <th className="py-3 px-2.5 w-[20%]">Email</th>
                      <th className="py-3 px-2.5 w-[12%]">Contact No</th>
                      <th className="py-3 px-2.5">Message Snippet</th>
                      <th className="py-3 px-2.5 w-[14%]">Received At</th>
                      <th className="py-3 px-2 w-24 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredContacts.map((contact, index) => {
                      const isUnread = contact.is_read === 0;
                      return (
                        <tr
                          key={contact.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isUnread ? "bg-cyan-950/20 font-medium" : ""
                          }`}
                        >
                          <td className="py-3 px-2 text-center text-slate-500 font-mono text-[11px]">
                            {index + 1}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(contact)}
                              disabled={actionLoading === contact.id}
                              title={isUnread ? "Click to mark as Read" : "Click to mark as Unread"}
                              className="group inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                              {isUnread ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition shadow-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  Unread
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition">
                                  <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Read
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-2.5 text-white font-semibold truncate" title={`${contact.first_name} ${contact.last_name || ""}`}>
                            {contact.first_name} {contact.last_name || ""}
                          </td>
                          <td className="py-3 px-2.5 text-slate-300 truncate" title={contact.email}>
                            <a href={`mailto:${contact.email}`} className="hover:text-cyan-400 transition block truncate">
                              {contact.email}
                            </a>
                          </td>
                          <td className="py-3 px-2.5 text-slate-400 font-mono text-[11px] truncate" title={contact.contact_no}>
                            {contact.contact_no}
                          </td>
                          <td className="py-3 px-2.5 text-slate-400 truncate" title={contact.message || "No message"}>
                            {contact.message || <span className="italic text-slate-600">No message</span>}
                          </td>
                          <td className="py-3 px-2.5 text-slate-400">
                            {contact.created_at ? (
                              <div className="flex flex-col leading-tight">
                                <span className="text-slate-300 text-[11px] font-medium whitespace-nowrap">
                                  {new Date(contact.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {new Date(contact.created_at).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {/* Toggle Read/Unread Quick Button */}
                              <button
                                onClick={() => handleToggleStatus(contact)}
                                disabled={actionLoading === contact.id}
                                title={isUnread ? "Mark as Read" : "Mark as Unread"}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer disabled:opacity-50 shadow-sm"
                              >
                                {isUnread ? (
                                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>
                              {/* Eye Icon / Details Button */}
                              <button
                                onClick={() => {
                                  setSelectedInquiry(contact);
                                  if (contact.is_read === 0) {
                                    handleMarkAsRead(contact);
                                  }
                                }}
                                title="View Details"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {/* Trash Icon / Delete Button */}
                              <button
                                onClick={() => handleDelete(contact.id)}
                                disabled={actionLoading === contact.id}
                                title="Delete Inquiry"
                                className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer disabled:opacity-50 shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal: Edit Forwarding Email (triggered by "Edit Email" button) */}
          {showEmailModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                      Email Forwarding
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Edit Admin Email
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  New contact inquiry submissions will be automatically forwarded to this Gmail address.
                </p>

                <form onSubmit={handleSaveEmail} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Admin Gmail / Recipient Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. admin@gmail.com"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEmail}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {savingEmail && (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      <span>{savingEmail ? "Saving..." : "Save Email"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Contact Page Dynamic Content */}
          {showContentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold">
                      Website Customization
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      Edit Contact Page Content
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowContentModal(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSaveContent} className="space-y-4 text-xs">
                  {/* Hero Section */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                      Hero Banner
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Eyebrow Badge</label>
                        <input
                          type="text"
                          value={contentForm.contact_eyebrow}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, contact_eyebrow: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Contact Raise Tech"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Hero Title</label>
                        <input
                          type="text"
                          value={contentForm.contact_title}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, contact_title: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Let's Build Something Exceptional Together"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1">Hero Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={contentForm.contact_description}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, contact_description: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Have a project in mind, need technical assistance, or want to discuss enterprise solutions?..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Headquarters & Hours */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                      Headquarters & Operating Hours
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Company / Headquarters Name</label>
                        <input
                          type="text"
                          value={contentForm.company_name}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, company_name: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Raise Tech Pvt. Ltd."
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Location Address</label>
                        <input
                          type="text"
                          value={contentForm.location}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, location: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Kathmandu, Nepal"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Operating Hours</label>
                        <input
                          type="text"
                          value={contentForm.operating_hours}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, operating_hours: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Sun - Fri: 9:00 AM - 6:00 PM (NPT)"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Operating Hours Secondary Note</label>
                        <input
                          type="text"
                          value={contentForm.operating_hours_note}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, operating_hours_note: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. 24/7 client portal access for critical issues."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Channels */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                      Contact Numbers & Email
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Primary Phone</label>
                        <input
                          type="text"
                          value={contentForm.phone1}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, phone1: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. +977-9844702792"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Secondary Phone</label>
                        <input
                          type="text"
                          value={contentForm.phone2}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, phone2: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. 015705475"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Primary Email</label>
                        <input
                          type="email"
                          value={contentForm.email1}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, email1: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. info@raisetech.com.np"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Support Email</label>
                        <input
                          type="email"
                          value={contentForm.email2}
                          onChange={(e) =>
                            setContentForm({ ...contentForm, email2: e.target.value })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. support@raisetech.com.np"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowContentModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingContent}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      {savingContent && (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      <span>{savingContent ? "Saving Content..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detail View */}
          {selectedInquiry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
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

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => handleToggleStatus(selectedInquiry)}
                    disabled={actionLoading === selectedInquiry.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {selectedInquiry.is_read === 0 ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Mark as Read</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Mark as Unread</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3">
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
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
