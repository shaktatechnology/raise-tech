const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
    const error = new Error(errorData.message || `API call failed with status ${response.status}`);
    (error as any).errors = errorData.errors || null;
    (error as any).status = response.status;
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
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}