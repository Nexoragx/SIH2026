/**
 * Storage Utility
 * Manages JWT Tokens and User Session in localStorage
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sih_access_token',
  REFRESH_TOKEN: 'sih_refresh_token',
  USER_PROFILE: 'sih_user_profile',
};

export const storage = {
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  },

  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    }
  },

  setAuthSession(authData) {
    if (authData.access_token) {
      this.setAccessToken(authData.access_token);
    }
    if (authData.refresh_token) {
      this.setRefreshToken(authData.refresh_token);
    }
    if (authData.user) {
      this.setUser(authData.user);
    }
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },

  isAuthenticated() {
    return Boolean(this.getAccessToken());
  },
};
