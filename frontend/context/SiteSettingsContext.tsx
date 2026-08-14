"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
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
    load();
  }, [load]);

  // Keep the browser tab favicon in sync once settings load.
  // NOTE: this is a client-side swap after hydration — it won't affect the
  // very first paint of a fresh page load, only subsequent tab/bookmark
  // display. A fully dynamic favicon on first paint needs a server-side
  // app/icon.tsx route instead.
  useEffect(() => {
    if (!settings?.favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = settings.favicon;
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