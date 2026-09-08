/**
 * API Service Layer
 * Reusable fetch wrapper with automatic JWT Bearer token injection and error handling.
 */

import { API_CONFIG } from '../config/api.config.js';
import { storage } from '../utils/storage.js';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = storage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.headers);

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // If token expired or blacklisted, trigger session logout
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        storage.clearSession();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMessage = '';
        if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail
              .map((d) => {
                if (typeof d === 'string') return d;
                if (d && typeof d === 'object') {
                  const loc = Array.isArray(d.loc) ? d.loc.filter((p) => p !== 'body').join('.') : '';
                  const msg = d.msg || d.message || JSON.stringify(d);
                  return loc ? `${loc}: ${msg}` : msg;
                }
                return String(d);
              })
              .join('; ');
          } else if (data.detail && typeof data.detail === 'object') {
            errorMessage = data.detail.msg || data.detail.message || JSON.stringify(data.detail);
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (data.error && typeof data.error === 'object') {
            errorMessage = data.error.message || data.error.detail || JSON.stringify(data.error);
          }
        }

        if (!errorMessage || errorMessage === '[object Object]') {
          errorMessage = response.statusText ? `Request failed (${response.status} ${response.statusText})` : `Request failed with status ${response.status}`;
        }

        const error = new Error(String(errorMessage));
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
