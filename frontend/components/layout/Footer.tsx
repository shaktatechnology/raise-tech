"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getImageUrl } from "@/lib/api";

const footerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Footer() {
  const { settings } = useSiteSettings();

  const socialLinks = [
    {
      key: "facebook",
      url: settings?.facebook_url?.trim(),
      label: "Facebook",
      hoverClass: "hover:border-[#01A7E5] hover:bg-[#01A7E5] hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      url: settings?.instagram_url?.trim(),
      label: "Instagram",
      hoverClass:
        "hover:border-pink-500 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      url: settings?.twitter_url?.trim(),
      label: "Twitter",
      hoverClass: "hover:border-black hover:bg-black hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "linkedin",
      url: settings?.linkedin_url?.trim(),
      label: "LinkedIn",
      hoverClass: "hover:border-[#0077B5] hover:bg-[#0077B5] hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      url: settings?.tiktok_url?.trim(),
      label: "TikTok",
      hoverClass: "hover:border-black hover:bg-black hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.27 6.27 0 0 0 1.86-4.46V8.77a8.18 8.18 0 0 0 4.92 1.64v-3.39a4.85 4.85 0 0 1-1-.33z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      url: settings?.whatsapp_url?.trim(),
      label: "WhatsApp",
      hoverClass: "hover:border-emerald-500 hover:bg-emerald-500 hover:text-white",
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      ),
    },
  ].filter((item) => Boolean(item.url));

  return (
    <footer className="relative bg-white text-[#404040] border-t border-gray-100 pt-16 pb-8 overflow-hidden">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#01A7E5]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={footerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-200/80"
        >
          {/* Column 1: Company Logo & About */}
          <motion.div variants={columnVariants} className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-10 max-w-[200px] flex items-center shrink-0"
              >
                {settings?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(settings.logo)}
                    alt="Raise Tech Logo"
                    className="h-full w-auto max-w-full object-contain object-left"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/images/home/logo.png"
                    alt="Raise Tech Logo"
                    className="h-full w-auto max-w-full object-contain object-left"
                  />
                )}
              </motion.div>
            </Link>

            <p className="text-xs leading-relaxed text-gray-500 max-w-xs text-justify">
              {settings?.short_description ||
                "We provide comprehensive IT solutions including AI, Robotics, Automation, Web and App development, Digital Marketing, and more. With a focus on innovation and quality, we help businesses embrace the future of technology with confidence."}
            </p>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={columnVariants}>
            <h3 className="text-base font-bold text-[#01A7E5] mb-4 inline-block multicolor-text-hover cursor-pointer select-none tracking-tight">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-gray-600">
              {[
                { href: "/portfolio", label: "Portfolio" },
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/products", label: "Our Products" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center hover:text-[#01A7E5] hover:translate-x-1.5 transition-all duration-200"
                  >
                    <span className="multicolor-text-hover">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Contact Details */}
          <motion.div variants={columnVariants}>
            <h3 className="text-base font-bold text-[#01A7E5] mb-4 inline-block multicolor-text-hover cursor-pointer select-none tracking-tight">
              Contact Details
            </h3>
            <ul className="space-y-3.5 text-xs text-gray-600">
              <li className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-7 h-7 rounded-full bg-[#01A7E5] group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </motion.div>
                <span className="group-hover:text-slate-900 transition-colors">
                  {[settings?.phone1, settings?.phone2, settings?.phone3]
                    .filter(Boolean)
                    .join(", ") || "+977 9844702792, 015705475"}
                </span>
              </li>

              <li className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-7 h-7 rounded-full bg-[#01A7E5] group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </motion.div>
                <span className="group-hover:text-slate-900 transition-colors">
                  {[settings?.email1, settings?.email2]
                    .filter(Boolean)
                    .join(", ") || "info@raisetech.com.np"}
                </span>
              </li>

              <li className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="w-7 h-7 rounded-full bg-[#01A7E5] group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </motion.div>
                <span className="group-hover:text-slate-900 transition-colors">
                  {settings?.location || "Bhakti Thapa Sadak, Kathmandu"}
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Stay Connected / Quick Inquiry */}
          <motion.div variants={columnVariants} className="space-y-3">
            <h3 className="text-base font-bold text-[#01A7E5] mb-2 inline-block multicolor-text-hover cursor-pointer select-none tracking-tight">
              Stay Connected
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Have questions or need a custom quote for our IT solutions, POS software, or paper products? Reach out to our team today.
            </p>

            <div className="pt-1 space-y-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/contact"
                  className="w-full bg-[#01A7E5] hover:bg-[#018bc0] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md group cursor-pointer"
                >
                  <span>Request a Free Quote</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Bottom / Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          {/* Social Icons - only renders icons whose URLs are entered by the admin */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.key}
                  whileHover={{ y: -3, scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full border border-gray-200 bg-gray-50/50 flex items-center justify-center text-gray-600 transition-colors shadow-2xs ${social.hoverClass}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <p>© {new Date().getFullYear()} Raise Tech. All rights reserved.</p>
            <span className="hidden sm:inline text-gray-300">|</span>
            <p>
              Developed by{" "}
              <a
                href="https://shaktatechnology.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#01A7E5] multicolor-text-hover hover:underline"
              >
                Shakta Technology
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
