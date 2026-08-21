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

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);
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

  const filteredTeam = React.useMemo(() => {
    if (!searchTerm.trim()) return team;
    const q = searchTerm.toLowerCase();
    return team.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
    );
  }, [team, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTeam.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeam = filteredTeam.slice(
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

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search team members by name, role, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredTeam.length}</span> members
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching team members...</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 text-center w-14">S.No</th>
                    <th className="py-3 px-3">Member Details</th>
                    <th className="py-3 px-3 w-40">Position / Title</th>
                    <th className="py-3 px-3 w-24 text-center">Status</th>
                    <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedTeam.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        {team.length === 0
                          ? "No team members listed yet."
                          : "No matching team members found."}
                      </td>
                    </tr>
                  ) : (
                    paginatedTeam.map((member, index) => {
                      const serialNumber = startIndex + index + 1;
                      const imageSrc = getImageUrl(member.image);

                      return (
                        <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                            {serialNumber}
                          </td>
                          <td className="py-3 px-3 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {imageSrc ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={imageSrc}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-pink-400 font-bold text-xs">
                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-white text-sm truncate" title={member.name}>
                                  {member.name}
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1" title={member.description || ""}>
                                  {member.description || "No bio description"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-pink-400 font-medium whitespace-nowrap">
                            {member.position}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
                                member.is_active
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-slate-800 text-slate-500 border-slate-700"
                              }`}
                            >
                              {member.is_active ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Button */}
                              <button
                                onClick={() => setViewingMember(member)}
                                title="View Member Profile"
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
                                  setEditingMember(member);
                                  setImageFile(null);
                                  setRemoveImage(false);
                                  setImageError(undefined);
                                  setIsModalOpen(true);
                                }}
                                title="Edit Team Member"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-pink-400 hover:text-pink-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(member.id)}
                                title="Delete Team Member"
                                className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
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
              {filteredTeam.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredTeam.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{filteredTeam.length}</span> members
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
                                  ? "bg-pink-600 text-white shadow-md shadow-pink-950/50"
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

          {/* View Member Modal */}
          {viewingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Team Member Profile</h3>
                  <button
                    type="button"
                    onClick={() => setViewingMember(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {viewingMember.image && (
                    <div className="w-full h-48 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(viewingMember.image)}
                        alt={viewingMember.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Full Name</span>
                    <p className="text-base font-bold text-white">{viewingMember.name}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Position / Title</span>
                    <p className="text-pink-400 font-medium">{viewingMember.position}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Bio / Description</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {viewingMember.description || "No bio description provided."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-bold">Status</span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider mt-0.5 ${
                        viewingMember.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {viewingMember.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingMember(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingMember;
                      setViewingMember(null);
                      setEditingMember(toEdit);
                      setImageFile(null);
                      setRemoveImage(false);
                      setImageError(undefined);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Member
                  </button>
                </div>
              </div>
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
