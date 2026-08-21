"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
import { SoftwareItem } from "@/lib/types";
import { useDeleteConfirmation } from "@/components/admin/DeleteConfirmation";

interface SoftwareSectionData {
  id: number;
  hero_image: string | null;
}

interface SoftwareIndexResponse {
  status: string;
  data: {
    section: SoftwareSectionData | null;
    items: SoftwareItem[];
  };
}

export default function AdminSoftwarePage() {
  const { toast } = useToast();
  const { confirmDelete } = useDeleteConfirmation();
  const [section, setSection] = useState<SoftwareSectionData | null>(null);
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;
  const [viewingItem, setViewingItem] = useState<SoftwareItem | null>(null);

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [removeHeroImage, setRemoveHeroImage] = useState(false);
  const [heroImageError, setHeroImageError] = useState<string>();
  const [uploadingHero, setUploadingHero] = useState(false);
  const [isOptimizingHeroImage, setIsOptimizingHeroImage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SoftwareItem> | null>(null);
  const [softwareImageFile, setSoftwareImageFile] = useState<File | null>(null);
  const [removeSoftwareImage, setRemoveSoftwareImage] = useState(false);
  const [softwareImageError, setSoftwareImageError] = useState<string>();
  const [isOptimizingSoftwareImage, setIsOptimizingSoftwareImage] = useState(false);

  const resetHeroImageDraft = () => {
    setHeroImageFile(null);
    setRemoveHeroImage(false);
    setHeroImageError(undefined);
  };

  const closeSoftwareModal = () => {
    if (actionLoading || isOptimizingSoftwareImage) return;
    setIsModalOpen(false);
    setEditingItem(null);
    setSoftwareImageFile(null);
    setRemoveSoftwareImage(false);
    setSoftwareImageError(undefined);
  };

  const loadSoftwareData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi<SoftwareIndexResponse>("/software");
      setSection(res.data?.section || null);
      setSoftwareList(res.data?.items || []);
      setHeroImageFile(null);
      setRemoveHeroImage(false);
      setHeroImageError(undefined);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to load software catalog.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSoftwareData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSoftwareData]);

  const filteredSoftware = React.useMemo(() => {
    if (!searchTerm.trim()) return softwareList;
    const q = searchTerm.toLowerCase();
    return softwareList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.slogan && item.slogan.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [softwareList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSoftware.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSoftware = filteredSoftware.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleUpdateHeroImage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploadingHero || isOptimizingHeroImage) return;
    if (!heroImageFile && !removeHeroImage) {
      toast.info("Choose a new hero image or mark the saved image for removal.");
      return;
    }

    setUploadingHero(true);
    setHeroImageError(undefined);

    try {
      const formData = new FormData();
      if (heroImageFile) formData.append("hero_image", heroImageFile);
      formData.append("remove_hero_image", removeHeroImage ? "1" : "0");

      const response = await fetchApi<{
        message: string;
        data: SoftwareSectionData;
      }>("/software/section", {
        method: "POST",
        body: formData,
      });

      setSection(response.data);
      resetHeroImageDraft();
      toast.success(response.message || "Software hero image updated successfully.");
    } catch (err: unknown) {
      setHeroImageError(getValidationError(err, "hero_image"));
      toast.error(getApiErrorMessage(err, "Error updating the software hero image."));
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSaveSoftware = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem?.title?.trim()) {
      toast.error("Software title is required.");
      return;
    }
    if (actionLoading || isOptimizingSoftwareImage) return;

    setActionLoading(true);
    setSoftwareImageError(undefined);

    try {
      const formData = new FormData();
      formData.append("title", editingItem.title.trim());
      if (editingItem.slogan) formData.append("slogan", editingItem.slogan.trim());
      if (editingItem.description) {
        formData.append("description", editingItem.description.trim());
      }
      formData.append("is_active", editingItem.is_active ? "1" : "0");
      if (softwareImageFile) formData.append("image", softwareImageFile);
      formData.append("remove_image", removeSoftwareImage ? "1" : "0");

      const endpoint = editingItem.id ? `/software/${editingItem.id}` : "/software";
      const response = await fetchApi<{ message: string; data: SoftwareItem }>(endpoint, {
        method: "POST",
        body: formData,
      });

      if (editingItem.id) {
        setSoftwareList((current) =>
          current.map((item) => (item.id === editingItem.id ? response.data : item))
        );
      } else {
        setSoftwareList((current) => [response.data, ...current]);
      }

      toast.success(response.message || "Software product saved successfully.");
      setIsModalOpen(false);
      setEditingItem(null);
      setSoftwareImageFile(null);
      setRemoveSoftwareImage(false);
    } catch (err: unknown) {
      setSoftwareImageError(getValidationError(err, "image"));
      toast.error(getApiErrorMessage(err, "Error saving the software product."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete({
      title: "Delete software product?",
      message: "This software product and its saved image will be permanently removed.",
      confirmLabel: "Delete product",
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetchApi<{ message: string }>(`/software/${id}`, {
        method: "DELETE",
      });
      setSoftwareList((current) => current.filter((item) => item.id !== id));
      toast.success(response.message || "Software product deleted successfully.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete the software product."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 pb-12 text-slate-100">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Software Products Catalog
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage pre-built software suites, POS platforms, and the software page hero banner.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadSoftwareData()}
                disabled={loading}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingItem({
                    title: "",
                    slogan: "",
                    description: "",
                    is_active: true,
                  });
                  setSoftwareImageFile(null);
                  setRemoveSoftwareImage(false);
                  setSoftwareImageError(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:bg-purple-500"
              >
                + Add Software Product
              </button>
            </div>
          </div>

          <form
            onSubmit={handleUpdateHeroImage}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                Software Page Hero Image Section
              </h2>
              {section?.hero_image && (
                <span className="text-xs text-slate-400">Current hero image set</span>
              )}
            </div>

            <AdminImageField
              label="Software hero image"
              existingImageUrl={getImageUrl(section?.hero_image)}
              existingImageFilename={getImageFilename(section?.hero_image)}
              existingImageAlt="Current software page hero"
              selectedFile={heroImageFile}
              onSelectFile={setHeroImageFile}
              onClearSelection={() => setHeroImageFile(null)}
              onProcessingChange={setIsOptimizingHeroImage}
              onRemoveExisting={() => setRemoveHeroImage(true)}
              onUndoRemoval={() => setRemoveHeroImage(false)}
              isExistingMarkedForRemoval={removeHeroImage}
              disabled={uploadingHero}
              error={heroImageError}
              aspectRatioGuidance="Recommended: a wide JPEG, PNG, or WebP banner. Files up to 10 MB are optimized before upload."
              accent="purple"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  uploadingHero ||
                  isOptimizingHeroImage ||
                  (!heroImageFile && !removeHeroImage)
                }
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isOptimizingHeroImage
                  ? "Optimizing Image..."
                  : uploadingHero
                    ? "Saving Hero Image..."
                    : "Save Hero Image"}
              </button>
            </div>
          </form>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search software by title, slogan, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredSoftware.length}</span> products
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="space-y-3 py-20 text-center text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <p className="text-xs">Fetching software products...</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center w-14">S.No</th>
                    <th className="py-3 px-3">Software Details</th>
                    <th className="py-3 px-3 w-24 text-center">Status</th>
                    <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedSoftware.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        {softwareList.length === 0
                          ? "No software products listed."
                          : "No matching software products found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedSoftware.map((software, index) => {
                      const serialNumber = startIndex + index + 1;
                      const imageSrc = getImageUrl(software.image);

                      return (
                        <tr key={software.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                            {serialNumber}
                          </td>
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {imageSrc ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={imageSrc}
                                    alt={software.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-purple-400 font-bold text-xs">
                                    SW
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-white text-sm truncate" title={software.title}>
                                  {software.title}
                                </div>
                                {software.slogan && (
                                  <div className="text-purple-300/90 text-[11px] font-medium truncate" title={software.slogan}>
                                    {software.slogan}
                                  </div>
                                )}
                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={software.description || ""}>
                                  {software.description || "No description provided."}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                                software.is_active
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800 text-slate-500 border-slate-700"
                              }`}
                            >
                              {software.is_active ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={() => setViewingItem(software)}
                                title="View Software Product"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(software);
                                  setSoftwareImageFile(null);
                                  setRemoveSoftwareImage(false);
                                  setSoftwareImageError(undefined);
                                  setIsModalOpen(true);
                                }}
                                title="Edit Software Product"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => void handleDelete(software.id)}
                                title="Delete Software Product"
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
              {filteredSoftware.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredSoftware.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{filteredSoftware.length}</span> products
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
                                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
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

          {/* View Software Details Modal */}
          {viewingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Software Product Details</h3>
                  <button
                    type="button"
                    onClick={() => setViewingItem(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {viewingItem.image && (
                    <div className="w-full h-48 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(viewingItem.image)}
                        alt={viewingItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Software Title</span>
                    <p className="text-base font-bold text-white">{viewingItem.title}</p>
                  </div>

                  {viewingItem.slogan && (
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Tagline / Slogan</span>
                      <p className="text-purple-300/90 font-medium">{viewingItem.slogan}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Description</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {viewingItem.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-bold">Status</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider mt-0.5 ${
                        viewingItem.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {viewingItem.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingItem(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingItem;
                      setViewingItem(null);
                      setEditingItem(toEdit);
                      setSoftwareImageFile(null);
                      setRemoveSoftwareImage(false);
                      setSoftwareImageError(undefined);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
              <form
                onSubmit={handleSaveSoftware}
                className="max-h-[92vh] w-full max-w-4xl space-y-5 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-xs shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white">
                    {editingItem?.id
                      ? `Edit Software #${editingItem.id}`
                      : "Add Software Product"}
                  </h2>
                  <button
                    type="button"
                    onClick={closeSoftwareModal}
                    disabled={actionLoading || isOptimizingSoftwareImage}
                    aria-label="Close software form"
                    className="text-base text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-slate-400">Software Title *</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.title || ""}
                      onChange={(event) =>
                        setEditingItem({ ...editingItem, title: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-slate-400">Slogan / Tagline</label>
                    <input
                      type="text"
                      value={editingItem?.slogan || ""}
                      onChange={(event) =>
                        setEditingItem({ ...editingItem, slogan: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <AdminImageField
                  label="Product image / logo"
                  existingImageUrl={getImageUrl(editingItem?.image)}
                  existingImageFilename={getImageFilename(editingItem?.image)}
                  existingImageAlt={editingItem?.title || "Current software product image"}
                  selectedFile={softwareImageFile}
                  onSelectFile={setSoftwareImageFile}
                  onClearSelection={() => setSoftwareImageFile(null)}
                  onProcessingChange={setIsOptimizingSoftwareImage}
                  onRemoveExisting={() => setRemoveSoftwareImage(true)}
                  onUndoRemoval={() => setRemoveSoftwareImage(false)}
                  isExistingMarkedForRemoval={removeSoftwareImage}
                  disabled={actionLoading}
                  error={softwareImageError}
                  aspectRatioGuidance="JPEG, PNG, or WebP up to 10 MB. Large images are optimized before upload."
                  accent="purple"
                />

                <div>
                  <label className="mb-1 block text-slate-400">Detailed Description</label>
                  <textarea
                    rows={4}
                    value={editingItem?.description || ""}
                    onChange={(event) =>
                      setEditingItem({ ...editingItem, description: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 pt-1 text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingItem?.is_active ?? true}
                    onChange={(event) =>
                      setEditingItem({ ...editingItem, is_active: event.target.checked })
                    }
                    className="h-4 w-4 rounded text-purple-500 focus:ring-purple-500"
                  />
                  <span>Active Software Product</span>
                </label>

                <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={closeSoftwareModal}
                    disabled={actionLoading || isOptimizingSoftwareImage}
                    className="rounded-xl bg-slate-800 px-4 py-2 font-semibold text-slate-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || isOptimizingSoftwareImage}
                    className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white shadow-lg hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isOptimizingSoftwareImage
                      ? "Optimizing Image..."
                      : actionLoading
                        ? "Saving Product..."
                        : "Save Product"}
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
