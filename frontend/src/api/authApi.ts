import { apiRequest, setStoredToken, clearStoredAuth, setStoredUser } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  role?: 'victim';
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

const persistSession = (data: AuthResponse): AuthResponse => {
  setStoredToken(data.access_token, data.refresh_token);
  setStoredUser(data.user);
  return data;
};

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return persistSession(await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return persistSession(await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return persistSession(await apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }));
  },

  async getMe(): Promise<AuthResponse['user']> {
    const user = await apiRequest<AuthResponse['user']>('/auth/me');
    setStoredUser(user);
    return user;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {}
    clearStoredAuth();
  },

  saveLocalSession(user: any, token?: string, refreshToken?: string): void {
    setStoredUser(user);
    if (token) {
      setStoredToken(token, refreshToken);
    } else {
      setStoredToken(`SESSION-${user.id || Date.now()}`);
    }
  },

  getCurrentLocalUser(): AuthResponse['user'] | null {
    try {
      const raw = localStorage.getItem('nexora_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
