"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/lib/data";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const isActive = (href: string, children?: { href: string }[]) => {
    if (href === "/") return pathname === "/";
    if (children) return children.some((c) => pathname.startsWith(c.href));
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.children);
            if (link.children) {
              return (
                <div key={link.label} className="group relative">
                  <button
                    className={`flex items-center gap-1 py-2 text-[15px] font-medium transition-colors ${
                      active ? "text-brand-blue" : "text-brand-navy hover:text-brand-blue"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full w-56 -translate-y-1 rounded-md border border-black/5 bg-white py-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-[14px] transition-colors ${
                          pathname.startsWith(child.href)
                            ? "text-brand-blue"
                            : "text-brand-ink hover:bg-brand-mist hover:text-brand-blue"
                        }`}
                      >
                        <span className="mr-1 text-brand-blue">»</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 text-[15px] font-medium transition-colors ${
                  active ? "text-brand-blue" : "text-brand-navy hover:text-brand-blue"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-brand-navy md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-black/5 bg-white px-4 pb-4 md:hidden">
          {navLinks.map((link) => {
            if (link.children) {
              return (
                <div key={link.label} className="border-b border-black/5 py-2">
                  <button
                    className="flex w-full items-center justify-between py-2 text-[15px] font-medium text-brand-navy"
                    onClick={() => setMobileProductsOpen((v) => !v)}
                  >
                    {link.label}
                    <ChevronDown className={`size-4 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileProductsOpen && (
                    <div className="ml-3 flex flex-col gap-1 pb-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="py-1.5 text-[14px] text-brand-ink hover:text-brand-blue"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-black/5 py-3 text-[15px] font-medium text-brand-navy hover:text-brand-blue"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
