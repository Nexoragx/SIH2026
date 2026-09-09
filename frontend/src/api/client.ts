/**
 * Base HTTP Client for Nexora Backend (FastAPI).
 * Automatically injects JWT Bearer tokens and handles API prefixes.
 */

const HOSTED_BACKEND_URL = 'https://sih2026-frki.onrender.com/api/v1';

const getBaseUrl = (): string => {
  let url = import.meta.env.VITE_API_URL || HOSTED_BACKEND_URL;
  if (url && typeof url === 'string') {
    url = url.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api/v1')) {
      url = `${url}/api/v1`;
    }
    return url;
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
      const errorPayload: ApiError = {
        error: data.error || response.statusText || 'API Request Failed',
        detail: typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data),
        status: response.status,
      };
      throw errorPayload;
    }

    return data as T;
  } catch (err: any) {
    // If already ApiError, rethrow
    if (err.status && err.error) {
      throw err;
    }
    // Network / offline error
    throw {
      error: 'Network Error',
      detail: err.message || 'Failed to connect to Nexora backend server.',
      status: 0,
    } as ApiError;
  }
}
