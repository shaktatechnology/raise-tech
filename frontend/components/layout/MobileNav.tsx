"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/data/homeData';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [productSubmenuOpen, setProductSubmenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    onClose();
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs transition-opacity"
      aria-modal="true"
      role="dialog"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#01A7E5]">Raise Tech</span>
            <span className="text-xs text-gray-500 font-medium">Pvt. Ltd.</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-lg focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
            aria-label="Close navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 flex-1 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            if (link.dropdown) {
              return (
                <div key={link.label} className="border-b border-gray-100 pb-1">
                  <button
                    onClick={() => setProductSubmenuOpen(!productSubmenuOpen)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive ? 'text-[#01A7E5] bg-cyan-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-expanded={productSubmenuOpen}
                  >
                    <span>{link.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${productSubmenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Submenu */}
                  {productSubmenuOpen && (
                    <div className="pl-4 pr-2 py-1 space-y-1 bg-slate-50 rounded-lg my-1">
                      {link.dropdown.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={onClose}
                            className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${
                              isSubActive ? 'text-[#01A7E5] font-semibold bg-white shadow-2xs' : 'text-gray-600 hover:text-[#01A7E5]'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors border-b border-gray-100 ${
                  isActive ? 'text-[#01A7E5] font-semibold bg-cyan-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Contact CTA in Mobile Menu */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <Link
            href="/contact"
            onClick={onClose}
            className="block w-full py-3 text-center bg-[#01A7E5] text-white font-semibold rounded-lg shadow-sm hover:bg-[#0190c7] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
