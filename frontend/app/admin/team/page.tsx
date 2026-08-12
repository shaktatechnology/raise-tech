"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { TeamMember } from "@/lib/types";

const MOCK_TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Rohan Shakya",
    position: "Chief Executive Officer & Founder",
    image: null,
    description: "Visionary leader driving technology integration and high performance paper manufacturing in Nepal.",
    is_active: true,
  },
  {
    id: 2,
    name: "Sujata Shrestha",
    position: "Lead Software Architect",
    image: null,
    description: "Specializes in microservices architecture, Next.js web applications, and enterprise database systems.",
    is_active: true,
  },
  {
    id: 3,
    name: "Bikash Maharjan",
    position: "Head of POS & Supply Operations",
    image: null,
    description: "Oversees paper roll production pipelines, quality assurance standards, and merchant logistics.",
    is_active: true,
  },
];

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.name || !editingMember?.position) {
      alert("Name and Position are required.");
      return;
    }

    if (editingMember.id) {
      setTeam((prev) =>
        prev.map((t) => (t.id === editingMember.id ? ({ ...t, ...editingMember } as TeamMember) : t))
      );
    } else {
      const newMember: TeamMember = {
        id: Date.now(),
        name: editingMember.name,
        position: editingMember.position,
        image: null,
        description: editingMember.description || "",
        is_active: editingMember.is_active ?? true,
      };
      setTeam((prev) => [...prev, newMember]);
    }
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    setTeam((prev) => prev.filter((t) => t.id !== id));
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
                Manage executive, engineering, and operations leadership displayed on the About page.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMember({
                  name: "",
                  position: "",
                  description: "",
                  is_active: true,
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-pink-950/40 transition cursor-pointer"
            >
              + Add Team Member
            </button>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-pink-500/40 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-extrabold text-lg">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
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
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveMember}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingMember?.id ? "Edit Team Profile" : "Add Team Member"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
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
                      value={editingMember?.position || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Bio / Profile Description</label>
                    <textarea
                      rows={3}
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
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold shadow-lg"
                  >
                    Save Profile
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
