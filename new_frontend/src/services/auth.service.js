/**
 * Authentication Service
 * Manages Registration, Login, Token Refresh, and Profile Queries
 */

import { apiService } from './api.service.js';
import { API_CONFIG } from '../config/api.config.js';
import { storage } from '../utils/storage.js';

export const authService = {
  /**
   * Registers a new account (Victim, District Observer, etc.)
   */
  async register(userData) {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER, userData);
    if (response.access_token) {
      storage.setAuthSession(response);
      window.dispatchEvent(new CustomEvent('auth:change', { detail: response.user }));
    }
    return response;
  },

  /**
   * Authenticates user with email and password
   */
  async login(credentials) {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, credentials);
    if (response.access_token) {
      storage.setAuthSession(response);
      window.dispatchEvent(new CustomEvent('auth:change', { detail: response.user }));
    }
    return response;
  },

  /**
   * Logs out user and invalidates JWT on the backend
   */
  async logout() {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT, {});
    } catch (err) {
      console.warn('Logout notification to server failed:', err);
    } finally {
      storage.clearSession();
      window.dispatchEvent(new CustomEvent('auth:change', { detail: null }));
    }
  },

  /**
   * Fetches current authenticated user profile
   */
  async getProfile() {
    if (!storage.isAuthenticated()) return null;
    try {
      const user = await apiService.get(API_CONFIG.ENDPOINTS.AUTH_ME);
      storage.setUser(user);
      return user;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      return null;
    }
  },

  /**
   * Refreshes JWT access token
   */
  async refreshToken() {
    const refresh_token = storage.getRefreshToken();
    if (!refresh_token) throw new Error('No refresh token available');

    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH_REFRESH, { refresh_token });
    if (response.access_token) {
      storage.setAccessToken(response.access_token);
    }
    return response;
  },

  /**
   * Current user in local state
   */
  getCurrentUser() {
    return storage.getUser();
  },

  /**
   * Is currently logged in
   */
  isLoggedIn() {
    return storage.isAuthenticated();
  },
};
