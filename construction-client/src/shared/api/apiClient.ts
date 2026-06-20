import { ApiError } from "@shared/utils/errorHandler";
import { CURRENT_USER, USER_TOKEN } from "@shared/constants/storageKeys";

export const AUTH_LOGOUT_EVENT = "auth:logout";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Set it in construction-client/.env or the environment.");
}

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
};

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN);
};

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_TOKEN);
  localStorage.removeItem(CURRENT_USER);
};

const notifyUnauthorized = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

const isRetryableError = (status: number): boolean => {
  // Retry on network errors, 408 (timeout), 429 (too many requests), and 5xx errors
  return status === 0 || status === 408 || status === 429 || status >= 500;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  async request<T>(
    path: string,
    options: ApiRequestOptions = {},
    body?: unknown
  ): Promise<T> {
    const token = getStoredToken();
    const retries = options.retries ?? 3;
    const retryDelay = options.retryDelay ?? 1000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const headers: Record<string, string> = {
          ...options.headers,
        };

        if (!(body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(buildUrl(path), {
          ...options,
          headers,
          body:
            body === undefined
              ? undefined
              : body instanceof FormData
                ? body
                : JSON.stringify(body),
        });

        const payload = await parseResponse(response);

        if (!response.ok) {
          console.error("❌ API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            url: buildUrl(path),
            payload,
            attempt: attempt + 1,
          });

          if (response.status === 401) {
            clearAuthStorage();
            notifyUnauthorized();
          }

          const message =
            (payload && (payload.message as string)) ||
            response.statusText ||
            "Request failed";

          // Check if we should retry
          if (isRetryableError(response.status) && attempt < retries - 1) {
            const delayMs = retryDelay * Math.pow(2, attempt);
            console.warn(
              `Retrying request (attempt ${attempt + 1}/${retries}) after ${delayMs}ms`
            );
            await sleep(delayMs);
            continue;
          }

          throw new ApiError(message, response.status, payload);
        }

        return payload as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiError) {
          // Don't retry client errors (4xx except retriable ones)
          if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
            if (error.statusCode !== 408 && error.statusCode !== 429) {
              throw error;
            }
          }

          // Retry on server errors or timeout
          if (attempt < retries - 1 && isRetryableError(error.statusCode || 0)) {
            const delayMs = retryDelay * Math.pow(2, attempt);
            console.warn(
              `Retrying API request (attempt ${attempt + 1}/${retries}) after ${delayMs}ms`
            );
            await sleep(delayMs);
            continue;
          }

          throw error;
        }

        // Network error
        if (attempt < retries - 1) {
          const delayMs = retryDelay * Math.pow(2, attempt);
          console.warn(
            `Retrying after network error (attempt ${attempt + 1}/${retries}) after ${delayMs}ms`
          );
          await sleep(delayMs);
          continue;
        }

        console.error("❌ Network/Fetch Error:", error);
        throw new ApiError("Network error. Please check your connection.", 0, error);
      }
    }

    // All retries exhausted
    if (lastError instanceof ApiError) {
      throw lastError;
    }

    throw new ApiError(
      "Request failed after multiple retries. Please try again.",
      0,
      lastError
    );
  },

  get<T>(path: string, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "POST" }, body);
  },

  put<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "PUT" }, body);
  },

  patch<T>(path: string, body?: unknown, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "PATCH" }, body);
  },

  delete<T>(path: string, options: ApiRequestOptions = {}) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },
};
