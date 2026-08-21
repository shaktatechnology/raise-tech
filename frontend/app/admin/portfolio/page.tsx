"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  fetchApi,
  getApiErrorMessage,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
import {
  createPortfolioItem,
  deletePortfolioItem,
  fetchPortfolioData,
  updatePortfolioItem,
} from "@/lib/portfolioApi";
import { useToast } from "@/context/ToastContext";
import RichTextEditor from "@/components/admin/RichTextEditor";
import EnhancedImage from "@/components/ui/EnhancedImage";

export interface PortfolioHeaderData {
  id: number;
  title: string | null;
  hero_image: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PortfolioItemData {
  id: number;
  title: string;
  image: string | null;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

const emptyItem: Partial<PortfolioItemData> = {
  title: "",
  image: "",
  description: "",
};

export default function AdminPortfolioPage() {
  const { toast } = useToast();

  const [headerData, setHeaderData] = useState<PortfolioHeaderData | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [supportsHeaderSettings, setSupportsHeaderSettings] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;
  const [viewingItem, setViewingItem] = useState<PortfolioItemData | null>(null);

  // Header state
  const [headerTitleInput, setHeaderTitleInput] = useState<string>("");
  const [headerHeroFile, setHeaderHeroFile] = useState<File | null>(null);
  const [removeHeaderHero, setRemoveHeaderHero] = useState(false);
  const [headerHeroError, setHeaderHeroError] = useState<string | undefined>();
  const [isSavingHeader, setIsSavingHeader] = useState<boolean>(false);
  const [isOptimizingHeaderImage, setIsOptimizingHeaderImage] = useState(false);

  // Portfolio item modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItemData> | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [removeItemImage, setRemoveItemImage] = useState(false);
  const [itemImageError, setItemImageError] = useState<string | undefined>();
  const [isSavingItem, setIsSavingItem] = useState<boolean>(false);
  const [isOptimizingItemImage, setIsOptimizingItemImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPortfolioData();

      if (res) {
        setHeaderData(res.header || null);
        setHeaderTitleInput(res.header?.title || "");
        setHeaderHeroFile(null);
        setRemoveHeaderHero(false);
        setHeaderHeroError(undefined);
        setPortfolioItems(res.portfolio || []);
        setSupportsHeaderSettings(res.supportsHeaderSettings);
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to load portfolio data."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadPortfolioData(), 0);
    return () => window.clearTimeout(id);
  }, [loadPortfolioData]);

  const filteredPortfolio = React.useMemo(() => {
    if (!searchTerm.trim()) return portfolioItems;
    const q = searchTerm.toLowerCase();
    return portfolioItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [portfolioItems, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPortfolio.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPortfolio = filteredPortfolio.slice(
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

  // Save Header
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
        header: PortfolioHeaderData;
      }>("/portfolio/header", {
        method: "POST",
        body: formData,
      });

      setHeaderData(resData.header);
      setHeaderTitleInput(resData.header.title || "");
      setHeaderHeroFile(null);
      setRemoveHeaderHero(false);
      toast.success(resData.message || "Portfolio header updated successfully.");
    } catch (err: unknown) {
      setHeaderHeroError(getValidationError(err, "hero_image"));
      toast.error(getApiErrorMessage(err, "Error updating portfolio header."));
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem({ ...emptyItem });
    setItemImageFile(null);
    setRemoveItemImage(false);
    setItemImageError(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItemData) => {
    setEditingItem({ ...item });
    setItemImageFile(null);
    setRemoveItemImage(false);
    setItemImageError(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setItemImageFile(null);
    setRemoveItemImage(false);
    setItemImageError(undefined);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || isSavingItem || isOptimizingItemImage) return;

    if (!editingItem.title?.trim()) {
      toast.error("Please provide a project title.");
      return;
    }
    if (!editingItem.description?.trim()) {
      toast.error("Please provide a project description.");
      return;
    }

    setIsSavingItem(true);
    setItemImageError(undefined);

    try {
      const formData = new FormData();
      formData.append("title", editingItem.title.trim());
      formData.append("description", editingItem.description);
      if (itemImageFile) formData.append("image", itemImageFile);
      formData.append("remove_image", removeItemImage ? "1" : "0");

      if (editingItem.id) {
        const res = await updatePortfolioItem<{
          message: string;
          data: PortfolioItemData;
        }>(editingItem.id, formData);
        toast.success(res.message || "Portfolio item updated successfully.");
      } else {
        const res = await createPortfolioItem<{
          message: string;
          data: PortfolioItemData;
        }>(formData);
        toast.success(res.message || "Portfolio item created successfully.");
      }

      handleCloseModal();
      await loadPortfolioData();
    } catch (err: unknown) {
      setItemImageError(getValidationError(err, "image"));
      toast.error(getApiErrorMessage(err, "Failed to save portfolio item."));
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this portfolio project?")) return;
    setIsDeleting(true);
    try {
      const res = await deletePortfolioItem<{ message: string }>(id);
      toast.success(res.message || "Portfolio item deleted.");
      await loadPortfolioData();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete portfolio item."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Portfolio Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage the public portfolio hero banner and project case study showcase.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Project
          </button>
        </div>

        {/* Section 1: Portfolio Hero Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            🖼️ Portfolio Page Hero Banner
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Configure the title and background hero image displayed on the Portfolio page.
          </p>

          {!supportsHeaderSettings && (
            <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              Portfolio projects are using the compatible homepage API. Banner settings will be
              available after the dedicated portfolio backend route is deployed.
            </p>
          )}

          <form onSubmit={handleSaveHeader} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Title Input */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={headerTitleInput}
                    onChange={(e) => setHeaderTitleInput(e.target.value)}
                    placeholder="e.g. Our Portfolio"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to use the default (&quot;Our Portfolio&quot;).
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-semibold text-slate-300">Banner specifications:</span>
                  <p>Recommended: 1920×600px. Supports PNG, JPG, WebP up to 10 MB.</p>
                </div>
              </div>

              {/* Hero Image Field */}
              <div className="lg:col-span-7">
                <AdminImageField
                  label="Hero Background Image"
                  existingImageUrl={getImageUrl(headerData?.hero_image ?? null) ?? undefined}
                  existingImageFilename={headerData?.hero_image ?? undefined}
                  existingImageAlt="Portfolio Hero Banner"
                  selectedFile={headerHeroFile}
                  onSelectFile={setHeaderHeroFile}
                  onClearSelection={() => setHeaderHeroFile(null)}
                  onProcessingChange={setIsOptimizingHeaderImage}
                  onRemoveExisting={() => setRemoveHeaderHero(true)}
                  onUndoRemoval={() => setRemoveHeaderHero(false)}
                  isExistingMarkedForRemoval={removeHeaderHero}
                  error={headerHeroError}
                  aspectRatioGuidance="16:5 (banner)"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={!supportsHeaderSettings || isSavingHeader || isOptimizingHeaderImage}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition shadow-sm cursor-pointer"
              >
                {isSavingHeader ? "Saving..." : "Save Banner Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Portfolio Case Studies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📁 Case Studies &amp; Projects
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Projects showcased on the homepage and the Portfolio page.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </button>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search projects by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredPortfolio.length}</span> projects
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading portfolio items...</p>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center w-14">S.No</th>
                    <th className="py-3 px-3">Project Details</th>
                    <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedPortfolio.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-500">
                        {portfolioItems.length === 0
                          ? "No portfolio projects yet."
                          : "No matching portfolio projects found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedPortfolio.map((item, index) => {
                      const serialNumber = startIndex + index + 1;
                      const img = getImageUrl(item.image);

                      return (
                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                            {serialNumber}
                          </td>
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {img ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={img}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-cyan-400 font-bold text-xs">
                                    PR
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-white text-sm truncate" title={item.title}>
                                  {item.title}
                                </div>
                                <div
                                  className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 [&_p]:m-0 [&_p]:inline"
                                  dangerouslySetInnerHTML={{ __html: item.description }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Button */}
                              <button
                                type="button"
                                onClick={() => setViewingItem(item)}
                                title="View Project Details"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                title="Edit Project"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={isDeleting}
                                title="Delete Project"
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
              {filteredPortfolio.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredPortfolio.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{filteredPortfolio.length}</span> projects
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
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
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                currentPage === page
                                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/50"
                                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      type="button"
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
        </div>

        {/* View Project Details Modal */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Project Case Study Details</h3>
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
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Project Title</span>
                  <p className="text-base font-bold text-white">{viewingItem.title}</p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Case Study Description</span>
                  <div
                    className="text-slate-300 leading-relaxed max-w-none prose prose-invert prose-xs"
                    dangerouslySetInnerHTML={{ __html: viewingItem.description }}
                  />
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
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && editingItem !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingItem.id ? "Edit Portfolio Project" : "Add New Portfolio Project"}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Gurkha Security Enterprise Portal"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                {/* Image */}
                <div>
                  <AdminImageField
                    label="Project Showcase Image"
                    existingImageUrl={getImageUrl(editingItem.image ?? null) ?? undefined}
                    existingImageFilename={editingItem.image ?? undefined}
                    existingImageAlt={editingItem.title || "Project Image"}
                    selectedFile={itemImageFile}
                    onSelectFile={setItemImageFile}
                    onClearSelection={() => setItemImageFile(null)}
                    onProcessingChange={setIsOptimizingItemImage}
                    onRemoveExisting={() => setRemoveItemImage(true)}
                    onUndoRemoval={() => setRemoveItemImage(false)}
                    isExistingMarkedForRemoval={removeItemImage}
                    error={itemImageError}
                    aspectRatioGuidance="16:9 (recommended)"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Case Study Description <span className="text-red-400">*</span>
                  </label>
                  <RichTextEditor
                    value={editingItem.description || ""}
                    onChange={(val) => setEditingItem({ ...editingItem, description: val })}
                    placeholder="Write about the project requirements, architecture, deliverables, and client outcomes..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingItem || isOptimizingItemImage}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl transition shadow-sm cursor-pointer"
                  >
                    {isSavingItem
                      ? "Saving..."
                      : editingItem.id
                      ? "Update Project"
                      : "Publish Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
