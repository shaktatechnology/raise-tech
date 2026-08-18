"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
import { TeamMember } from "@/lib/types";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string>();
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ status: string; data: TeamMember[] }>("/team");
      setTeam(res.data || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load team members."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadTeam(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadTeam]);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.name || !editingMember?.position) {
      alert("Name and Position are required.");
      return;
    }
    if (actionLoading || isOptimizingImage) return;

    setActionLoading(true);
    setImageError(undefined);
    try {
      const formData = new FormData();
      formData.append("name", editingMember.name || "");
      formData.append("position", editingMember.position || "");
      if (editingMember.description) formData.append("description", editingMember.description);
      formData.append("is_active", editingMember.is_active ? "1" : "0");

      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("remove_image", removeImage ? "1" : "0");

      const endpoint = editingMember.id
        ? `/team/${editingMember.id}`
        : `/team`;

      const resData = await fetchApi<{ message: string; data: TeamMember }>(endpoint, {
        method: "POST",
        body: formData,
      });

      if (editingMember.id) {
        setTeam((prev) =>
          prev.map((t) => (t.id === editingMember.id ? resData.data : t))
        );
      } else {
        setTeam((prev) => [resData.data, ...prev]);
      }

      setIsModalOpen(false);
      setEditingMember(null);
      setImageFile(null);
      setRemoveImage(false);
    } catch (err: unknown) {
      setImageError(getValidationError(err, "image"));
      alert(getApiErrorMessage(err, "Error saving team member."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      await fetchApi(`/team/${id}`, { method: "DELETE" });
      setTeam((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Failed to delete team member."));
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Team Members Management
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage executive, engineering, and operations leadership displayed on the Team page.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadTeam}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold transition"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingMember({
                    name: "",
                    position: "",
                    description: "",
                    is_active: true,
                  });
                  setImageFile(null);
                  setRemoveImage(false);
                  setImageError(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-pink-950/40 transition cursor-pointer"
              >
                + Add Team Member
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching team members...</p>
            </div>
          ) : team.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-sm font-semibold text-slate-400">No team members listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member) => {
                const imageSrc = getImageUrl(member.image);
                return (
                  <div
                    key={member.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-pink-500/40 transition shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        {imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc}
                            alt={member.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-800"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-extrabold text-lg">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-bold text-white">{member.name}</h3>
                          <p className="text-pink-400 text-xs font-medium">{member.position}</p>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{member.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          member.is_active
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Hidden"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setImageFile(null);
                            setRemoveImage(false);
                            setImageError(undefined);
                            setIsModalOpen(true);
                          }}
                          title="Edit Team Member"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          title="Delete Team Member"
                          className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveMember}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingMember?.id ? `Edit Team Member #${editingMember.id}` : "Add Team Member"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={actionLoading || isOptimizingImage} className="text-slate-400 hover:text-white text-base disabled:opacity-50">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={editingMember?.name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Position / Title *</label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={editingMember?.position || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <AdminImageField
                    label="Profile photo"
                    existingImageUrl={getImageUrl(editingMember?.image)}
                    existingImageFilename={getImageFilename(editingMember?.image)}
                    existingImageAlt={editingMember?.name || "Current team member photo"}
                    selectedFile={imageFile}
                    onSelectFile={setImageFile}
                    onClearSelection={() => setImageFile(null)}
                    onProcessingChange={setIsOptimizingImage}
                    onRemoveExisting={() => setRemoveImage(true)}
                    onUndoRemoval={() => setRemoveImage(false)}
                    isExistingMarkedForRemoval={removeImage}
                    disabled={actionLoading}
                    error={imageError}
                    aspectRatioGuidance="JPEG, PNG, or WebP up to 10 MB. A portrait image works best."
                    accent="pink"
                  />

                  <div>
                    <label className="block text-slate-400 mb-1">Bio / Profile Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={editingMember?.description || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={editingMember?.is_active ?? true}
                      onChange={(e) => setEditingMember({ ...editingMember, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span>Active Team Profile</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={actionLoading || isOptimizingImage}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || isOptimizingImage}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isOptimizingImage
                      ? "Optimizing Photo..."
                      : actionLoading
                        ? "Saving Profile..."
                        : "Save Profile"}
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
