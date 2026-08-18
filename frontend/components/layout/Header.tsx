"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/data/homeData';
import { useCart } from '@/context/CartContext';
import MobileNav from './MobileNav';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import LoginModal from '@/components/auth/LoginModal';
import { getImageUrl } from '@/lib/api';

export default function Header() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header role="banner" className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 px-0 sm:px-2">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#01A7E5]">
              <div className="relative h-8 sm:h-9 max-w-[170px] flex items-center shrink-0">
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
              </div>
              {/* <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-[#01A7E5] group-hover:text-[#018bc0] transition-colors">
                  Raise Tech
                </span>
                <span className="text-[11px] font-medium text-gray-500 tracking-wider uppercase">
                  Pvt. Ltd.
                </span>
              </div> */}
            </Link>

          {/* Desktop Navigation Links & Cart Icon */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
            <nav aria-label="Main Navigation" className="flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                if (link.dropdown) {
                  return (
                    <div
                      key={link.label}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setDropdownOpen(!dropdownOpen);
                          }
                        }}
                        aria-expanded={dropdownOpen}
                        aria-haspopup="true"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 focus-visible:outline-2 focus-visible:outline-[#01A7E5] rounded-md cursor-pointer ${
                          isActive || dropdownOpen ? 'text-[#01A7E5]' : 'text-gray-900 hover:text-[#01A7E5]'
                        }`}
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#01A7E5]' : 'text-gray-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {dropdownOpen && (
                        <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          {link.dropdown.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setDropdownOpen(false)}
                                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                  isSubActive
                                    ? 'text-[#01A7E5] bg-cyan-50 font-semibold'
                                    : 'text-gray-700 hover:text-[#01A7E5] hover:bg-gray-50'
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
                    className={`text-sm font-medium transition-colors relative py-2 focus-visible:outline-2 focus-visible:outline-[#01A7E5] rounded-md ${
                      isActive ? 'text-[#01A7E5] font-semibold' : 'text-gray-900 hover:text-[#01A7E5]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#01A7E5] rounded-full" />
                    )}
                  </Link>
                );
              })}
              {user && (
                <Link
                  href="/my-orders"
                  className={`text-sm font-medium transition-colors relative py-2 focus-visible:outline-2 focus-visible:outline-[#01A7E5] rounded-md ${
                    pathname === "/my-orders"
                      ? "text-[#01A7E5] font-semibold"
                      : "text-gray-900 hover:text-[#01A7E5]"
                  }`}
                >
                  My Orders
                  {pathname === "/my-orders" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#01A7E5] rounded-full" />
                  )}
                </Link>
              )}
            </nav>

            {/* Header Cart Button & User Auth */}
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative p-2.5 text-gray-700 hover:text-[#01A7E5] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5] rounded-full hover:bg-gray-50"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#01A7E5] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 bg-[#01A7E5] hover:bg-[#018bc0] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle & Cart Icon */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-[#01A7E5] rounded-lg focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#01A7E5] text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 text-gray-700 hover:text-[#01A7E5] rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

        {/* Mobile Drawer */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onOpenLogin={() => setLoginModalOpen(true)}
        />
      </header>

      {/* Login Modal Popup */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}