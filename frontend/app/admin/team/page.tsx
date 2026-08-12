"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { TeamMember } from "@/lib/types";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ status: string; data: TeamMember[] }>("/team");
      setTeam(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.name || !editingMember?.position) {
      alert("Name and Position are required.");
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editingMember.name || "");
      formData.append("position", editingMember.position || "");
      if (editingMember.description) formData.append("description", editingMember.description);
      formData.append("is_active", editingMember.is_active ? "1" : "0");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const url = editingMember.id
        ? `http://localhost:8000/api/team/${editingMember.id}`
        : `http://localhost:8000/api/team`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Failed to save team member.");

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
    } catch (err: any) {
      alert(err.message || "Error saving team member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      await fetchApi(`/team/${id}`, { method: "DELETE" });
      setTeam((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete team member.");
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `http://localhost:8000/storage/${path}`;
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setImageFile(null);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs cursor-pointer"
                        >
                          Delete
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
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingMember?.id ? `Edit Team Member #${editingMember.id}` : "Add Team Member"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base">
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

                  <div>
                    <label className="block text-slate-400 mb-1">Profile Photo</label>
                    {editingMember?.image && (
                      <div className="mb-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <img src={getImageUrl(editingMember.image)!} alt="Current" className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-[11px] text-slate-400 truncate">{editingMember.image}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-pink-950 file:text-pink-300"
                    />
                  </div>

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
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Saving Profile..." : "Save Profile"}
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
