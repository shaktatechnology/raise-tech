"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <SiteSettingsProvider>{children}</SiteSettingsProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}