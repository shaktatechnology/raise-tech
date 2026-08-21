"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
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
  const [removeHeaderHero, setRemoveHeaderHero] = useState(false);
  const [headerHeroError, setHeaderHeroError] = useState<string>();
  const [isSavingHeader, setIsSavingHeader] = useState<boolean>(false);
  const [isOptimizingHeaderImage, setIsOptimizingHeaderImage] = useState(false);

  // Modal / Form state for Service create/edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Partial<ServiceData> | null>(null);
  const [viewingService, setViewingService] = useState<ServiceData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 5;

  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [removeServiceImage, setRemoveServiceImage] = useState(false);
  const [serviceImageError, setServiceImageError] = useState<string>();
  const [isSavingService, setIsSavingService] = useState<boolean>(false);
  const [isOptimizingServiceImage, setIsOptimizingServiceImage] = useState(false);
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
        setHeaderHeroFile(null);
        setRemoveHeaderHero(false);
        setHeaderHeroError(undefined);
        setServices(res.services || []);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch services:", err);
      const message = getApiErrorMessage(err, "Failed to load services data.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadServices(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadServices]);

  const filteredServices = React.useMemo(() => {
    if (!searchTerm.trim()) return services;
    const q = searchTerm.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.slogan && s.slogan.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // POST /api/services/header (multipart/form-data)
  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingHeader || isOptimizingHeaderImage) return;
    setIsSavingHeader(true);
    setHeaderHeroError(undefined);
    try {
      const formData = new FormData();
      formData.append("title", headerTitleInput.trim());
      if (headerHeroFile) formData.append("hero_image", headerHeroFile);
      formData.append("remove_hero_image", removeHeaderHero ? "1" : "0");

      const resData = await fetchApi<{
        message: string;
        header: ServiceHeaderData;
      }>("/services/header", {
        method: "POST",
        body: formData,
      });

      setHeaderData(resData.header);
      setHeaderTitleInput(resData.header.title || "");
      setHeaderHeroFile(null);
      setRemoveHeaderHero(false);
      toast.success(resData.message || "Service header updated successfully.");
    } catch (err: unknown) {
      setHeaderHeroError(getValidationError(err, "hero_image"));
      toast.error(getApiErrorMessage(err, "Error updating service header."));
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
    if (isSavingService || isOptimizingServiceImage) return;

    setIsSavingService(true);
    setServiceImageError(undefined);
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
      formData.append("remove_image", removeServiceImage ? "1" : "0");

      const endpoint = editingService.id
        ? `/services/${editingService.id}`
        : `/services`;

      const resData = await fetchApi<{ message: string; service: ServiceData }>(endpoint, {
        method: "POST",
        body: formData,
      });

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
      setRemoveServiceImage(false);
    } catch (err: unknown) {
      setServiceImageError(getValidationError(err, "image"));
      toast.error(getApiErrorMessage(err, "Error saving service."));
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete service."));
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
                  setRemoveServiceImage(false);
                  setServiceImageError(undefined);
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

            <div>
              <div>
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
            </div>

            <AdminImageField
              label="Services hero image"
              existingImageUrl={getImageUrl(headerData?.hero_image)}
              existingImageFilename={getImageFilename(headerData?.hero_image)}
              existingImageAlt="Current saved Services page hero"
              selectedFile={headerHeroFile}
              onSelectFile={(file) => {
                setHeaderHeroFile(file);
                setRemoveHeaderHero(false);
                setHeaderHeroError(undefined);
              }}
              onClearSelection={() => setHeaderHeroFile(null)}
              onProcessingChange={setIsOptimizingHeaderImage}
              onRemoveExisting={() => setRemoveHeaderHero(true)}
              onUndoRemoval={() => setRemoveHeaderHero(false)}
              isExistingMarkedForRemoval={removeHeaderHero}
              disabled={isSavingHeader}
              error={headerHeroError}
              aspectRatioGuidance="Recommended: a wide JPEG, PNG, or WebP source image."
              accent="amber"
            />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingHeader || isOptimizingHeaderImage}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isOptimizingHeaderImage ? (
                  "Optimizing image…"
                ) : isSavingHeader ? (
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

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search services by title, slogan, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredServices.length}</span> services
            </div>
          </div>

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
          ) : (
            /* Services Table */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center w-14">S.No</th>
                    <th className="py-3 px-3">Service Details</th>
                    <th className="py-3 px-3 w-20 text-center">Order</th>
                    <th className="py-3 px-3 w-24 text-center">Status</th>
                    <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedServices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        {services.length === 0
                          ? 'No services found. Click "+ Add New Service" above to create one.'
                          : 'No matching services found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedServices.map((item, index) => {
                      const serialNumber = startIndex + index + 1;
                      const isActive = Boolean(item.is_active);
                      const imageUrl = getImageUrl(item.image);

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                            {serialNumber}
                          </td>
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-amber-400 font-bold text-xs">
                                    {item.title.substring(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-white text-sm truncate" title={item.title}>
                                  {item.title}
                                </div>
                                {item.slogan && (
                                  <div className="text-amber-400/90 text-[11px] font-medium truncate" title={item.slogan}>
                                    {item.slogan}
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={item.description}>
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-amber-400 font-bold text-xs">
                              #{item.order}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                                isActive
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800 text-slate-500 border-slate-700"
                              }`}
                            >
                              {isActive ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Button */}
                              <button
                                onClick={() => setViewingService(item)}
                                title="View Service Details"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => {
                                  setEditingService({
                                    ...item,
                                    is_active: Boolean(item.is_active),
                                  });
                                  setServiceImageFile(null);
                                  setRemoveServiceImage(false);
                                  setServiceImageError(undefined);
                                  setIsModalOpen(true);
                                }}
                                title="Edit Service"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                                title="Delete Service"
                                className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer disabled:opacity-50 shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredServices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredServices.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{filteredServices.length}</span> services
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      ‹ Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && page - prev > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                currentPage === page
                                  ? "bg-amber-600 text-white shadow-md shadow-amber-950/50"
                                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Service Details Modal */}
          {viewingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Service Details</span>
                    <span className="text-xs font-mono font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      #{viewingService.order}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {viewingService.image && (
                    <div className="w-full h-48 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(viewingService.image)}
                        alt={viewingService.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Title</span>
                    <p className="text-base font-bold text-white">{viewingService.title}</p>
                  </div>

                  {viewingService.slogan && (
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Tagline / Slogan</span>
                      <p className="text-amber-400/90 font-medium">{viewingService.slogan}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Description</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{viewingService.description}</p>
                  </div>

                  <div className="flex items-center gap-6 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Display Order</span>
                      <span className="text-white font-mono font-bold">#{viewingService.order}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-bold">Status</span>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider mt-0.5 ${
                          viewingService.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {viewingService.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingService;
                      setViewingService(null);
                      setEditingService({
                        ...toEdit,
                        is_active: Boolean(toEdit.is_active),
                      });
                      setServiceImageFile(null);
                      setRemoveServiceImage(false);
                      setServiceImageError(undefined);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Service
                  </button>
                </div>
              </div>
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
                    disabled={isSavingService || isOptimizingServiceImage}
                    onClick={() => {
                      setIsModalOpen(false);
                      setServiceImageFile(null);
                      setRemoveServiceImage(false);
                      setServiceImageError(undefined);
                    }}
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

                  <AdminImageField
                    label="Service image"
                    existingImageUrl={getImageUrl(editingService?.image)}
                    existingImageFilename={getImageFilename(editingService?.image)}
                    existingImageAlt={`Current saved image for ${
                      editingService?.title || "this service"
                    }`}
                    selectedFile={serviceImageFile}
                    onSelectFile={(file) => {
                      setServiceImageFile(file);
                      setRemoveServiceImage(false);
                      setServiceImageError(undefined);
                    }}
                    onClearSelection={() => setServiceImageFile(null)}
                    onProcessingChange={setIsOptimizingServiceImage}
                    onRemoveExisting={() => setRemoveServiceImage(true)}
                    onUndoRemoval={() => setRemoveServiceImage(false)}
                    isExistingMarkedForRemoval={removeServiceImage}
                    disabled={isSavingService || isOptimizingServiceImage}
                    error={serviceImageError}
                    aspectRatioGuidance="JPEG, PNG, or WebP source image."
                    accent="amber"
                  />

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
                    disabled={isSavingService || isOptimizingServiceImage}
                    onClick={() => {
                      setIsModalOpen(false);
                      setServiceImageFile(null);
                      setRemoveServiceImage(false);
                      setServiceImageError(undefined);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService || isOptimizingServiceImage}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {isOptimizingServiceImage ? (
                      "Optimizing image…"
                    ) : isSavingService ? (
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
