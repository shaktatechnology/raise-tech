"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminImageField from "@/components/admin/AdminImageField";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
import { SiteSettings } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

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
  const { showToast } = useToast();
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

  type SettingsTab = "branding" | "contact" | "social" | "general-checkout";
  const [activeTab, setActiveTab] = useState<SettingsTab>("branding");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);
  const [logoError, setLogoError] = useState<string>();
  const [faviconError, setFaviconError] = useState<string>();
  const [isOptimizingLogo, setIsOptimizingLogo] = useState(false);
  const [isOptimizingFavicon, setIsOptimizingFavicon] = useState(false);
  const isOptimizingBranding = isOptimizingLogo || isOptimizingFavicon;

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
        setLogoFile(null);
        setFaviconFile(null);
        setRemoveLogo(false);
        setRemoveFavicon(false);
        setLogoError(undefined);
        setFaviconError(undefined);
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to load site settings.");
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSettings(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isOptimizingBranding) return;
    setSubmitting(true);
    setError(null);
    setLogoError(undefined);
    setFaviconError(undefined);

    try {
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
      formData.append("remove_logo", removeLogo ? "1" : "0");
      formData.append("remove_favicon", removeFavicon ? "1" : "0");
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);

      const res = await fetchApi<{ message: string; setting: SiteSettings }>("/settings", {
        method: "POST",
        body: formData,
      });

      showToast(res.message || "Settings updated successfully.", "success");
      if (res.setting) {
        setSettings((prev) => ({ ...prev, ...res.setting }));
      }
      await loadSettings();
      setLogoFile(null);
      setFaviconFile(null);
      setRemoveLogo(false);
      setRemoveFavicon(false);
    } catch (err: unknown) {
      setLogoError(getValidationError(err, "logo"));
      setFaviconError(getValidationError(err, "favicon"));
      const message = getApiErrorMessage(err, "Failed to update site settings.");
      setError(message);
      showToast(message, "error");
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

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-semibold">
              ✕ {error}
            </div>
          )}

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("branding")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "branding"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 8a2 2 0 012-2h12a2 2 0 012 2M4 8a2 2 0 002 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 002-2" />
              </svg>
              <span>Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "contact"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Contact & Location</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "social"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Social Links</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("general-checkout")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "general-checkout"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>General & Checkout</span>
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching site configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Branding */}
              {activeTab === "branding" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    Branding
                  </h3>
                  <div className="space-y-6">
                    <AdminImageField
                      label="Site logo"
                      existingImageUrl={getImageUrl(settings.logo)}
                      existingImageFilename={getImageFilename(settings.logo)}
                      existingImageAlt="Current site logo"
                      selectedFile={logoFile}
                      onSelectFile={setLogoFile}
                      onClearSelection={() => setLogoFile(null)}
                      onProcessingChange={setIsOptimizingLogo}
                      onRemoveExisting={() => setRemoveLogo(true)}
                      onUndoRemoval={() => setRemoveLogo(false)}
                      isExistingMarkedForRemoval={removeLogo}
                      disabled={submitting}
                      error={logoError}
                      aspectRatioGuidance="JPEG, PNG, or WebP up to 10 MB. Transparent or wide logo artwork works best."
                      accent="cyan"
                    />

                    {/* Favicon */}
                    <div className="space-y-2">
                      <AdminImageField
                        label="Favicon"
                        existingImageUrl={getImageUrl(settings.favicon)}
                        existingImageFilename={getImageFilename(settings.favicon)}
                        existingImageAlt="Current site favicon"
                        selectedFile={faviconFile}
                        onSelectFile={setFaviconFile}
                        onClearSelection={() => setFaviconFile(null)}
                        onProcessingChange={setIsOptimizingFavicon}
                        onRemoveExisting={() => setRemoveFavicon(true)}
                        onUndoRemoval={() => setRemoveFavicon(false)}
                        isExistingMarkedForRemoval={removeFavicon}
                        disabled={submitting}
                        error={faviconError}
                        accept="image/png,image/jpeg,image/webp"
                        aspectRatioGuidance="Use a square PNG, JPEG, or WebP. It is resized to at most 512×512 and optimized below 200 KB."
                        accent="cyan"
                        optimizationOptions={{ maxDimension: 512, targetBytes: 200 * 1024 }}
                      />
                      <p className="text-slate-600 text-[10px] mt-2">
                        Square image recommended (e.g. 32×32 or 64×64px).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {activeTab === "contact" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
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
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {activeTab === "social" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 animate-in fade-in duration-200">
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
              )}

              {/* General Profile & E-Commerce Options */}
              {activeTab === "general-checkout" && (
                <div className="space-y-6 animate-in fade-in duration-200">
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
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800/60">
                <button
                  type="submit"
                  disabled={submitting || isOptimizingBranding}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                >
                  {isOptimizingBranding
                    ? "Optimizing Branding..."
                    : submitting
                      ? "Saving Parameters..."
                      : "Save Site Parameters"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
