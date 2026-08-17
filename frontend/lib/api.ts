const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiRequestError extends Error {
  status?: number;
  errors?: Record<string, string[]> | null;
}

// Existing callers without a response generic rely on dynamic JSON response shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Retrieve auth token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    "Accept": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `API call failed with status ${response.status}`
    ) as ApiRequestError;
    error.errors = errorData.errors || null;
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Resolves an image path returned by the Laravel API (e.g. "/storage/settings/xyz.png")
 * into a fully-qualified URL pointing at the backend origin.
 *
 * NEXT_PUBLIC_API_URL includes the trailing "/api" segment (e.g. "http://localhost:8000/api"),
 * so that suffix is stripped before the path is appended.
 *
 * - Already-absolute URLs (http/https) are returned as-is.
 * - Falsy input returns an empty string so callers can safely do `src={getImageUrl(x)}`.
 */
export function getImageUrl(path?: string | null): string {
  const value = path?.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("blob:")) return value;
  if (value.startsWith("//")) return "";

  const configuredBase = (
    process.env.NEXT_PUBLIC_STORAGE_URL || API_BASE_URL.replace(/\/api\/?$/, "")
  ).replace(/\/$/, "");
  const backendOrigin = configuredBase.replace(/\/storage$/i, "");
  const normalizedPath = value.replace(/\\/g, "/");

  if (normalizedPath.startsWith("/")) {
    return `${backendOrigin}${normalizedPath}`;
  }

  if (/^storage\//i.test(normalizedPath)) {
    return `${backendOrigin}/${normalizedPath}`;
  }

  return `${backendOrigin}/storage/${normalizedPath.replace(/^\/+/, "")}`;
}

export function getImageFilename(path?: string | null): string {
  if (!path) return "";
  const cleanPath = path.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  const filename = cleanPath.split("/").filter(Boolean).pop() || "";

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function getValidationError(error: unknown, field: string): string | undefined {
  const requestError = error as ApiRequestError;
  return requestError?.errors?.[field]?.[0];
}
