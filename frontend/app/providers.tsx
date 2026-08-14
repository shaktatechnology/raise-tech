"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <SiteSettingsProvider>{children}</SiteSettingsProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}