"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/data/homeData';
import MobileNav from './MobileNav';

export default function Header() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <header role="banner" className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#01A7E5]">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/images/home/logo.png"
                alt="Raise Tech Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#01A7E5] group-hover:text-[#018bc0] transition-colors">
                Raise Tech
              </span>
              <span className="text-[11px] font-medium text-gray-500 tracking-wider uppercase">
                Pvt. Ltd.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 ml-auto">
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
                      className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-2 focus-visible:outline-2 focus-visible:outline-[#01A7E5] rounded-md ${
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
                      <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
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
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </header>
  );
}
