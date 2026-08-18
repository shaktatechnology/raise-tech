"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getImageUrl } from "@/lib/api";

export default function AdminHeader({ title }: { title: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();

  const navLinks = [
    { label: "Dashboard", href: "/admin" },
    { label: "Inquiries", href: "/admin/inquiries" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Products", href: "/admin/products" },
    { label: "Services", href: "/admin/services" },
    { label: "Team", href: "/admin/team" },
    { label: "Software", href: "/admin/software" },
    { label: "Settings", href: "/admin/settings" },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-black text-white text-lg tracking-tight">
              {settings?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(settings.logo)} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <span className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">
                  RT
                </span>
              )}
              <span>RaiseTech <span className="text-xs text-cyan-400 font-mono uppercase bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">Admin</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              View Site
            </Link>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-semibold text-white">{user?.name || "Admin User"}</div>
                <div className="text-[10px] text-slate-400">{user?.email || "admin@raisetech.com"}</div>
              </div>

              <button
                onClick={logout}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Log out of Admin Control"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Navigation */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded-md transition ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
