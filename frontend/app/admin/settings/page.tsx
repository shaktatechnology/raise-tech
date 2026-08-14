"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi, getImageUrl } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

// Converts common Google Maps URL formats (place links, search/query links,
// share links) into an embeddable iframe URL. Returns null if the URL can't
// be reliably embedded (e.g. shortened goo.gl links, which need server-side
// resolution before they can be embedded). Import this same helper into the
// contact page so both admin preview and public rendering stay in sync.
export function toEmbeddableMapUrl(url?: string | null): string | null {
  if (!url) return null;

  // Already a proper embed URL - use as-is.
  if (url.includes("/maps/embed")) return url;

  // Shortened links can't be converted client-side.
  if (url.includes("goo.gl")) return null;

  // Standard Google Maps URLs can usually be embedded by adding output=embed.
  if (url.includes("google.com/maps") || url.includes("maps.google.com")) {
    try {
      const u = new URL(url);
      u.searchParams.set("output", "embed");
      return u.toString();
    } catch {
      return null;
    }
  }

  return null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    short_description: "",
    logo: null,
    favicon: null,
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Revoke object URLs on unmount / when replaced, to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    };
  }, [logoPreview, faviconPreview]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFaviconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ setting: SiteSettings }>("/settings");
      if (res.setting) {
        setSettings({
          short_description: res.setting.short_description || "",
          logo: res.setting.logo || null,
          favicon: res.setting.favicon || null,
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
      const hasNewFile = !!logoFile || !!faviconFile;
      let res: { message: string; setting: SiteSettings };

      if (hasNewFile) {
        const formData = new FormData();
        formData.append("short_description", settings.short_description || "");
        formData.append("phone1", settings.phone1 || "");
        formData.append("phone2", settings.phone2 || "");
        formData.append("email1", settings.email1 || "");
        formData.append("email2", settings.email2 || "");
        formData.append("location", settings.location || "");
        formData.append("map_url", settings.map_url || "");
        formData.append("facebook_url", settings.facebook_url || "");
        formData.append("twitter_url", settings.twitter_url || "");
        formData.append("instagram_url", settings.instagram_url || "");
        formData.append("linkedin_url", settings.linkedin_url || "");
        formData.append("tiktok_url", settings.tiktok_url || "");
        formData.append("whatsapp_url", settings.whatsapp_url || "");
        formData.append("is_cod_enabled", settings.is_cod_enabled ? "1" : "0");

        if (logoFile) {
          formData.append("logo", logoFile);
        } else if (settings.logo) {
          formData.append("logo", settings.logo);
        }

        if (faviconFile) {
          formData.append("favicon", faviconFile);
        } else if (settings.favicon) {
          formData.append("favicon", settings.favicon);
        }

        res = await fetchApi<{ message: string; setting: SiteSettings }>("/settings", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetchApi<{ message: string; setting: SiteSettings }>("/settings", {
          method: "POST",
          body: JSON.stringify(settings),
        });
      }

      setSavedNotice(res.message || "Settings updated successfully.");
      if (res.setting) {
        setSettings((prev) => ({ ...prev, ...res.setting }));
      }
      setLogoFile(null);
      setFaviconFile(null);
      setLogoPreview(null);
      setFaviconPreview(null);
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
              {/* Branding */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Branding
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Logo */}
                  <div>
                    <label className="block text-slate-400 mb-2">Site Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 shrink-0 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                        {logoPreview || settings.logo ? (
                          <img
                            src={logoPreview || getImageUrl(settings.logo)}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-slate-600 text-[10px]">No logo</span>
                        )}
                      </div>
                      <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div>
                    <label className="block text-slate-400 mb-2">Favicon</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 shrink-0 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
                        {faviconPreview || settings.favicon ? (
                          <img
                            src={faviconPreview || getImageUrl(settings.favicon)}
                            alt="Favicon preview"
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-slate-600 text-[10px]">No favicon</span>
                        )}
                      </div>
                      <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-slate-600 text-[10px] mt-2">
                      Square image recommended (e.g. 32×32 or 64×64px).
                    </p>
                  </div>
                </div>
              </div>

              {/* General Site Information */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  General Company Profile
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
                  Contact & Address Details
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
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    {/* <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      For the best result, use an <span className="text-slate-300">embed</span> URL: open Google
                      Maps, find the location, click <span className="text-slate-300">Share → Embed a map</span>,
                      then copy the URL inside the <code className="text-slate-300">src=&quot;...&quot;</code> from
                      the provided code. A regular Maps link (e.g. from the address bar) also works, but shortened
                      links (goo.gl) can&apos;t be embedded and will show as a link instead of a live map.
                    </p> */}

                    {/* {settings.map_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        {toEmbeddableMapUrl(settings.map_url) ? (
                          <iframe
                            key={settings.map_url}
                            src={toEmbeddableMapUrl(settings.map_url) as string}
                            className="w-full h-48 border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map Preview"
                          />
                        ) : (
                          <p className="text-[11px] text-amber-400 p-3">
                            This URL can&apos;t be embedded as a live map — visitors will see a &quot;View on
                            Google Maps&quot; link instead. Use an embed URL from Share → Embed a map for a live
                            preview on the contact page.
                          </p>
                        )}
                      </div>
                    )} */}
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Social Links & Messaging
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
                  E-Commerce Checkout Parameters
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