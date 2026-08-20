import { fetchApi, type ApiRequestError } from "@/lib/api";
import type { Portfolio } from "@/lib/types/home";

export interface PortfolioHeader {
  id: number;
  title: string | null;
  hero_image: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PortfolioPageData {
  status?: string;
  header: PortfolioHeader | null;
  portfolio: Portfolio[];
  supportsHeaderSettings: boolean;
}

interface DedicatedPortfolioResponse {
  status?: string;
  header?: PortfolioHeader | null;
  portfolio?: Portfolio[];
}

interface LegacyHomeResponse {
  status?: string;
  data?: {
    portfolio?: Portfolio[];
  };
}

function isNotFound(error: unknown): boolean {
  return (error as ApiRequestError | null)?.status === 404;
}

async function requestWithLegacyFallback<T>(
  endpoint: string,
  legacyEndpoint: string,
  options: RequestInit,
): Promise<T> {
  try {
    return await fetchApi<T>(endpoint, options);
  } catch (error) {
    if (!isNotFound(error)) throw error;
    return fetchApi<T>(legacyEndpoint, options);
  }
}

/**
 * Prefer the dedicated portfolio API. Older deployed backends expose the same
 * projects only through the homepage payload, so normalize that response until
 * the dedicated route is deployed everywhere.
 */
export async function fetchPortfolioData(): Promise<PortfolioPageData> {
  try {
    const response = await fetchApi<DedicatedPortfolioResponse>("/portfolio");

    return {
      status: response.status,
      header: response.header ?? null,
      portfolio: response.portfolio ?? [],
      supportsHeaderSettings: true,
    };
  } catch (error) {
    if (!isNotFound(error)) throw error;

    const response = await fetchApi<LegacyHomeResponse>("/home");

    return {
      status: response.status,
      header: null,
      portfolio: response.data?.portfolio ?? [],
      supportsHeaderSettings: false,
    };
  }
}

export function createPortfolioItem<T>(formData: FormData): Promise<T> {
  return requestWithLegacyFallback<T>("/portfolio/store", "/home/portfolio/store", {
    method: "POST",
    body: formData,
  });
}

export function updatePortfolioItem<T>(id: number, formData: FormData): Promise<T> {
  return requestWithLegacyFallback<T>(`/portfolio/${id}`, `/home/portfolio/${id}`, {
    method: "POST",
    body: formData,
  });
}

export function deletePortfolioItem<T>(id: number): Promise<T> {
  return requestWithLegacyFallback<T>(`/portfolio/${id}`, `/home/portfolio/${id}`, {
    method: "DELETE",
  });
}
