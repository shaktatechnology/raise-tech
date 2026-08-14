"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { SoftwareItem } from "@/lib/types";

interface SoftwareSectionData {
  id: number;
  hero_image: string | null;
}

export default function AdminSoftwarePage() {
  const [section, setSection] = useState<SoftwareSectionData | null>(null);
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SoftwareItem> | null>(null);

  // File states
  const [softwareImageFile, setSoftwareImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  const loadSoftwareData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{
        status: string;
        data: {
          section: SoftwareSectionData | null;
          items: SoftwareItem[];
        };
      }>("/software");

      if (res.data) {
        setSection(res.data.section);
        setSoftwareList(res.data.items || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load software catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSoftwareData();
  }, [loadSoftwareData]);

  const handleUpdateHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageFile) {
      alert("Please select a new hero image file.");
      return;
    }

    setUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("hero_image", heroImageFile);

<<<<<<< Updated upstream
      const resData = await fetchApi("/software/section", {
=======
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/software/section`, {
>>>>>>> Stashed changes
        method: "POST",
        body: formData,
      });

      setSection(resData.data);
      setHeroImageFile(null);
      alert("Software hero image updated successfully!");
    } catch (err: any) {
      alert(err.message || "Error updating hero image.");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title) {
      alert("Software Title is required!");
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", editingItem.title || "");
      if (editingItem.slogan) formData.append("slogan", editingItem.slogan);
      if (editingItem.description) formData.append("description", editingItem.description);
      formData.append("is_active", editingItem.is_active ? "1" : "0");

      if (softwareImageFile) {
        formData.append("image", softwareImageFile);
      }

<<<<<<< Updated upstream
      const endpoint = editingItem.id
        ? `/software/${editingItem.id}`
        : `/software`;
=======
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const url = editingItem.id
        ? `NEXT_PUBLIC_API_URL/api/software/${editingItem.id}`
        : `NEXT_PUBLIC_API_URL/api/software`;
>>>>>>> Stashed changes

      const resData = await fetchApi(endpoint, {
        method: "POST",
        body: formData,
      });

      if (editingItem.id) {
        setSoftwareList((prev) =>
          prev.map((s) => (s.id === editingItem.id ? resData.data : s))
        );
      } else {
        setSoftwareList((prev) => [resData.data, ...prev]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setSoftwareImageFile(null);
    } catch (err: any) {
      alert(err.message || "Error saving software product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this software product entry?")) return;
    try {
      await fetchApi(`/software/${id}`, { method: "DELETE" });
      setSoftwareList((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete software product.");
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
<<<<<<< Updated upstream
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000";
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
=======
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `NEXT_PUBLIC_API_URL/storage/${path}`;
>>>>>>> Stashed changes
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Software Products Catalog
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage pre-built software suites, POS platforms, and software section hero banner.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadSoftwareData}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold transition"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingItem({
                    title: "",
                    slogan: "",
                    description: "",
                    is_active: true,
                  });
                  setSoftwareImageFile(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-950/40 transition cursor-pointer"
              >
                + Add Software Product
              </button>
            </div>
          </div>

          {/* Section Hero Banner Update Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              Software Page Hero Image Section
            </h3>
            {section?.hero_image && (
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 max-w-md">
                <img
                  src={getImageUrl(section.hero_image)!}
                  alt="Hero Banner"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <span className="text-xs text-slate-400 truncate">{section.hero_image}</span>
              </div>
            )}
            <form onSubmit={handleUpdateHeroImage} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                className="w-full sm:w-auto p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-950 file:text-purple-300"
              />
              <button
                type="submit"
                disabled={uploadingHero || !heroImageFile}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer"
              >
                {uploadingHero ? "Uploading Banner..." : "Update Hero Banner"}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Software Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching software products...</p>
            </div>
          ) : softwareList.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-sm font-semibold text-slate-400">No software products listed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {softwareList.map((sw) => {
                const imageSrc = getImageUrl(sw.image);
                return (
                  <div
                    key={sw.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={sw.title}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-800"
                          />
                        ) : (
                          <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black flex items-center justify-center text-sm">
                            SW
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            sw.is_active
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-slate-800 text-slate-500 border-slate-700"
                          }`}
                        >
                          {sw.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{sw.title}</h3>
                      {sw.slogan && <p className="text-purple-300/80 text-xs font-medium mb-3">{sw.slogan}</p>}
                      <p className="text-slate-400 text-xs leading-relaxed">{sw.description || "No description provided."}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setEditingItem(sw);
                          setSoftwareImageFile(null);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sw.id)}
                        className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveSoftware}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingItem?.id ? `Edit Software #${editingItem.id}` : "Add Software Product"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Software Title *</label>
                    <input
                      type="text"
                      required
                      value={editingItem?.title || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Slogan / Tagline</label>
                    <input
                      type="text"
                      value={editingItem?.slogan || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, slogan: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Product Image / Logo</label>
                    {editingItem?.image && (
                      <div className="mb-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <img src={getImageUrl(editingItem.image)!} alt="Product logo" className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-[11px] text-slate-400 truncate">{editingItem.image}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSoftwareImageFile(e.target.files?.[0] || null)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-purple-950 file:text-purple-300"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Detailed Description</label>
                    <textarea
                      rows={4}
                      value={editingItem?.description || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={editingItem?.is_active ?? true}
                      onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
                    />
                    <span>Active Software Product</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Saving Product..." : "Save Product"}
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
