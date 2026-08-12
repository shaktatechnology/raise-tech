"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminService } from "@/lib/types";

const MOCK_SERVICES: AdminService[] = [
  {
    id: 1,
    title: "Custom Web & Mobile App Development",
    slogan: "Tailored software built with modern Next.js and Laravel stacks.",
    description: "End-to-end bespoke software engineering services for enterprises and high growth startups.",
    image: null,
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: "Paper Roll Manufacturing & Supply",
    slogan: "Premium thermal paper rolls for POS billing.",
    description: "BPA-free thermal paper rolls cut to precise specifications for all retail terminal types.",
    image: null,
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    title: "Enterprise Cloud & Infrastructure Solutions",
    slogan: "Scalable hosting, DevOps, and cloud deployment.",
    description: "Managed server infrastructure setup, database optimization, and cloud security compliance.",
    image: null,
    order: 3,
    is_active: true,
  },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>(MOCK_SERVICES);
  const [headerTitle, setHeaderTitle] = useState("Empowering Enterprise Solutions & Paper Distribution");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<AdminService> | null>(null);

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.description) {
      alert("Title and Description are required!");
      return;
    }

    if (editingService.id) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? ({ ...s, ...editingService } as AdminService) : s))
      );
    } else {
      const newService: AdminService = {
        id: Date.now(),
        title: editingService.title,
        slogan: editingService.slogan || null,
        description: editingService.description,
        image: null,
        order: editingService.order || services.length + 1,
        is_active: editingService.is_active ?? true,
      };
      setServices((prev) => [...prev, newService]);
    }
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Services Management
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Customize IT offerings, thermal paper roll distribution services, and page hero content.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingService({
                  title: "",
                  slogan: "",
                  description: "",
                  order: services.length + 1,
                  is_active: true,
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950/40 transition cursor-pointer"
            >
              + Add New Service
            </button>
          </div>

          {/* Service Page Header Settings Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Services Page Hero Banner Header
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => alert("Service hero title saved (placeholder state).")}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl whitespace-nowrap"
              >
                Save Banner
              </button>
            </div>
          </div>

          {/* Service Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                      #{item.order}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        item.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {item.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  {item.slogan && <p className="text-amber-300/80 text-xs font-medium mb-2">{item.slogan}</p>}
                  <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditingService(item);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Form */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveService}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingService?.id ? "Edit Service Offering" : "Add Service Offering"}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Service Title *</label>
                    <input
                      type="text"
                      required
                      value={editingService?.title || ""}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={editingService?.slogan || ""}
                      onChange={(e) => setEditingService({ ...editingService, slogan: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={editingService?.description || ""}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={editingService?.order ?? 1}
                        onChange={(e) => setEditingService({ ...editingService, order: Number(e.target.value) })}
                        className="w-24 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingService?.is_active ?? true}
                        onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <span>Active on public website</span>
                    </label>
                  </div>
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
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg"
                  >
                    Save Service
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
