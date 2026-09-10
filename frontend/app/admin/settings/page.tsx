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

  // Extract src if full iframe tag was pasted
  const iframeMatch = url.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // Proper embed URL with /maps/embed or pb= parameter
  if (url.includes("/maps/embed") || url.includes("pb=")) return url;

  // Shortened links cannot be embedded directly in an iframe
  if (url.includes("goo.gl")) return null;

  // Convert /maps/place/Place+Name/... URLs into an embeddable query map URL
  if (url.includes("/maps/place/")) {
    const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
    }
  }

  // Standard Google Maps URLs with search query parameters (q= or ll=)
  if (url.includes("google.com/maps") || url.includes("maps.google.com")) {
    try {
      const u = new URL(url);
      if (u.searchParams.has("q") || u.searchParams.has("ll")) {
        u.searchParams.set("output", "embed");
        return u.toString();
      }
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
    phone3: "",
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
    company_name: "",
    contact_eyebrow: "",
    contact_title: "",
    contact_description: "",
    operating_hours: "",
    operating_hours_note: "",
    inquiry_recipient_email: "",
    is_inquiry_notification_enabled: true,
    reply_to_email: "",
    sender_name: "",
    mail_mailer: "smtp",
    mail_host: "",
    mail_port: "",
    mail_username: "",
    mail_password: "",
    mail_encryption: "tls",
    mail_from_address: "",
    mail_from_name: "",
    has_mail_password: false,
    remove_mail_password: false,
    google_client_id: "",
    google_client_secret: "",
    has_google_client_secret: false,
    remove_google_client_secret: false,
    is_google_login_enabled: true,
    is_cod_enabled: true,
    is_standard_delivery_enabled: true,
    is_express_delivery_enabled: true,
    standard_delivery_charge: "100",
    express_delivery_charge: "250",
  });

  const { refetch: refetchGlobalSettings } = useSiteSettings();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  type SettingsTab = "general" | "authorization" | "social" | "checkout";
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Test Email State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>("");
  const [sendingTestEmail, setSendingTestEmail] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);

  // Google OAuth State
  const [showGoogleSecret, setShowGoogleSecret] = useState<boolean>(false);

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
          phone3: res.setting.phone3 || "",
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
          company_name: res.setting.company_name || "",
          contact_eyebrow: res.setting.contact_eyebrow || "",
          contact_title: res.setting.contact_title || "",
          contact_description: res.setting.contact_description || "",
          operating_hours: res.setting.operating_hours || "",
          operating_hours_note: res.setting.operating_hours_note || "",
          inquiry_recipient_email: res.setting.inquiry_recipient_email || "",
          is_inquiry_notification_enabled: res.setting.is_inquiry_notification_enabled ?? true,
          reply_to_email: res.setting.reply_to_email || "",
          sender_name: res.setting.sender_name || "",
          mail_mailer: res.setting.mail_mailer || "smtp",
          mail_host: res.setting.mail_host || "",
          mail_port: res.setting.mail_port != null ? String(res.setting.mail_port) : "",
          mail_username: res.setting.mail_username || "",
          mail_password: "",
          mail_encryption: res.setting.mail_encryption || "tls",
          mail_from_address: res.setting.mail_from_address || "",
          mail_from_name: res.setting.mail_from_name || "",
          has_mail_password: Boolean(res.setting.has_mail_password),
          remove_mail_password: false,
          google_client_id: res.setting.google_client_id || "",
          google_client_secret: "",
          has_google_client_secret: Boolean(res.setting.has_google_client_secret),
          remove_google_client_secret: false,
          is_google_login_enabled: res.setting.is_google_login_enabled ?? true,
          is_cod_enabled: res.setting.is_cod_enabled ?? true,
          is_standard_delivery_enabled: res.setting.is_standard_delivery_enabled ?? true,
          is_express_delivery_enabled: res.setting.is_express_delivery_enabled ?? true,
          standard_delivery_charge: res.setting.standard_delivery_charge != null ? String(res.setting.standard_delivery_charge) : "100",
          express_delivery_charge: res.setting.express_delivery_charge != null ? String(res.setting.express_delivery_charge) : "250",
        });
        if (res.setting.inquiry_recipient_email) {
          setTestEmailRecipient(res.setting.inquiry_recipient_email);
        }
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

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingTestEmail) return;
    const recipient = testEmailRecipient.trim() || settings.inquiry_recipient_email?.trim() || "";
    if (!recipient) {
      const msg = "Please enter or configure a recipient email address first.";
      setTestEmailResult({ success: false, message: msg });
      showToast(msg, "error");
      return;
    }

    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetchApi<{ message: string }>("/settings/test-email", {
        method: "POST",
        body: JSON.stringify({ recipient_email: recipient }),
      });
      setTestEmailResult({ success: true, message: res.message || "Test email sent successfully!" });
      showToast(res.message || "Test email sent successfully!", "success");
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to send test email.");
      setTestEmailResult({ success: false, message });
      showToast(message, "error");
    } finally {
      setSendingTestEmail(false);
    }
  };

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
      formData.append("phone3", settings.phone3 || "");
      formData.append("email1", settings.email1 || "");
      formData.append("email2", settings.email2 || "");
      formData.append("location", settings.location || "");
      formData.append("map_url", settings.map_url || "");
      formData.append("company_name", settings.company_name || "");
      formData.append("contact_eyebrow", settings.contact_eyebrow || "");
      formData.append("contact_title", settings.contact_title || "");
      formData.append("contact_description", settings.contact_description || "");
      formData.append("operating_hours", settings.operating_hours || "");
      formData.append("operating_hours_note", settings.operating_hours_note || "");
      formData.append("inquiry_recipient_email", settings.inquiry_recipient_email || "");
      formData.append("is_inquiry_notification_enabled", settings.is_inquiry_notification_enabled ? "1" : "0");
      formData.append("reply_to_email", settings.reply_to_email || "");
      formData.append("sender_name", settings.sender_name || "");
      formData.append("mail_mailer", settings.mail_mailer || "smtp");
      formData.append("mail_host", settings.mail_host || "");
      formData.append("mail_port", settings.mail_port ? String(settings.mail_port) : "");
      formData.append("mail_username", settings.mail_username || "");
      if (settings.mail_password) {
        formData.append("mail_password", settings.mail_password);
      }
      if (settings.remove_mail_password) {
        formData.append("remove_mail_password", "1");
      }
      formData.append("mail_encryption", settings.mail_encryption || "tls");
      formData.append("mail_from_address", settings.mail_from_address || "");
      formData.append("mail_from_name", settings.mail_from_name || "");
      formData.append("google_client_id", settings.google_client_id || "");
      if (settings.google_client_secret) {
        formData.append("google_client_secret", settings.google_client_secret);
      }
      if (settings.remove_google_client_secret) {
        formData.append("remove_google_client_secret", "1");
      }
      formData.append("is_google_login_enabled", settings.is_google_login_enabled ? "1" : "0");
      formData.append("facebook_url", settings.facebook_url || "");
      formData.append("twitter_url", settings.twitter_url || "");
      formData.append("instagram_url", settings.instagram_url || "");
      formData.append("linkedin_url", settings.linkedin_url || "");
      formData.append("tiktok_url", settings.tiktok_url || "");
      formData.append("whatsapp_url", settings.whatsapp_url || "");
      formData.append("is_cod_enabled", settings.is_cod_enabled ? "1" : "0");
      formData.append("is_standard_delivery_enabled", settings.is_standard_delivery_enabled ? "1" : "0");
      formData.append("is_express_delivery_enabled", settings.is_express_delivery_enabled ? "1" : "0");
      formData.append(
        "standard_delivery_charge",
        settings.standard_delivery_charge !== undefined && settings.standard_delivery_charge !== null && settings.standard_delivery_charge !== ""
          ? String(settings.standard_delivery_charge)
          : "100"
      );
      formData.append(
        "express_delivery_charge",
        settings.express_delivery_charge !== undefined && settings.express_delivery_charge !== null && settings.express_delivery_charge !== ""
          ? String(settings.express_delivery_charge)
          : "250"
      );
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
        setSettings((prev) => ({
          ...prev,
          ...res.setting,
          standard_delivery_charge: res.setting.standard_delivery_charge != null ? String(res.setting.standard_delivery_charge) : prev.standard_delivery_charge,
          express_delivery_charge: res.setting.express_delivery_charge != null ? String(res.setting.express_delivery_charge) : prev.express_delivery_charge,
        }));
      }
      await refetchGlobalSettings();
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
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
              onClick={() => setActiveTab("general")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "general"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>General</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("authorization")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "authorization"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Authorization</span>
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
              onClick={() => setActiveTab("checkout")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "checkout"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>E-Commerce & Checkout</span>
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching site configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General */}
              {activeTab === "general" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Branding */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Branding
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <AdminImageField
                        label="Site logo"
                        existingImageUrl={getImageUrl(settings.logo)}
                        // existingImageFilename={getImageFilename(settings.logo)}
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
                        // aspectRatioGuidance="JPEG, PNG, or WebP up to 10 MB. Transparent or wide logo artwork works best."
                        accent="cyan"
                      />

                      <div className="space-y-2">
                        <AdminImageField
                          label="Favicon"
                          existingImageUrl={getImageUrl(settings.favicon)}
                          // existingImageFilename={getImageFilename(settings.favicon)}
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
                          // aspectRatioGuidance="Use a square PNG, JPEG, or WebP. It is resized to at most 512×512 and optimized below 200 KB."
                          accent="cyan"
                          optimizationOptions={{ maxDimension: 512, targetBytes: 200 * 1024 }}
                        />
                        {/* <p className="text-slate-600 text-[10px] mt-2">
                          Square image recommended (e.g. 32×32 or 64×64px).
                        </p> */}
                      </div>
                    </div>
                  </div>

                  {/* General Company Profile */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      General Company Profile
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Short Description</label>
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

                  {/* Contact & Address Details */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                      Contact & Address Details
                    </h3>

                    {/* Contact Page Hero Content */}
                    <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-3">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        Contact Page Hero Banner
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Eyebrow Badge</label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.contact_eyebrow || ""}
                            onChange={(e) => setSettings({ ...settings, contact_eyebrow: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. Contact Raise Tech"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Hero Main Title</label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.contact_title || ""}
                            onChange={(e) => setSettings({ ...settings, contact_title: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. Let's Build Something Exceptional Together"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-400 mb-1">Hero Subtitle / Description</label>
                          <textarea
                            rows={2}
                            maxLength={2000}
                            value={settings.contact_description || ""}
                            onChange={(e) => setSettings({ ...settings, contact_description: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. Have a project in mind, need technical assistance, or want to discuss enterprise solutions?..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Headquarters & Operating Hours */}
                    <div className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/40 space-y-3">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        Headquarters & Operating Hours
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Company Name</label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.company_name || ""}
                            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. Raise Tech Pvt. Ltd."
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Operating Hours</label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.operating_hours || ""}
                            onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. Sun - Fri: 9:00 AM - 6:00 PM (NPT)"
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
                          <label className="block text-slate-400 mb-1">Operating Hours Secondary Note</label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.operating_hours_note || ""}
                            onChange={(e) => setSettings({ ...settings, operating_hours_note: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                            placeholder="e.g. 24/7 client portal access for critical issues."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Direct Contact Channels */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Primary Phone</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={settings.phone1 || ""}
                          onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          placeholder="+977 9844702762"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Secondary Phone</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={settings.phone2 || ""}
                          onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          placeholder="015705475"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Third Phone (Optional)</label>
                        <input
                          type="text"
                          maxLength={25}
                          value={settings.phone3 || ""}
                          onChange={(e) => setSettings({ ...settings, phone3: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                          placeholder="+977 9800000000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                </div>
              )}

              {/* Authorization */}
              {activeTab === "authorization" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Card 1: Outgoing Mail Server (SMTP) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                            Outgoing Mail Server (SMTP)
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 border border-cyan-800/70 text-cyan-300">
                            Client Configurable
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure your sending email address and password. Clients can update this anytime without touching code.
                        </p>
                      </div>

                      {/* Quick 1-Click Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            mail_host: "smtp.gmail.com",
                            mail_port: "587",
                            mail_encryption: "tls",
                          })}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                        >
                          Gmail
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            mail_host: "sandbox.smtp.mailtrap.io",
                            mail_port: "2525",
                            mail_encryption: "tls",
                          })}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                        >
                          Mailtrap
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({
                            ...settings,
                            mail_host: "smtp.office365.com",
                            mail_port: "587",
                            mail_encryption: "tls",
                          })}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                        >
                          Office365
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Sending Email */}
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Sending Email Address (SMTP Username)
                        </label>
                        <input
                          type="text"
                          maxLength={255}
                          value={settings.mail_username || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            mail_username: e.target.value,
                            mail_from_address: e.target.value,
                          })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. info@raisetech.com.np"
                        />
                        {/* <p className="text-[11px] text-slate-500 mt-1">
                          Account used by the server to send out emails.
                        </p> */}
                      </div>

                      {/* Sender Display Name */}
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Sender / Company Name
                        </label>
                        <input
                          type="text"
                          maxLength={255}
                          value={settings.sender_name || ""}
                          onChange={(e) => setSettings({
                            ...settings,
                            sender_name: e.target.value,
                            mail_from_name: e.target.value,
                          })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. Raise Tech"
                        />
                        {/* <p className="text-[11px] text-slate-500 mt-1">
                          Friendly name displayed in the inbox sender header.
                        </p> */}
                      </div>

                      {/* Password */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-400">
                            SMTP Password / App Password
                          </label>
                          {settings.has_mail_password && !settings.remove_mail_password && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Custom password is saved & encrypted
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showSmtpPassword ? "text" : "password"}
                            value={settings.mail_password || ""}
                            onChange={(e) => setSettings({ ...settings, mail_password: e.target.value, remove_mail_password: false })}
                            className="w-full p-2.5 pr-24 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            placeholder={
                              settings.has_mail_password && !settings.remove_mail_password
                                ? "•••••••••••• (Leave blank to keep current password)"
                                : "Enter SMTP password or 16-character Gmail App Password..."
                            }
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {/* <button
                              type="button"
                              onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
                            >
                              {showSmtpPassword ? "Hide" : "Show"}
                            </button> */}
                            {settings.has_mail_password && !settings.remove_mail_password && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, remove_mail_password: true, mail_password: "" })}
                                title="Revert to .env password"
                                className="px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-lg transition cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                        {settings.remove_mail_password ? (
                          <p className="text-[11px] text-amber-400 mt-1">
                            Password will be cleared upon saving (reverts to server default).
                          </p>
                        ) : (
                          null
                        )}
                      </div>
                    </div>

                    {/* Server Connection Parameters */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            maxLength={255}
                            value={settings.mail_host || ""}
                            onChange={(e) => setSettings({ ...settings, mail_host: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            placeholder="e.g. smtp.gmail.com"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">
                            SMTP Port
                          </label>
                          <input
                            type="text"
                            value={settings.mail_port || ""}
                            onChange={(e) => setSettings({ ...settings, mail_port: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                            placeholder="e.g. 587 or 465"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">
                            Encryption Protocol
                          </label>
                          <select
                            value={settings.mail_encryption || "tls"}
                            onChange={(e) => setSettings({ ...settings, mail_encryption: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="tls">TLS (STARTTLS - 587)</option>
                            <option value="ssl">SSL (Port 465)</option>
                            <option value="none">None (Port 25)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Visitor Inquiries & Live Test */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                        Inquiry Notifications & Verification
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Manage where contact form messages from the website arrive and test email delivery live.
                      </p>
                    </div>

                    {/* Enable / Disable Notifications Toggle */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      settings.is_inquiry_notification_enabled
                        ? "bg-slate-950/80 border-slate-700 shadow-xs"
                        : "bg-slate-950/30 border-slate-800/60 opacity-60"
                    }`}>
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-white select-none">
                        <input
                          type="checkbox"
                          checked={settings.is_inquiry_notification_enabled ?? true}
                          onChange={(e) => setSettings({ ...settings, is_inquiry_notification_enabled: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Enable Email Notifications for Visitor Inquiries</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1 pl-7">
                        When enabled, newly submitted contact inquiries will be automatically emailed to the recipient below.
                      </p>
                    </div>

                    {/* Recipient Email */}
                    <div className="text-xs max-w-lg">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-400 font-medium">
                          Notification Recipient Email
                        </label>
                        {settings.mail_username && settings.inquiry_recipient_email !== settings.mail_username && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, inquiry_recipient_email: settings.mail_username || "" })}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
                          >
                            Same as Sending Email
                          </button>
                        )}
                      </div>
                      <input
                        type="email"
                        maxLength={255}
                        value={settings.inquiry_recipient_email || ""}
                        onChange={(e) => setSettings({ ...settings, inquiry_recipient_email: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. raisetech@gmail.com"
                      />
                      {/* <p className="text-[11px] text-slate-500 mt-1">
                        Where contact form messages submitted by website visitors will be delivered.
                      </p> */}
                    </div>

                    {/* Live SMTP Verification Tool */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Live Delivery Verification
                        </h4>
                        {/* <p className="text-[11px] text-slate-400">
                          Send a real test email through your configured SMTP server to verify inbox deliverability.
                        </p> */}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-full sm:flex-1">
                          <input
                            type="email"
                            value={testEmailRecipient}
                            onChange={(e) => setTestEmailRecipient(e.target.value)}
                            placeholder="Recipient email address for test..."
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendTestEmail}
                          disabled={sendingTestEmail}
                          className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-900/30 shrink-0"
                        >
                          {sendingTestEmail ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending Test Email...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span>Send Test Email</span>
                            </>
                          )}
                        </button>
                      </div>

                      {testEmailResult && (
                        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 animate-in fade-in ${
                          testEmailResult.success
                            ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                            : "bg-red-950/40 border-red-800/60 text-red-300"
                        }`}>
                          <span className="font-bold">{testEmailResult.success ? "✓" : "✕"}</span>
                          <span>{testEmailResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google OAuth & Single Sign-On */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                          </svg>
                          Google OAuth & Single Sign-On
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Configure &ldquo;Sign in with Google&rdquo; so visitors can register and log in seamlessly.
                        </p>
                      </div>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded-xl transition shrink-0"
                      >
                        <span>Google Cloud Console</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>

                    {/* Enable / Disable Google Login Toggle */}
                    <div className={`p-4 rounded-xl border transition-all ${
                      settings.is_google_login_enabled
                        ? "bg-slate-950/80 border-slate-700 shadow-xs"
                        : "bg-slate-950/30 border-slate-800/60 opacity-60"
                    }`}>
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-white select-none">
                        <input
                          type="checkbox"
                          checked={settings.is_google_login_enabled ?? true}
                          onChange={(e) => setSettings({ ...settings, is_google_login_enabled: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Enable Google Sign-In on Website</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1 pl-7">
                        When enabled, the &ldquo;Sign in with Google&rdquo; button appears on login and registration pages.
                      </p>
                    </div>

                    {/* Google Client ID & Secret Inputs */}
                    <div className="space-y-4 text-xs">
                      {/* Client ID */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-400 font-medium">
                            Google Client ID
                          </label>
                          {/* <span className="text-[10px] text-slate-500">Public Key</span> */}
                        </div>
                        <input
                          type="text"
                          maxLength={500}
                          value={settings.google_client_id || ""}
                          onChange={(e) => setSettings({ ...settings, google_client_id: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                          placeholder="e.g. 123456789-abcdefg.apps.googleusercontent.com"
                        />
                        {/* <p className="text-[11px] text-slate-500 mt-1">
                          The OAuth 2.0 Web Client ID from Google Cloud Console. Used by the browser login popup.
                        </p> */}
                      </div>

                      {/* Client Secret */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-slate-400 font-medium">
                            Google Client Secret
                          </label>
                          {settings.has_google_client_secret && !settings.remove_google_client_secret ? (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Custom secret is saved & encrypted (AES-256)
                            </span>
                          ) : (
                            null
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type={showGoogleSecret ? "text" : "password"}
                            value={settings.google_client_secret || ""}
                            onChange={(e) => setSettings({ ...settings, google_client_secret: e.target.value, remove_google_client_secret: false })}
                            className="w-full p-2.5 pr-24 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                            placeholder={
                              settings.has_google_client_secret && !settings.remove_google_client_secret
                                ? "•••••••••••• (Leave blank to keep current secret)"
                                : "Enter client secret (e.g. GOCSPX-...)"
                            }
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {/* <button
                              type="button"
                              onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 rounded-lg transition cursor-pointer"
                            >
                              {showGoogleSecret ? "Hide" : "Show"}
                            </button> */}
                            {settings.has_google_client_secret && !settings.remove_google_client_secret && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, remove_google_client_secret: true, google_client_secret: "" })}
                                title="Revert to .env secret"
                                className="px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-lg transition cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                        {settings.remove_google_client_secret ? (
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-amber-400">
                            <span>⚠ Secret will be cleared on save (will fall back to .env).</span>
                            <button
                              type="button"
                              onClick={() => setSettings({ ...settings, remove_google_client_secret: false })}
                              className="underline hover:text-white cursor-pointer"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          null
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Setup Guidance
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Setup Instructions for Google Cloud
                    </h3>
                    <div className="text-xs text-slate-400 space-y-2.5">
                      <p>To enable Google Login on your custom domain:</p>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                        <li>Visit <strong className="text-white">Google Cloud Console &rarr; APIs &amp; Services &rarr; Credentials</strong>.</li>
                        <li>Click <strong className="text-white">Create Credentials &rarr; OAuth Client ID</strong>.</li>
                        <li>Select Application Type: <strong className="text-white">Web application</strong>.</li>
                        <li>Under <strong className="text-white">Authorized JavaScript origins</strong>, add:
                          <div className="mt-1 font-mono bg-slate-950 p-2.5 rounded-lg text-emerald-400 space-y-1 select-all border border-slate-800">
                            <div>http://localhost:3000</div>
                            <div>http://194.233.90.79:3002</div>
                            <div>https://raisetech.com.np (or your final production domain)</div>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">Note: Do not add a trailing slash (/) in Google Cloud Console.</span>
                        </li>
                        <li>Copy the generated <strong className="text-white">Client ID</strong> and <strong className="text-white">Client Secret</strong> into the fields above and click <strong className="text-white">Save Settings</strong>.</li>
                      </ol>
                    </div>
                  </div> */}
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

              {/* E-Commerce & Checkout */}
              {activeTab === "checkout" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                        E-Commerce Delivery Options & Charges
                      </h3>
                      {/* <p className="text-xs text-slate-400 mt-1">
                        Select which delivery methods are available for customer orders. If both options are unchecked, the delivery method step will not appear at checkout and delivery will be free.
                      </p> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                      {/* Standard Delivery Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        settings.is_standard_delivery_enabled
                          ? "bg-slate-950/80 border-slate-700 shadow-xs"
                          : "bg-slate-950/30 border-slate-800/60 opacity-60"
                      }`}>
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-white mb-3 select-none">
                          <input
                            type="checkbox"
                            checked={settings.is_standard_delivery_enabled ?? true}
                            onChange={(e) => setSettings({ ...settings, is_standard_delivery_enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>Enable Standard Delivery</span>
                        </label>

                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Standard Delivery Charge (NPR)</label>
                          <input
                            type="text"
                            min="0"
                            step="0.01"
                            disabled={!settings.is_standard_delivery_enabled}
                            value={settings.standard_delivery_charge ?? "100"}
                            onChange={(e) => setSettings({ ...settings, standard_delivery_charge: e.target.value })}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            placeholder="100"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">Fee applied when standard delivery is selected.</p>
                        </div>
                      </div>

                      {/* Express Delivery Card */}
                      <div className={`p-4 rounded-xl border transition-all ${
                        settings.is_express_delivery_enabled
                          ? "bg-slate-950/80 border-slate-700 shadow-xs"
                          : "bg-slate-950/30 border-slate-800/60 opacity-60"
                      }`}>
                        <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-white mb-3 select-none">
                          <input
                            type="checkbox"
                            checked={settings.is_express_delivery_enabled ?? true}
                            onChange={(e) => setSettings({ ...settings, is_express_delivery_enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>Enable Express Priority Delivery</span>
                        </label>

                        <div>
                          <label className="block text-slate-400 text-xs mb-1">Express Delivery Charge (NPR)</label>
                          <input
                            type="text"
                            min="0"
                            step="0.01"
                            disabled={!settings.is_express_delivery_enabled}
                            value={settings.express_delivery_charge ?? "250"}
                            onChange={(e) => setSettings({ ...settings, express_delivery_charge: e.target.value })}
                            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            placeholder="250"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">Fee applied when express delivery is selected.</p>
                        </div>
                      </div>
                    </div>
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
