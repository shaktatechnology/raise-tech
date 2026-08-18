"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  fetchApi,
  getApiErrorMessage,
  getImageUrl as resolveImageUrl,
  getValidationError,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  MAX_IMAGE_SOURCE_BYTES,
  optimizeImageForUpload,
  type OptimizedImageResult,
} from "@/lib/imageCompression";

export interface AboutSettingsData {
  id?: number;
  hero_image: string | null;
  about_description: string | null;
  about_image: string | null;
  what_we_do_image: string | null;
  mission: string | null;
  vision: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WhatWeDoItemData {
  id: number;
  title: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WhyChooseUsItemData {
  id: number;
  name: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Resolve a stored image path (e.g. "/storage/about/xyz.png") into a full URL.
function getImageUrl(path: string | null): string | null {
  return resolveImageUrl(path) || null;
}

interface ImageDropzoneProps {
  label: string;
  file: File | null;
  existingUrl: string | null;
  onFileSelect: (file: File | null) => void;
  onProcessingChange: (processing: boolean) => void;
  isMarkedForRemoval: boolean;
  onRemoveExisting: () => void;
  onUndoRemoval: () => void;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageDropzone({
  label,
  file,
  existingUrl,
  onFileSelect,
  onProcessingChange,
  isMarkedForRemoval,
  onRemoveExisting,
  onUndoRemoval,
  error,
}: ImageDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string>();
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizedImageResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const selectionRunRef = React.useRef(0);

  useEffect(() => {
    if (!file) {
      // Synchronize the controlled File prop with the browser-owned preview state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const displayUrl = previewUrl || existingUrl;

  useEffect(
    () => () => {
      selectionRunRef.current += 1;
      onProcessingChange(false);
    },
    [onProcessingChange]
  );

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const picked = fileList[0];
    const selectionRun = selectionRunRef.current + 1;
    selectionRunRef.current = selectionRun;
    setOptimizationError(undefined);
    setOptimizationResult(null);
    setIsOptimizing(true);
    onProcessingChange(true);

    try {
      const result = await optimizeImageForUpload(picked);
      if (selectionRunRef.current !== selectionRun) return;
      setOptimizationResult(result);
      if (isMarkedForRemoval) onUndoRemoval();
      onFileSelect(result.file);
    } catch (error: unknown) {
      if (selectionRunRef.current !== selectionRun) return;
      setOptimizationError(
        error instanceof Error
          ? error.message
          : "The selected image could not be optimized."
      );
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      if (selectionRunRef.current === selectionRun) {
        setIsOptimizing(false);
        onProcessingChange(false);
      }
    }
  };

  return (
    <div>
      <label className="block text-slate-400 mb-1">{label}</label>
      <div
        onClick={() => {
          if (!isOptimizing) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragActive(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`relative w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
          isDragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-slate-800 bg-slate-950 hover:border-slate-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isOptimizing}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />

        {displayUrl ? (
          <div className="relative h-36 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={label}
              className={`w-full h-full object-cover ${
                isMarkedForRemoval && !file ? "opacity-30 grayscale" : ""
              }`}
            />
            <div className="absolute inset-0 bg-slate-950/0 hover:bg-slate-950/50 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-[11px] font-semibold text-white">Click or drop to replace</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                selectionRunRef.current += 1;
                setIsOptimizing(false);
                onProcessingChange(false);
                setOptimizationError(undefined);
                setOptimizationResult(null);
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-rose-600 text-xs font-bold"
              aria-label={`Clear ${label}`}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-1.5 text-center px-3">
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 8a2 2 0 012-2h12a2 2 0 012 2M4 8a2 2 0 002 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 002-2"
              />
            </svg>
            <p className="text-slate-500 text-[11px] leading-snug">
              {isOptimizing
                ? "Optimizing image..."
                : "Drag & drop an image, or click to choose a file"}
            </p>
          </div>
        )}
      </div>
      {file && (
        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
          <p className="truncate">{file.name} ({formatFileSize(file.size)})</p>
          {optimizationResult?.optimized && (
            <p className="font-medium text-emerald-400">
              Optimized from {formatFileSize(optimizationResult.originalSize)} to{" "}
              {formatFileSize(file.size)} before upload.
            </p>
          )}
        </div>
      )}
      {!file && !optimizationError && (
        <p className="mt-1 text-[11px] text-slate-500">
          JPEG, PNG, or WebP up to {Math.round(MAX_IMAGE_SOURCE_BYTES / (1024 * 1024))} MB.
        </p>
      )}
      {optimizationError && (
        <p role="alert" className="mt-1 text-[11px] text-red-400">
          {optimizationError}
        </p>
      )}
      {error && !optimizationError && (
        <p role="alert" className="mt-1 text-[11px] text-red-400">
          {error}
        </p>
      )}
      {existingUrl && !file && (
        <div className="mt-2 flex justify-end">
          {isMarkedForRemoval ? (
            <button
              type="button"
              onClick={onUndoRemoval}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
            >
              Undo removal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Mark this saved image for removal when About settings are saved?")) {
                  onRemoveExisting();
                }
              }}
              className="rounded-lg border border-red-800/70 bg-red-950/60 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-900/70"
            >
              Remove saved image
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminAboutPage() {
  const { toast } = useToast();

  const [aboutSettings, setAboutSettings] = useState<AboutSettingsData>({
    hero_image: "",
    about_description: "",
    about_image: "",
    what_we_do_image: "",
    mission: "",
    vision: "",
  });

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [whatWeDoImageFile, setWhatWeDoImageFile] = useState<File | null>(null);
  const [isOptimizingHeroImage, setIsOptimizingHeroImage] = useState(false);
  const [isOptimizingAboutImage, setIsOptimizingAboutImage] = useState(false);
  const [isOptimizingWhatWeDoImage, setIsOptimizingWhatWeDoImage] = useState(false);
  const isOptimizingAnyImage =
    isOptimizingHeroImage || isOptimizingAboutImage || isOptimizingWhatWeDoImage;
  const [removeHeroImage, setRemoveHeroImage] = useState(false);
  const [removeAboutImage, setRemoveAboutImage] = useState(false);
  const [removeWhatWeDoImage, setRemoveWhatWeDoImage] = useState(false);
  const [heroImageError, setHeroImageError] = useState<string>();
  const [aboutImageError, setAboutImageError] = useState<string>();
  const [whatWeDoImageError, setWhatWeDoImageError] = useState<string>();

  type AboutTab = "company-info" | "what-we-do" | "why-choose-us";
  const [activeTab, setActiveTab] = useState<AboutTab>("company-info");

  const [whatWeDoItems, setWhatWeDoItems] = useState<WhatWeDoItemData[]>([]);
  const [whyChooseUsItems, setWhyChooseUsItems] = useState<WhyChooseUsItemData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Modals for adding/editing sub-items
  const [isWhatWeDoModalOpen, setIsWhatWeDoModalOpen] = useState<boolean>(false);
  const [editingWhatWeDoId, setEditingWhatWeDoId] = useState<number | null>(null);
  const [newWhatWeDo, setNewWhatWeDo] = useState({ title: "", description: "" });
  const [isAddingWhatWeDo, setIsAddingWhatWeDo] = useState<boolean>(false);

  const [isWhyChooseUsModalOpen, setIsWhyChooseUsModalOpen] = useState<boolean>(false);
  const [editingWhyChooseUsId, setEditingWhyChooseUsId] = useState<number | null>(null);
  const [newWhyChooseUs, setNewWhyChooseUs] = useState({ name: "", description: "" });
  const [isAddingWhyChooseUs, setIsAddingWhyChooseUs] = useState<boolean>(false);

  // Load GET /api/about
  const loadAboutData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{
        status: string;
        data: {
          about: AboutSettingsData | null;
          what_we_do_items: WhatWeDoItemData[];
          why_choose_us_items: WhyChooseUsItemData[];
        };
      }>("/about");

      if (res && res.data) {
        if (res.data.about) {
          setAboutSettings({
            hero_image: res.data.about.hero_image || "",
            about_description: res.data.about.about_description || "",
            about_image: res.data.about.about_image || "",
            what_we_do_image: res.data.about.what_we_do_image || "",
            mission: res.data.about.mission || "",
            vision: res.data.about.vision || "",
          });
        }
        setWhatWeDoItems(res.data.what_we_do_items || []);
        setWhyChooseUsItems(res.data.why_choose_us_items || []);
        setHeroImageFile(null);
        setAboutImageFile(null);
        setWhatWeDoImageFile(null);
        setRemoveHeroImage(false);
        setRemoveAboutImage(false);
        setRemoveWhatWeDoImage(false);
        setHeroImageError(undefined);
        setAboutImageError(undefined);
        setWhatWeDoImageError(undefined);
      }
    } catch (err: unknown) {
      console.error("Failed to load about data:", err);
      toast.error(getApiErrorMessage(err, "Failed to load About settings."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadAboutData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAboutData]);

  // POST /api/about/update (multipart/form-data — text fields + optional image files)
  const handleSaveAboutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSettings || isOptimizingAnyImage) return;
    setIsSavingSettings(true);
    try {
      const formData = new FormData();
      formData.append("about_description", aboutSettings.about_description?.trim() || "");
      formData.append("mission", aboutSettings.mission?.trim() || "");

      // Only attach a field if the admin actually picked a new file —
      // leaving it out keeps the existing stored image on the backend.
      if (heroImageFile) formData.append("hero_image", heroImageFile);
      if (aboutImageFile) formData.append("about_image", aboutImageFile);
      if (whatWeDoImageFile) formData.append("what_we_do_image", whatWeDoImageFile);
      formData.append("remove_hero_image", removeHeroImage ? "1" : "0");
      formData.append("remove_about_image", removeAboutImage ? "1" : "0");
      formData.append("remove_what_we_do_image", removeWhatWeDoImage ? "1" : "0");

      // NOTE: don't set a Content-Type header here — the browser needs to
      // set its own multipart boundary. If fetchApi() forces
      // 'Content-Type: application/json' by default, this call will need
      // an update inside lib/api.ts to skip that header when body is FormData.
      const res = await fetchApi<{ message: string; data: AboutSettingsData }>("/about/update", {
        method: "POST",
        body: formData,
      });

      if (res && res.data) {
        setAboutSettings(res.data);
      }
      setHeroImageFile(null);
      setAboutImageFile(null);
      setWhatWeDoImageFile(null);
      setRemoveHeroImage(false);
      setRemoveAboutImage(false);
      setRemoveWhatWeDoImage(false);
      toast.success(res.message || "About settings updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update about settings:", err);
      setHeroImageError(getValidationError(err, "hero_image"));
      setAboutImageError(getValidationError(err, "about_image"));
      setWhatWeDoImageError(getValidationError(err, "what_we_do_image"));
      toast.error(getApiErrorMessage(err, "Error updating About settings."));
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ---------- What We Do ----------
  const openAddWhatWeDo = () => {
    setEditingWhatWeDoId(null);
    setNewWhatWeDo({ title: "", description: "" });
    setIsWhatWeDoModalOpen(true);
  };

  const openEditWhatWeDo = (item: WhatWeDoItemData) => {
    setEditingWhatWeDoId(item.id);
    setNewWhatWeDo({ title: item.title, description: item.description });
    setIsWhatWeDoModalOpen(true);
  };

  // POST /api/about/what_we_do/store (create) or /api/about/what_we_do/{id} (update)
  const handleSaveWhatWeDo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhatWeDo.title.trim() || !newWhatWeDo.description.trim()) {
      toast.error("Title and Description are required.");
      return;
    }

    setIsAddingWhatWeDo(true);
    try {
      const payload = {
        title: newWhatWeDo.title.trim(),
        description: newWhatWeDo.description.trim(),
      };

      if (editingWhatWeDoId) {
        const res = await fetchApi<{ message: string; data: WhatWeDoItemData }>(
          `/about/what_we_do/${editingWhatWeDoId}`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        setWhatWeDoItems((prev) =>
          prev.map((item) => (item.id === editingWhatWeDoId ? res.data : item))
        );
        toast.success(res.message || "What We Do item updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: WhatWeDoItemData }>(
          "/about/what_we_do/store",
          { method: "POST", body: JSON.stringify(payload) }
        );
        setWhatWeDoItems((prev) => [...prev, res.data]);
        toast.success(res.message || "What We Do item created successfully");
      }

      setNewWhatWeDo({ title: "", description: "" });
      setEditingWhatWeDoId(null);
      setIsWhatWeDoModalOpen(false);
    } catch (err: unknown) {
      console.error("Failed to save What We Do item:", err);
      toast.error(getApiErrorMessage(err, "Failed to save What We Do item."));
    } finally {
      setIsAddingWhatWeDo(false);
    }
  };

  // DELETE /api/about/what_we_do/{id}
  const handleDeleteWhatWeDo = async (id: number) => {
    if (!window.confirm("Delete this What We Do item? This cannot be undone.")) return;
    try {
      const res = await fetchApi<{ message: string }>(`/about/what_we_do/${id}`, {
        method: "DELETE",
      });
      setWhatWeDoItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(res.message || "What We Do item deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete What We Do item:", err);
      toast.error(getApiErrorMessage(err, "Failed to delete What We Do item."));
    }
  };

  // ---------- Why Choose Us ----------
  const openAddWhyChooseUs = () => {
    setEditingWhyChooseUsId(null);
    setNewWhyChooseUs({ name: "", description: "" });
    setIsWhyChooseUsModalOpen(true);
  };

  const openEditWhyChooseUs = (item: WhyChooseUsItemData) => {
    setEditingWhyChooseUsId(item.id);
    setNewWhyChooseUs({ name: item.name, description: item.description });
    setIsWhyChooseUsModalOpen(true);
  };

  // POST /api/about/why_choose_us/store (create) or /api/about/why_choose_us/{id} (update)
  const handleSaveWhyChooseUs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhyChooseUs.name.trim() || !newWhyChooseUs.description.trim()) {
      toast.error("Name and Description are required.");
      return;
    }

    setIsAddingWhyChooseUs(true);
    try {
      const payload = {
        name: newWhyChooseUs.name.trim(),
        description: newWhyChooseUs.description.trim(),
      };

      if (editingWhyChooseUsId) {
        const res = await fetchApi<{ message: string; data: WhyChooseUsItemData }>(
          `/about/why_choose_us/${editingWhyChooseUsId}`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        setWhyChooseUsItems((prev) =>
          prev.map((item) => (item.id === editingWhyChooseUsId ? res.data : item))
        );
        toast.success(res.message || "Why Choose Us item updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: WhyChooseUsItemData }>(
          "/about/why_choose_us/store",
          { method: "POST", body: JSON.stringify(payload) }
        );
        setWhyChooseUsItems((prev) => [...prev, res.data]);
        toast.success(res.message || "Why Choose Us item created successfully");
      }

      setNewWhyChooseUs({ name: "", description: "" });
      setEditingWhyChooseUsId(null);
      setIsWhyChooseUsModalOpen(false);
    } catch (err: unknown) {
      console.error("Failed to save Why Choose Us item:", err);
      toast.error(getApiErrorMessage(err, "Failed to save Why Choose Us item."));
    } finally {
      setIsAddingWhyChooseUs(false);
    }
  };

  // DELETE /api/about/why_choose_us/{id}
  const handleDeleteWhyChooseUs = async (id: number) => {
    if (!window.confirm("Delete this Why Choose Us item? This cannot be undone.")) return;
    try {
      const res = await fetchApi<{ message: string }>(`/about/why_choose_us/${id}`, {
        method: "DELETE",
      });
      setWhyChooseUsItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(res.message || "Why Choose Us item deleted successfully");
    } catch (err: unknown) {
      console.error("Failed to delete Why Choose Us item:", err);
      toast.error(getApiErrorMessage(err, "Failed to delete Why Choose Us item."));
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  About Page Management
                </h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage company mission, vision, about descriptions, banner images, and feature sections.
              </p>
            </div>

            <button
              onClick={loadAboutData}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("company-info")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "company-info"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Company Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("what-we-do")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "what-we-do"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>What We Do ({whatWeDoItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("why-choose-us")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "why-choose-us"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>Why Choose Us ({whyChooseUsItems.length})</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading About page configurations...</p>
            </div>
          ) : (
            <>
              {/* Section 1: Main About Settings Form */}
              {activeTab === "company-info" && (
                <form
                  onSubmit={handleSaveAboutSettings}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200"
                >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">1.</span> Main About Page Settings
                  </h2>
                  <button
                    type="submit"
                    disabled={isSavingSettings || isOptimizingAnyImage}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isOptimizingAnyImage ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Optimizing image...
                      </>
                    ) : isSavingSettings ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      "Save About Settings"
                    )}
                  </button>
                </div>

                {/* Description, Mission, Vision */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Company Overview &amp; Description
                    </label>
                    <RichTextEditor
                      value={aboutSettings.about_description}
                      onChange={(html) =>
                        setAboutSettings({ ...aboutSettings, about_description: html })
                      }
                      placeholder="Detailed introduction of Raise Tech Pvt. Ltd..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Company Mission and Vision Statement
                      </label>
                      <RichTextEditor
                        value={aboutSettings.mission || ""}
                        onChange={(html) =>
                          setAboutSettings({ ...aboutSettings, mission: html })
                        }
                        placeholder="Mission statement..."
                        minHeight="80px"
                      />
                    </div>                    
                  </div>
                </div>

                {/* Banner & Image Uploads */}
                <div className="border-t border-slate-800 pt-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Banner Images
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <ImageDropzone
                      label="Hero Image"
                      file={heroImageFile}
                      existingUrl={getImageUrl(aboutSettings.hero_image)}
                      onFileSelect={setHeroImageFile}
                      onProcessingChange={setIsOptimizingHeroImage}
                      isMarkedForRemoval={removeHeroImage}
                      onRemoveExisting={() => setRemoveHeroImage(true)}
                      onUndoRemoval={() => setRemoveHeroImage(false)}
                      error={heroImageError}
                    />

                    <ImageDropzone
                      label="About Section Image"
                      file={aboutImageFile}
                      existingUrl={getImageUrl(aboutSettings.about_image)}
                      onFileSelect={setAboutImageFile}
                      onProcessingChange={setIsOptimizingAboutImage}
                      isMarkedForRemoval={removeAboutImage}
                      onRemoveExisting={() => setRemoveAboutImage(true)}
                      onUndoRemoval={() => setRemoveAboutImage(false)}
                      error={aboutImageError}
                    />

                    <ImageDropzone
                      label="What We Do Section Image"
                      file={whatWeDoImageFile}
                      existingUrl={getImageUrl(aboutSettings.what_we_do_image)}
                      onFileSelect={setWhatWeDoImageFile}
                      onProcessingChange={setIsOptimizingWhatWeDoImage}
                      isMarkedForRemoval={removeWhatWeDoImage}
                      onRemoveExisting={() => setRemoveWhatWeDoImage(true)}
                      onUndoRemoval={() => setRemoveWhatWeDoImage(false)}
                      error={whatWeDoImageError}
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Section 2: What We Do Slider Items */}
              {activeTab === "what-we-do" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-cyan-400">2.</span> &quot;What We Do&quot; Slider Items
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Items displayed in the interactive What We Do showcase slider.
                      </p>
                    </div>

                    <button
                      onClick={openAddWhatWeDo}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      + Add What We Do Item
                    </button>
                  </div>

                  {whatWeDoItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No What We Do items created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900/80 text-slate-300 font-semibold border-b border-slate-800">
                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                            <th className="py-3.5 px-4 w-56 font-bold text-slate-200">Title</th>
                            <th className="py-3.5 px-4 font-bold text-slate-200">Description</th>
                            <th className="py-3.5 px-4 w-28 text-center font-bold text-slate-200">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {whatWeDoItems.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-900/50 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-medium">
                                {index + 1}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white text-sm">
                                {item.title}
                              </td>
                              <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-lg">
                                <p className="line-clamp-2">{item.description}</p>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditWhatWeDo(item)}
                                    className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 border border-cyan-900/40 rounded-lg transition-colors cursor-pointer"
                                    title="Edit item"
                                    aria-label="Edit item"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteWhatWeDo(item.id)}
                                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
                                    title="Delete item"
                                    aria-label="Delete item"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Section 3: Why Choose Us Feature Items */}
              {activeTab === "why-choose-us" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-cyan-400">3.</span> &quot;Why Choose Us&quot; Feature Items
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Core competitive highlights and value propositions.
                      </p>
                    </div>

                    <button
                      onClick={openAddWhyChooseUs}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                    >
                      + Add Feature Item
                    </button>
                  </div>

                  {whyChooseUsItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No Why Choose Us items created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900/80 text-slate-300 font-semibold border-b border-slate-800">
                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                            <th className="py-3.5 px-4 w-56 font-bold text-slate-200">Feature Name</th>
                            <th className="py-3.5 px-4 font-bold text-slate-200">Description</th>
                            <th className="py-3.5 px-4 w-28 text-center font-bold text-slate-200">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {whyChooseUsItems.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-900/50 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-medium">
                                {index + 1}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-cyan-400 text-sm">
                                {item.name}
                              </td>
                              <td className="py-3.5 px-4 text-slate-300 leading-relaxed max-w-lg">
                                <p className="line-clamp-2">{item.description}</p>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditWhyChooseUs(item)}
                                    className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 border border-cyan-900/40 rounded-lg transition-colors cursor-pointer"
                                    title="Edit feature item"
                                    aria-label="Edit feature item"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteWhyChooseUs(item.id)}
                                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
                                    title="Delete feature item"
                                    aria-label="Delete feature item"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Modal 1: Add/Edit What We Do Item */}
          {isWhatWeDoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveWhatWeDo}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingWhatWeDoId ? 'Edit "What We Do" Item' : 'Add "What We Do" Item'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWhatWeDoModalOpen(false);
                      setEditingWhatWeDoId(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={newWhatWeDo.title}
                      onChange={(e) => setNewWhatWeDo({ ...newWhatWeDo, title: e.target.value })}
                      placeholder="e.g. Enterprise Software Engineering"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={newWhatWeDo.description}
                      onChange={(e) => setNewWhatWeDo({ ...newWhatWeDo, description: e.target.value })}
                      placeholder="Detailed explanation of this business offering..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWhatWeDoModalOpen(false);
                      setEditingWhatWeDoId(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingWhatWeDo}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isAddingWhatWeDo
                      ? "Saving..."
                      : editingWhatWeDoId
                      ? "Save Changes"
                      : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal 2: Add/Edit Why Choose Us Item */}
          {isWhyChooseUsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveWhyChooseUs}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingWhyChooseUsId ? 'Edit "Why Choose Us" Feature' : 'Add "Why Choose Us" Feature'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsWhyChooseUsModalOpen(false);
                      setEditingWhyChooseUsId(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Feature Name *</label>
                    <input
                      type="text"
                      required
                      value={newWhyChooseUs.name}
                      onChange={(e) => setNewWhyChooseUs({ ...newWhyChooseUs, name: e.target.value })}
                      placeholder="e.g. 24/7 Local Support & SLA"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={newWhyChooseUs.description}
                      onChange={(e) => setNewWhyChooseUs({ ...newWhyChooseUs, description: e.target.value })}
                      placeholder="Highlight details about this key benefit..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWhyChooseUsModalOpen(false);
                      setEditingWhyChooseUsId(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingWhyChooseUs}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isAddingWhyChooseUs
                      ? "Saving..."
                      : editingWhyChooseUsId
                      ? "Save Changes"
                      : "Create Feature"}
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
