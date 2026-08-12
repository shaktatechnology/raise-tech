"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { SiteSettings } from "@/lib/types";

const INITIAL_SETTINGS: SiteSettings = {
  short_description: "Raise Tech is a premier tech startup & thermal paper roll manufacturing company in Nepal.",
  phone1: "+977 9841000000",
  phone2: "+977 01 4400000",
  email1: "info@raisetech.com.np",
  email2: "support@raisetech.com.np",
  location: "New Road, Kathmandu, Nepal",
  map_url: "https://maps.google.com/?q=Kathmandu",
  facebook_url: "https://facebook.com/raisetechnepal",
  twitter_url: "https://twitter.com/raisetechnepal",
  instagram_url: "https://instagram.com/raisetechnepal",
  linkedin_url: "https://linkedin.com/company/raisetechnepal",
  tiktok_url: "https://tiktok.com/@raisetechnepal",
  whatsapp_url: "https://wa.me/9779841000000",
  is_cod_enabled: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Site Parameters & Enterprise Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure global contact information, social links, and checkout settings.
            </p>
          </div>

          {savedNotice && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-semibold animate-in fade-in">
              ✓ Settings saved successfully (placeholder state).
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Site Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                1. General Company Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Short Description / Footer Blurb</label>
                  <textarea
                    rows={3}
                    value={settings.short_description || ""}
                    onChange={(e) => setSettings({ ...settings, short_description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                2. Contact & Address Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={settings.phone1 || ""}
                    onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    value={settings.phone2 || ""}
                    onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Primary Email</label>
                  <input
                    type="email"
                    value={settings.email1 || ""}
                    onChange={(e) => setSettings({ ...settings, email1: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.email2 || ""}
                    onChange={(e) => setSettings({ ...settings, email2: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Physical Location Address</label>
                  <input
                    type="text"
                    value={settings.location || ""}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                3. Social Links & Messaging
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={settings.facebook_url || ""}
                    onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={settings.instagram_url || ""}
                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={settings.linkedin_url || ""}
                    onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Direct Link</label>
                  <input
                    type="url"
                    value={settings.whatsapp_url || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* E-Commerce Options */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                4. E-Commerce Checkout Parameters
              </h3>
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.is_cod_enabled ?? true}
                  onChange={(e) => setSettings({ ...settings, is_cod_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span>Enable Cash On Delivery (COD) for Paper Roll Product Orders</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
              >
                Save Site Parameters
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
