"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export interface ServiceHeaderData {
  id: number;
  title: string | null;
  hero_image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceData {
  id: number;
  title: string;
  slogan: string | null;
  image: string | null;
  description: string;
  order: number;
  is_active: boolean | number;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function AdminServicesPage() {
  const { toast } = useToast();

  const [headerData, setHeaderData] = useState<ServiceHeaderData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Header update state
  const [headerTitleInput, setHeaderTitleInput] = useState<string>("");
  const [headerHeroFile, setHeaderHeroFile] = useState<File | null>(null);
  const [isSavingHeader, setIsSavingHeader] = useState<boolean>(false);

  // Modal / Form state for Service create/edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Partial<ServiceData> | null>(null);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [isSavingService, setIsSavingService] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{
        header: ServiceHeaderData | null;
        services: ServiceData[];
      }>("/services");

      if (res) {
        setHeaderData(res.header || null);
        setHeaderTitleInput(res.header?.title || "");
        setServices(res.services || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      setError(err.message || "Failed to load services data.");
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/storage/")) return `http://localhost:8000${path}`;
    if (path.startsWith("storage/")) return `http://localhost:8000/${path}`;
    if (path.startsWith("/")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/storage/${path}`;
  };

  // POST /api/services/header (multipart/form-data)
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHeader(true);
    try {
      const formData = new FormData();
      if (headerTitleInput) formData.append("title", headerTitleInput);
      if (headerHeroFile) formData.append("hero_image", headerHeroFile);

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch("http://localhost:8000/api/services/header", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to update service header.");
      }

      setHeaderData(resData.header);
      setHeaderHeroFile(null);
      toast.success(resData.message || "Service header updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Error updating service header.");
    } finally {
      setIsSavingHeader(false);
    }
  };

  // Save Service (Create / Update)
  // Store: POST /api/services (multipart/form-data)
  // Update: POST /api/services/{id} (multipart/form-data)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title?.trim() || !editingService?.description?.trim()) {
      toast.error("Service Title and Description are required.");
      return;
    }

    setIsSavingService(true);
    try {
      const formData = new FormData();
      formData.append("title", editingService.title.trim());
      if (editingService.slogan) formData.append("slogan", editingService.slogan.trim());
      formData.append("description", editingService.description.trim());
      if (editingService.order !== undefined && editingService.order !== null) {
        formData.append("order", String(editingService.order));
      }
      formData.append("is_active", editingService.is_active ? "1" : "0");
      if (serviceImageFile) {
        formData.append("image", serviceImageFile);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const url = editingService.id
        ? `http://localhost:8000/api/services/${editingService.id}`
        : `http://localhost:8000/api/services`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to save service.");
      }

      const savedService: ServiceData = resData.service;
      const successMessage = resData.message || (editingService.id ? "Service updated successfully." : "Service created successfully.");

      if (editingService.id) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? savedService : s))
        );
      } else {
        setServices((prev) => [...prev, savedService]);
      }

      toast.success(successMessage);
      setIsModalOpen(false);
      setEditingService(null);
      setServiceImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Error saving service.");
    } finally {
      setIsSavingService(false);
    }
  };

  // DELETE /api/services/{id}
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service offering?")) return;
    setIsDeleting(true);
    try {
      const res = await fetchApi<{ message: string }>(`/services/${id}`, {
        method: "DELETE",
      });

      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success(res.message || "Service deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Services Management
                </h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage service offerings, tagline descriptions, display order, and banner hero headers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadServices}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold transition"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingService({
                    title: "",
                    slogan: "",
                    description: "",
                    order: services.length + 1,
                    is_active: true,
                  });
                  setServiceImageFile(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950/40 transition cursor-pointer"
              >
                + Add New Service
              </button>
            </div>
          </div>

          {/* Service Page Header Settings Banner */}
          <form
            onSubmit={handleSaveHeader}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Services Page Banner Header Settings
              </h3>
              {headerData?.hero_image && (
                <span className="text-xs text-slate-400">
                  Current Banner Image Set
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Services Hero Title
                </label>
                <input
                  type="text"
                  value={headerTitleInput}
                  onChange={(e) => setHeaderTitleInput(e.target.value)}
                  placeholder="e.g. Empowering Enterprise Solutions & Paper Distribution"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Hero Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHeaderHeroFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {headerData?.hero_image && (
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
                <span>Existing Banner Preview:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(headerData.hero_image) || ""}
                  alt="Service Header"
                  className="h-12 w-28 object-cover rounded-lg border border-slate-800"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingHeader}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingHeader ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Header...
                  </>
                ) : (
                  "Save Banner Header"
                )}
              </button>
            </div>
          </form>

          {/* Loading & Error States */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading services from database...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
              {error}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              No services found. Click &quot;+ Add New Service&quot; above to create one.
            </div>
          ) : (
            /* Service Items Grid */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((item) => {
                const isActive = Boolean(item.is_active);
                const imageUrl = getImageUrl(item.image);

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition overflow-hidden"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                          #{item.order}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      {/* Image Preview */}
                      {imageUrl && (
                        <div className="mb-4 w-full h-36 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      {item.slogan && (
                        <p className="text-amber-300/80 text-xs font-medium mb-2">{item.slogan}</p>
                      )}
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setEditingService({
                            ...item,
                            is_active: Boolean(item.is_active),
                          });
                          setServiceImageFile(null);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs font-medium transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveService}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingService?.id ? "Edit Service Offering" : "Add Service Offering"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Service Title *</label>
                    <input
                      type="text"
                      required
                      value={editingService?.title || ""}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      placeholder="e.g. Thermal Paper Roll Manufacturing"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={editingService?.slogan || ""}
                      onChange={(e) => setEditingService({ ...editingService, slogan: e.target.value })}
                      placeholder="e.g. Premium thermal paper rolls for POS billing."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={editingService?.description || ""}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      placeholder="Describe the service offering details..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Service Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setServiceImageFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                    />
                    {editingService?.image && !serviceImageFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Current Image:</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(editingService.image) || ""}
                          alt="Current"
                          className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Display Order</label>
                      <input
                        type="number"
                        min={1}
                        value={editingService?.order ?? 1}
                        onChange={(e) => setEditingService({ ...editingService, order: Number(e.target.value) })}
                        className="w-24 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={Boolean(editingService?.is_active ?? true)}
                        onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active on website</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingService ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Service"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
