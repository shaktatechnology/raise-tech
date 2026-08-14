// Target path: src/lib/data/getAboutPageData.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// The Laravel origin (no trailing /api) that /storage/** paths are actually
// served from. Used to turn DB-stored relative paths into absolute URLs.
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export interface AboutSettings {
  id: number;
  hero_image: string | null;
  about_description: string | null;
  about_image: string | null;
  what_we_do_image: string | null;
  mission: string | null;
  vision: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WhatWeDoApiItem {
  id: number;
  title: string;
  description: string;
}

export interface WhyChooseUsApiItem {
  id: number;
  name: string;
  description: string;
}

export interface AboutPageData {
  about: AboutSettings | null;
  whatWeDoItems: WhatWeDoApiItem[];
  whyChooseUsItems: WhyChooseUsApiItem[];
}

/**
 * next/image throws (not just renders a broken image) if `src` isn't a
 * leading-slash relative path or an http(s) URL. Admin-entered values can be
 * empty, whitespace, or plain placeholder text (e.g. seeded Faker data), so
 * every image field from the API must be validated before use.
 */
export function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  return trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Resolves a path stored by the backend (e.g. "/storage/about/xyz.png")
 * into an absolute URL pointing at the Laravel origin. Without this,
 * "/storage/..." resolves against the Next.js app itself (which has no
 * such route) instead of the API server, so the image 404s. Mirrors the
 * getImageUrl() convention already used on the product detail page and
 * the admin About page.
 */
function resolveStorageImageUrl(path: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/storage/')) return `${BACKEND_ORIGIN}${trimmed}`;
  if (trimmed.startsWith('storage/')) return `${BACKEND_ORIGIN}/${trimmed}`;
  if (trimmed.startsWith('/')) return `${BACKEND_ORIGIN}${trimmed}`;
  return `${BACKEND_ORIGIN}/storage/${trimmed}`;
}

const EMPTY_ABOUT_DATA: AboutPageData = {
  about: null,
  whatWeDoItems: [],
  whyChooseUsItems: [],
};

/**
 * Fetches About Page data from GET /api/about for server-rendering.
 * Never throws — on any failure it returns EMPTY_ABOUT_DATA so the page
 * can fall back to the static copy in aboutData.ts instead of crashing.
 */
export async function getAboutPageData(): Promise<AboutPageData> {
  try {
    const res = await fetch(`${API_BASE_URL}/about`, {
      // Re-fetch periodically so admin edits show up without a full redeploy.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`About API returned ${res.status}`);
      return EMPTY_ABOUT_DATA;
    }

    const json = await res.json();
    const data = json?.data;

    if (!data) return EMPTY_ABOUT_DATA;

    const about: AboutSettings | null = data.about
      ? {
          ...data.about,
          hero_image: resolveStorageImageUrl(data.about.hero_image),
          about_image: resolveStorageImageUrl(data.about.about_image),
          what_we_do_image: resolveStorageImageUrl(data.about.what_we_do_image),
        }
      : null;

    return {
      about,
      whatWeDoItems: Array.isArray(data.what_we_do_items) ? data.what_we_do_items : [],
      whyChooseUsItems: Array.isArray(data.why_choose_us_items) ? data.why_choose_us_items : [],
    };
  } catch (err) {
    console.error("Failed to fetch About page data:", err);
    return EMPTY_ABOUT_DATA;
  }
}