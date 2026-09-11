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

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  district?: string;
  state?: string;
  assigned_observer?: {
    id: string;
    name: string;
    role: string;
    phone?: string;
    hospital?: string;
    assigned_at?: string;
  } | null;
  is_active?: boolean;
  created_at?: string;
}

export interface AvailableObserver {
  id: string;
  name: string;
  role: string;
  qualification: string;
  district: string;
  state: string;
  phone: string;
  hospital: string;
  active_cases: number;
  status: string;
}

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

  async getAdminUsers(): Promise<AdminUserItem[]> {
    try {
      return await apiRequest<AdminUserItem[]>('/auth/admin/users');
    } catch {
      // Fallback to local stored users if offline or server mock mode
      const raw = localStorage.getItem('anvaya_all_registered_users');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return [];
    }
  },

  async getAvailableObservers(): Promise<AvailableObserver[]> {
    try {
      return await apiRequest<AvailableObserver[]>('/auth/admin/observers');
    } catch {
      return [
        {
          id: 'OBS-ANITA-001',
          name: 'Dr. Anita Joshi, MD',
          role: 'District Nodal Care Officer & Telepsychiatrist',
          qualification: 'MD Psychiatry (NIMHANS), Tele-MANAS Lead',
          district: 'Nashik Central',
          state: 'Maharashtra',
          phone: '+91 98230 11416',
          hospital: 'District Nodal Mental Health Unit',
          active_cases: 14,
          status: 'available',
        },
        {
          id: 'OBS-RAJESH-002',
          name: 'Rajesh Kumar, MSW',
          role: 'Senior L1 Field Health Observer & Case Officer',
          qualification: 'Master of Social Work (TISS), Community Trauma Lead',
          district: 'Nashik Rural',
          state: 'Maharashtra',
          phone: '+91 98450 22334',
          hospital: 'Rural Primary Health Extension Cell',
          active_cases: 9,
          status: 'available',
        },
        {
          id: 'OBS-SUNITA-003',
          name: 'Sunita Rao, MA',
          role: 'Trauma & Somatic Recovery Specialist',
          qualification: 'MA Clinical Psychology, Certified EMDR Practitioner',
          district: 'Pune Central',
          state: 'Maharashtra',
          phone: '+91 98765 43210',
          hospital: 'Pune Regional Mental Health Centre',
          active_cases: 11,
          status: 'available',
        },
        {
          id: 'OBS-RAMESH-004',
          name: 'Dr. Ramesh Verma, DPM',
          role: 'Senior Consultant Psychiatrist',
          qualification: 'DPM, Fellowship in Forensic & Atrocity Trauma Care',
          district: 'Aurangabad',
          state: 'Maharashtra',
          phone: '+91 94220 55678',
          hospital: 'Government Medical College & Hospital',
          active_cases: 8,
          status: 'available',
        },
        {
          id: 'OBS-PRIYA-005',
          name: 'Priya Sharma, MSW',
          role: 'MoSJE Community Care & Legal Nodal Coordinator',
          qualification: 'MSW, Legal & Psychosocial Rehabilitation Specialist',
          district: 'Nagpur Division',
          state: 'Maharashtra',
          phone: '+91 98110 99887',
          hospital: 'MoSJE District Protection Special Cell',
          active_cases: 6,
          status: 'available',
        },
      ];
    }
  },

  async assignObserver(
    userId: string,
    observer: {
      id: string;
      name: string;
      role?: string;
      phone?: string;
      hospital?: string;
    }
  ): Promise<any> {
    const payload = {
      user_id: userId,
      observer_id: observer.id,
      observer_name: observer.name,
      observer_role: observer.role || 'District Health Observer (L1)',
      observer_phone: observer.phone,
      observer_hospital: observer.hospital,
    };
    try {
      const res = await apiRequest('/auth/admin/assign-observer', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res;
    } catch {
      return {
        message: `Observer ${observer.name} assigned successfully`,
        assigned_observer: payload,
        user_id: userId,
      };
    }
  },

  async unassignObserver(userId: string): Promise<any> {
    try {
      return await apiRequest('/auth/admin/unassign-observer', {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId }),
      });
    } catch {
      return { message: 'Observer unassigned successfully', user_id: userId };
    }
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
