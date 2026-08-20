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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📁 Case Studies &amp; Projects ({portfolioItems.length})
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

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading portfolio items...</p>
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="py-16 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80">
              <p className="text-base font-semibold text-slate-400 mb-1">No portfolio projects yet</p>
              <p className="text-xs text-slate-500 mb-4">Click &quot;Add New Project&quot; to publish your first case study.</p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition"
              >
                Add First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => {
                const img = getImageUrl(item.image);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition"
                  >
                    <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                      {img ? (
                        <EnhancedImage
                          src={img}
                          alt={item.title}
                          fill
                          className="object-cover"
                          containerClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <div
                          className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed [&_p]:m-0 [&_p]:inline"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono">ID #{item.id}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
