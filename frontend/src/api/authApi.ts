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
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      setStoredToken(data.access_token, data.refresh_token);
      setStoredUser(data.user);
    }
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      setStoredToken(data.access_token, data.refresh_token);
      setStoredUser(data.user);
    }
    return data;
  },

  async getMe(): Promise<any> {
    const user = await apiRequest('/auth/me');
    setStoredUser(user);
    return user;
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
