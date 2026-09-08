import { apiRequest, setStoredToken, clearStoredAuth, setStoredUser, getStoredUser } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  phone?: string;
  district?: string;
  state?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    district?: string;
    state?: string;
  };
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.access_token) {
        setStoredToken(data.access_token, data.refresh_token);
        setStoredUser(data.user);
      }
      return data;
    } catch (err: any) {
      // If backend is offline or network error, save locally
      if (err.status === 0 || err.error === 'Network Error') {
        const emailLower = payload.email.trim().toLowerCase();
        const localUser = {
          id: 'USR-' + Date.now().toString().slice(-5),
          email: emailLower,
          password: payload.password,
          full_name: payload.full_name,
          role: payload.role || 'victim',
          phone: payload.phone,
          district: payload.district || 'Nashik',
          state: payload.state || 'Maharashtra',
        };
        const existingUsers = JSON.parse(localStorage.getItem('nexora_local_users') || '[]');
        existingUsers.push(localUser);
        localStorage.setItem('nexora_local_users', JSON.stringify(existingUsers));

        const fallbackRes: AuthResponse = {
          access_token: 'mock-jwt-token-' + Date.now(),
          refresh_token: 'mock-jwt-refresh',
          token_type: 'bearer',
          user: {
            id: localUser.id,
            email: localUser.email,
            full_name: localUser.full_name,
            role: localUser.role,
            district: localUser.district,
            state: localUser.state,
          },
        };
        setStoredToken(fallbackRes.access_token, fallbackRes.refresh_token);
        setStoredUser(fallbackRes.user);
        return fallbackRes;
      }
      throw err;
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.access_token) {
        setStoredToken(data.access_token, data.refresh_token);
        setStoredUser(data.user);
      }
      return data;
    } catch (err: any) {
      // If backend is unavailable or offline, provide seamless fallback for demo accounts & local users
      const emailLower = payload.email.trim().toLowerCase();
      if (emailLower === 'survivor.demo@sih.gov.in' && payload.password === 'Password123!') {
        const fallbackRes: AuthResponse = {
          access_token: 'mock-jwt-survivor-token-' + Date.now(),
          refresh_token: 'mock-jwt-survivor-refresh',
          token_type: 'bearer',
          user: {
            id: 'USR-26094',
            email: 'survivor.demo@sih.gov.in',
            full_name: 'Courageous Survivor',
            role: 'victim',
            district: 'Nashik',
            state: 'Maharashtra',
          },
        };
        setStoredToken(fallbackRes.access_token, fallbackRes.refresh_token);
        setStoredUser(fallbackRes.user);
        return fallbackRes;
      }
      if (emailLower === 'observer.district@sih.gov.in' && payload.password === 'ObserverPassword123!') {
        const fallbackRes: AuthResponse = {
          access_token: 'mock-jwt-observer-token-' + Date.now(),
          refresh_token: 'mock-jwt-observer-refresh',
          token_type: 'bearer',
          user: {
            id: 'OBS-001',
            email: 'observer.district@sih.gov.in',
            full_name: 'Dr. Anita Joshi (District Nodal Officer)',
            role: 'observer_district',
            district: 'Nashik',
            state: 'Maharashtra',
          },
        };
        setStoredToken(fallbackRes.access_token, fallbackRes.refresh_token);
        setStoredUser(fallbackRes.user);
        return fallbackRes;
      }

      // Check local registered users if any
      const localUsersJson = localStorage.getItem('nexora_local_users');
      if (localUsersJson) {
        try {
          const localUsers = JSON.parse(localUsersJson);
          const found = localUsers.find((u: any) => u.email === emailLower && u.password === payload.password);
          if (found) {
            const fallbackRes: AuthResponse = {
              access_token: 'mock-jwt-token-' + Date.now(),
              refresh_token: 'mock-jwt-refresh',
              token_type: 'bearer',
              user: {
                id: found.id || 'USR-' + Date.now().toString().slice(-5),
                email: found.email,
                full_name: found.full_name,
                role: found.role || 'victim',
                district: found.district || 'Nashik',
                state: found.state || 'Maharashtra',
              },
            };
            setStoredToken(fallbackRes.access_token, fallbackRes.refresh_token);
            setStoredUser(fallbackRes.user);
            return fallbackRes;
          }
        } catch {}
      }

      throw err;
    }
  },

  async getMe(): Promise<any> {
    try {
      const user = await apiRequest('/auth/me');
      setStoredUser(user);
      return user;
    } catch (err) {
      const local = getStoredUser();
      if (local) return local;
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStoredAuth();
    }
  },

  getCurrentLocalUser(): any | null {
    return getStoredUser();
  },
};
