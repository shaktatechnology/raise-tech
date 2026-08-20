"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_LINKS } from '@/lib/data/homeData';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { getImageUrl } from '@/lib/api';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function MobileNav({ isOpen, onClose, onOpenLogin }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [productSubmenuOpen, setProductSubmenuOpen] = useState(false);

  // Close menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Handle escape key and body overflow lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-20 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" onClick={onClose} className="flex items-center gap-3">
                <div className="relative h-9 shrink-0 flex items-center">
                  {settings?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(settings.logo)}
                      alt="Raise Tech Logo"
                      className="h-9 w-auto max-w-[140px] object-contain"
                    />
                  ) : (
                    <div className="relative w-9 h-9">
                      <Image
                        src="/images/home/logo.png"
                        alt="Raise Tech Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-lg focus-visible:outline-2 focus-visible:outline-[#01A7E5] cursor-pointer"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Items */}
            <nav aria-label="Mobile Navigation Links" className="p-4 flex-1 space-y-1">
              {NAV_LINKS.map((link, idx) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                if (link.dropdown) {
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="border-b border-gray-100 pb-1"
                    >
                      <button
                        type="button"
                        onClick={() => setProductSubmenuOpen(!productSubmenuOpen)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-semibold transition-colors cursor-pointer ${
                          isActive ? 'text-[#01A7E5] bg-cyan-50' : 'text-gray-800 hover:bg-gray-50'
                        }`}
                        aria-expanded={productSubmenuOpen}
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${productSubmenuOpen ? 'rotate-180 text-[#01A7E5]' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Submenu */}
                      <AnimatePresence>
                        {productSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="pl-4 pr-2 py-1 space-y-1 bg-slate-50 rounded-lg my-1 overflow-hidden"
                          >
                            {link.dropdown.map((subItem) => {
                              const isSubActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={onClose}
                                  className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                                    isSubActive ? 'text-[#01A7E5] font-bold bg-white shadow-2xs' : 'text-gray-700 hover:text-[#01A7E5]'
                                  }`}
                                >
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={`block px-3 py-3 rounded-lg text-base font-semibold transition-colors border-b border-gray-100 ${
                        isActive ? 'text-[#01A7E5] font-bold bg-cyan-50' : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Auth CTA in Mobile Menu */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 px-1">
                    Signed in as <span className="font-bold text-[#01A7E5]">{user.name}</span>
                  </div>
                  <Link
                    href="/my-orders"
                    onClick={onClose}
                    className="block w-full py-2.5 text-center bg-[#01A7E5] hover:bg-[#018bc0] text-white font-medium text-sm rounded-lg shadow-xs transition"
                  >
                    My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="block w-full py-2.5 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition"
                    >
                      Go to Admin Panel
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { logout(); onClose(); }}
                    className="block w-full py-2.5 text-center bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-lg transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenLogin(); }}
                  className="block w-full py-3 text-center bg-[#01A7E5] hover:bg-[#0190c7] text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
