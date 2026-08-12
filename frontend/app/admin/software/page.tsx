"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { SoftwareItem } from "@/lib/types";

const MOCK_SOFTWARE: SoftwareItem[] = [
  {
    id: 1,
    title: "RaisePOS Retail Billing & Inventory",
    slogan: "Complete ERP and POS system for supermarkets and paper roll merchants.",
    description: "Multi-branch POS software featuring automated inventory decrementing, thermal receipt printing, and sales accounting.",
    image: null,
    is_active: true,
  },
  {
    id: 2,
    title: "RaiseHMS Hospital Management System",
    slogan: "Cloud solution for patient billing and OPD ticketing.",
    description: "Streamlined medical records management system with integrated queue management and OPD thermal ticket generation.",
    image: null,
    is_active: true,
  },
  {
    id: 3,
    title: "RaiseSchool Education ERP",
    slogan: "Fee management, exam grading, and student portal.",
    description: "Unified web platform for school administration, parent communications, and student fee receipt printing.",
    image: null,
    is_active: false,
  },
];

export default function AdminSoftwarePage() {
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>(MOCK_SOFTWARE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SoftwareItem> | null>(null);

  const handleSaveSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title) {
      alert("Title is required!");
      return;
    }

    if (editingItem.id) {
      setSoftwareList((prev) =>
        prev.map((s) => (s.id === editingItem.id ? ({ ...s, ...editingItem } as SoftwareItem) : s))
      );
    } else {
      const newItem: SoftwareItem = {
        id: Date.now(),
        title: editingItem.title,
        slogan: editingItem.slogan || null,
        description: editingItem.description || null,
        image: null,
        is_active: editingItem.is_active ?? true,
      };
      setSoftwareList((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this software product entry?")) return;
    setSoftwareList((prev) => prev.filter((s) => s.id !== id));
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
                Manage pre-built software suites, POS platforms, and client software products.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem({
                  title: "",
                  slogan: "",
                  description: "",
                  is_active: true,
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-950/40 transition cursor-pointer"
            >
              + Add Software Product
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {softwareList.map((sw) => (
              <div
                key={sw.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black flex items-center justify-center text-sm">
                      SW
                    </span>
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
                  <p className="text-slate-400 text-xs leading-relaxed">{sw.description}</p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingItem(sw);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sw.id)}
                    className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveSoftware}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingItem?.id ? "Edit Software Product" : "Add Software Product"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
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
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg"
                  >
                    Save Product
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
