"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getImageUrl } from "@/lib/api";

export default function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-white text-[#404040] border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-200/80">
          {/* Column 1: Company Logo & About */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-3 group inline-block"
            >
              {/* <div className="relative h-10 sm:h-12 shrink-0 flex items-center">
                {settings?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(settings.logo)}
                    alt="Raise Tech Logo"
                    className="h-10 sm:h-12 w-auto max-w-[150px] object-contain"
                  />
                ) : (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src="/images/home/logo.png"
                      alt="Raise Tech Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div> */}
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-[#01A7E5]">
                  RAISE TECH
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-gray-500 max-w-xs">
              {settings?.short_description ||
                "We provide comprehensive IT solutions including AI, Robotics, Automation, Web and App development, Digital Marketing, and more. With a focus on innovation and quality, we help businesses embrace the future of technology with confidence."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-bold text-[#01A7E5] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-gray-600">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#01A7E5] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#01A7E5] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#01A7E5] transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-[#01A7E5] transition-colors"
                >
                  Our Products
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#01A7E5] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h3 className="text-base font-bold text-[#01A7E5] mb-4">
              Contact Details
            </h3>
            <ul className="space-y-3.5 text-xs text-gray-600">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#01A7E5] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-3 h-3"
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
                </div>
                <span>
                  {[settings?.phone1, settings?.phone2]
                    .filter(Boolean)
                    .join(", ") || "+977 9844702762, 015705475"}
                </span>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#01A7E5] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-3 h-3"
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
                </div>
                <span>{settings?.email1 || "info@raisetech.com.np"}</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#01A7E5] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-3 h-3"
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
                </div>
                <span>
                  {settings?.location || "Bhakti Thapa Sadak, Kathmandu"}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Connected */}
          <div>
            <h3 className="text-base font-bold text-[#01A7E5] mb-2">
              Stay Connected
            </h3>

            {subscribed ? (
              <div className="bg-cyan-50 border border-cyan-200 text-[#01A7E5] text-xs rounded-lg p-3">
                Successfully Subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2 bg-white text-xs text-gray-900 border border-cyan-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#01A7E5] placeholder-gray-400"
                  aria-label="Email address"
                />

                {error && <p className="text-xs text-rose-600">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-[#01A7E5] hover:bg-[#018bc0] text-white text-xs font-semibold py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <span>Submit</span>
                  <svg
                    className="w-3.5 h-3.5 transform rotate-45"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom / Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href={settings?.facebook_url || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#01A7E5] hover:text-[#01A7E5] transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <a
              href={settings?.instagram_url || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#01A7E5] hover:text-[#01A7E5] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            <a
              href={settings?.twitter_url || "https://twitter.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#01A7E5] hover:text-[#01A7E5] transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          <p>© 2026 All rights reserved.</p> |<p> developed by </p>
        </div>
      </div>
    </footer>
  );
}
