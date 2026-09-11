/**
 * Base HTTP Client for Nexora Backend (FastAPI).
 * Automatically injects JWT Bearer tokens and handles API prefixes.
 */

const HOSTED_BACKEND_URL = 'https://sih2026-frki.onrender.com/api/v1';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  // When running locally in browser, connect to local backend / Vite proxy for instant <5ms responses
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return '/api/v1';
    }
  }

  return HOSTED_BACKEND_URL;
};

const API_BASE_URL = getBaseUrl();

const TOKEN_KEY = 'nexora_auth_token';
const REFRESH_TOKEN_KEY = 'nexora_refresh_token';
const USER_KEY = 'nexora_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): any | null => {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export interface ApiError {
  error: string;
  detail?: string;
  status: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});

  // Inject auth token if available and not already set
  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type only if not sending FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let detailMsg = 'API Request Failed';
      if (typeof data.detail === 'string') {
        detailMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        detailMsg = data.detail
          .map((d: any) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d)))
          .join('; ');
      } else if (data.detail && typeof data.detail === 'object') {
        detailMsg = JSON.stringify(data.detail);
      } else if (data.error) {
        detailMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (response.statusText) {
        detailMsg = response.statusText;
      }

      const errorPayload: ApiError = {
        error: data.error || response.statusText || 'API Request Failed',
        detail: detailMsg,
        status: response.status,
      };
      throw errorPayload;
    }

    return data as T;
  } catch (err: any) {
    // If already a structured ApiError from server response, rethrow directly
    if (err.status && err.status !== 0) {
      throw err;
    }

    // Try fallback URL if network error occurred
    const hasTriedFallback = options.headers instanceof Headers
      ? options.headers.has('x-fallback-tried')
      : Boolean((options.headers as any)?.['x-fallback-tried']);

    if (!hasTriedFallback) {
      try {
        const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
        const fallbackBase = isLocal ? HOSTED_BACKEND_URL : 'http://localhost:8000/api/v1';
        const fallbackUrl = endpoint.startsWith('http')
          ? endpoint
          : `${fallbackBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const newHeaders = new Headers(options.headers || {});
        newHeaders.set('x-fallback-tried', '1');
        return await apiRequest<T>(fallbackUrl, { ...options, headers: newHeaders });
      } catch (fallbackErr: any) {
        if (fallbackErr.status && fallbackErr.status !== 0) {
          throw fallbackErr;
        }
      }
    }

    // Network / offline error
    throw {
      error: 'Network Error',
      detail: err.message || 'Failed to connect to backend server. Please verify your connection.',
      status: 0,
    } as ApiError;
  }
}
