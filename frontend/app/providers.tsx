"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { DeleteConfirmationProvider } from "@/components/admin/DeleteConfirmation";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <DeleteConfirmationProvider>
            <SiteSettingsProvider>{children}</SiteSettingsProvider>
          </DeleteConfirmationProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
