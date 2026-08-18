"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi, getImageUrl } from "@/lib/api";
import { SiteSettings } from "@/lib/types";

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      const res = await fetchApi<{ setting: SiteSettings }>("/settings");
      setSettings(res.setting || null);
    } catch {
      // Fail silently — header/footer fall back to static defaults below.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  // Keep the browser tab favicon in sync once settings load.
  useEffect(() => {
    if (!settings?.favicon) return;
    const faviconUrl = getImageUrl(settings.favicon);
    
    let links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (links.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    } else {
      links.forEach((link) => {
        link.href = faviconUrl;
      });
    }
  }, [settings?.favicon]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refetch: load }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return ctx;
}
