"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    short_description: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    location: "",
    map_url: "",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    tiktok_url: "",
    whatsapp_url: "",
    is_cod_enabled: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ setting: SiteSettings }>("/settings");
      if (res.setting) {
        setSettings({
          short_description: res.setting.short_description || "",
          phone1: res.setting.phone1 || "",
          phone2: res.setting.phone2 || "",
          email1: res.setting.email1 || "",
          email2: res.setting.email2 || "",
          location: res.setting.location || "",
          map_url: res.setting.map_url || "",
          facebook_url: res.setting.facebook_url || "",
          twitter_url: res.setting.twitter_url || "",
          instagram_url: res.setting.instagram_url || "",
          linkedin_url: res.setting.linkedin_url || "",
          tiktok_url: res.setting.tiktok_url || "",
          whatsapp_url: res.setting.whatsapp_url || "",
          is_cod_enabled: res.setting.is_cod_enabled ?? true,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load site settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSavedNotice(null);

    try {
      const res = await fetchApi<{ message: string; setting: SiteSettings }>("/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });

      setSavedNotice(res.message || "Settings updated successfully.");
      if (res.setting) {
        setSettings(res.setting);
      }
      setTimeout(() => setSavedNotice(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update site settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Site Parameters & Enterprise Settings
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Configure global contact information, social links, location map, and checkout parameters.
              </p>
            </div>

            <button
              onClick={loadSettings}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition disabled:opacity-50 cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {savedNotice && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-semibold animate-in fade-in">
              ✓ {savedNotice}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-semibold">
              ✕ {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching site configuration...</p>
            </div>
          ) : (
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
                      placeholder="Enterprise summary displayed in footer and about metadata..."
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
                      maxLength={15}
                      value={settings.phone1 || ""}
                      onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="+977 9800000000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Secondary Phone</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={settings.phone2 || ""}
                      onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="+977 01 4000000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Primary Email</label>
                    <input
                      type="email"
                      maxLength={255}
                      value={settings.email1 || ""}
                      onChange={(e) => setSettings({ ...settings, email1: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="info@raisetech.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Support Email</label>
                    <input
                      type="email"
                      maxLength={255}
                      value={settings.email2 || ""}
                      onChange={(e) => setSettings({ ...settings, email2: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="support@raisetech.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Physical Location Address</label>
                    <input
                      type="text"
                      maxLength={500}
                      value={settings.location || ""}
                      onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. New Road, Kathmandu, Nepal"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Google Maps Embed / Direct URL</label>
                    <input
                      type="url"
                      value={settings.map_url || ""}
                      onChange={(e) => setSettings({ ...settings, map_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://maps.google.com/?q=Kathmandu"
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
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      value={settings.twitter_url || ""}
                      onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://x.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={settings.instagram_url || ""}
                      onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={settings.linkedin_url || ""}
                      onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">TikTok URL</label>
                    <input
                      type="url"
                      value={settings.tiktok_url || ""}
                      onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://tiktok.com/@yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">WhatsApp Direct Link</label>
                    <input
                      type="url"
                      value={settings.whatsapp_url || ""}
                      onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      placeholder="https://wa.me/9779800000000"
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
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                >
                  {submitting ? "Saving Parameters..." : "Save Site Parameters"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
