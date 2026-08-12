"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const [unreadInquiries, setUnreadInquiries] = useState<number>(0);

  useEffect(() => {
    async function getUnread() {
      try {
        const res = await fetchApi<{ unread_count: number }>("/inquiries/unread");
        setUnreadInquiries(res.unread_count || 0);
      } catch (err) {
        console.error("Could not fetch unread count", err);
      }
    }
    getUnread();
  }, []);

  const adminModules = [
    {
      title: "Contact Inquiries",
      description: "View and respond to client message submissions from the contact page.",
      href: "/admin/inquiries",
      badge: unreadInquiries > 0 ? `${unreadInquiries} Unread` : null,
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Orders Management",
      description: "Manage client product and paper roll order requests.",
      href: "/admin/orders",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-[#01A7E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: "Products & Paper Rolls",
      description: "Update paper roll catalog items, pricing, stock, and specs.",
      href: "/admin/products",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: "Services Management",
      description: "Manage IT services, custom software development offerings, and headers.",
      href: "/admin/services",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-6z" />
        </svg>
      ),
    },
    {
      title: "Team Members",
      description: "Add, update or remove company executive and developer profiles.",
      href: "/admin/team",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Software Products",
      description: "Manage pre-built software solutions, POS systems, and tools.",
      href: "/admin/software",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: "Site Navigation & Settings",
      description: "Main site contact parameters, social links, and COD settings.",
      href: "/admin/settings",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Administration Control Panel</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Admin Dashboard</h1>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
          >
            ← Back to Main Site
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-cyan-500/30 transition">
                    {mod.icon}
                  </div>
                  {mod.badge && (
                    <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 rounded-full animate-pulse">
                      {mod.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {mod.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Access Module</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

