"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchApi } from "@/lib/api";
import { CONTACT_INFO, CONTACT_FAQS } from "@/lib/data/contactData";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Reveal from "@/components/motion/Reveal";
import StaggerGroup from "@/components/motion/StaggerGroup";
import StaggerItem from "@/components/motion/StaggerItem";

const MAP_EMBED_CACHE_PREFIX = "map_embed_cache:";

function toEmbeddableMapUrl(url?: string | null): string | null {
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

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const directEmbedUrl = toEmbeddableMapUrl(settings?.map_url);

  const [resolvedEmbedUrl, setResolvedEmbedUrl] = useState<string | null>(null);
  const [resolvingMap, setResolvingMap] = useState(false);

  useEffect(() => {
    const mapUrl = settings?.map_url;
    if (!mapUrl || directEmbedUrl) return;

    // Capture as a definitively-typed string so TypeScript narrows it
    // correctly inside the async closure below.
    const url: string = mapUrl;
    const cacheKey = `${MAP_EMBED_CACHE_PREFIX}${url}`;
    let cancelled = false;

    // All setState calls live inside this async function — never directly in
    // the synchronous effect body — satisfying react-hooks/set-state-in-effect.
    async function resolve() {
      const cached =
        typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;

      if (cached) {
        if (!cancelled) setResolvedEmbedUrl(cached);
        return;
      }

      if (!cancelled) setResolvingMap(true);
      try {
        const res = await fetch(
          `/api/resolve-map-embed?url=${encodeURIComponent(url)}`
        );
        const data: { embedUrl?: string } = await res.json();
        if (cancelled) return;
        if (data.embedUrl) {
          setResolvedEmbedUrl(data.embedUrl);
          localStorage.setItem(cacheKey, data.embedUrl);
        }
      } catch {
        // Silently fall back to plain Maps link
      } finally {
        if (!cancelled) setResolvingMap(false);
      }
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [settings?.map_url, directEmbedUrl]);

  const embedUrl = directEmbedUrl || resolvedEmbedUrl;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetchApi<{ message: string }>("/inquiry", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccessMsg(
        res.message ||
          "Thank you for reaching out! Your message has been sent successfully."
      );
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        contact_no: "",
        message: "",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please check your inputs and try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block text-[#01A7E5] font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 px-3 py-1 bg-cyan-950/60 border border-cyan-500/20 rounded-full"
          >
            Contact Raise Tech
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
          >
            {CONTACT_INFO.subtitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-slate-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            {CONTACT_INFO.description}
          </motion.p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5">
            <StaggerGroup className="space-y-6">
              {/* Location & Office Card */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center shrink-0 text-[#01A7E5]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Headquarters</h3>
                      <p className="text-gray-600 text-sm mt-1">{CONTACT_INFO.companyName}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{settings?.location || CONTACT_INFO.address}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* Direct Contact Card */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center shrink-0 text-[#01A7E5]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Email & Phone</h3>
                      <div className="text-gray-600 text-sm mt-2 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-gray-900">Email:</span>
                          <a href={`mailto:${settings?.email1 || CONTACT_INFO.email}`} className="text-[#01A7E5] font-medium hover:underline">
                            {settings?.email1 || CONTACT_INFO.email}
                          </a>
                          {(settings?.email2 || CONTACT_INFO.supportEmail) && (
                            <>
                              <span className="text-gray-300">|</span>
                              <a href={`mailto:${settings?.email2 || CONTACT_INFO.supportEmail}`} className="text-[#01A7E5] font-medium hover:underline">
                                {settings?.email2 || CONTACT_INFO.supportEmail}
                              </a>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-gray-900">Phone:</span>
                          {[
                            settings?.phone1 || CONTACT_INFO.phone,
                            settings?.phone2 || CONTACT_INFO.phone2,
                            settings?.phone3 || CONTACT_INFO.phone3,
                          ]
                            .filter((p): p is string => Boolean(p && p.trim()))
                            .map((phoneNum, idx, arr) => (
                              <React.Fragment key={idx}>
                                <a href={`tel:${phoneNum}`} className="text-gray-700 font-medium hover:text-[#01A7E5]">
                                  {phoneNum}
                                </a>
                                {idx < arr.length - 1 && <span className="text-gray-300">|</span>}
                              </React.Fragment>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>

              {/* Business Hours Card */}
              <StaggerItem>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center shrink-0 text-[#01A7E5]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Operating Hours</h3>
                      <p className="text-gray-600 text-sm mt-1">{CONTACT_INFO.hours}</p>
                      <p className="text-xs text-gray-400 mt-1">24/7 client portal access for critical issues.</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </StaggerGroup>
          </div>

          {/* Right Column: Inquiry Form */}
          <Reveal variant="slideRight" className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-6">
                Fill in the details below and our team will get back to you promptly.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#01A7E5] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#01A7E5] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#01A7E5] focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Contact No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_no"
                      required
                      value={formData.contact_no}
                      onChange={handleChange}
                      placeholder="+977-9800000000"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#01A7E5] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project requirements or questions..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#01A7E5] focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#01A7E5] hover:bg-[#0190c7] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>

        {/* Map Section */}
        <Reveal variant="fadeUp" className="mt-8 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

          <div className="w-full h-72 sm:h-96 bg-gray-100">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location Map"
              />
            ) : resolvingMap ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-[#01A7E5] rounded-full animate-spin" />
                <p className="text-sm">Loading map...</p>
              </div>
            ) : settings?.map_url ? (
              <a
                href={settings.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-[#01A7E5] hover:bg-cyan-50/40 transition-colors"
              >
                <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-full flex items-center justify-center text-[#01A7E5]">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold">View Our Location on Google Maps</span>
              </a>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="w-14 h-14 bg-gray-200/60 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm">Map location has not been configured yet.</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* FAQs Section */}
        <Reveal variant="fadeUp" className="mt-16 bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_FAQS.map((faq, idx) => (
              <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-[#01A7E5]/30">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{faq.question}</h4>
                <p className="text-gray-600 text-xs leading-relaxed text-justify">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}