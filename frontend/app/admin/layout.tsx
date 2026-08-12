"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run auth check on login/signup pages
    if (pathname === "/admin/login" || pathname === "/admin/signup") return;

    if (!isLoading) {
      if (!user) {
        router.replace("/admin/login");
      } else if (user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, isLoading, router, pathname]);

  // Always render login/signup pages without any guard or sidebar
  if (pathname === "/admin/login" || pathname === "/admin/signup") {
    return <>{children}</>;
  }

  // Show spinner while verifying for all other admin pages
  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 w-full min-w-0">{children}</main>
    </div>
  );
}
