import { apiRequest } from './client';

export interface DoctorProfile {
  doctor_id: string;
  name: string;
  qualification: string;
  hospital: string;
  district: string;
  state?: string;
  phone: string;
  email?: string;
  mci_number: string;
  specialization: string;
  available_slot: string;
  status: 'available' | 'busy' | 'offline';
  experience_years: number;
  languages: string[];
  rating: number;
  verified: boolean;
}

export interface ConnectRequestPayload {
  doctor_id: string;
  doctor_name?: string;
  preferred_mode: 'video' | 'voice' | 'chat';
  victim_name?: string;
  victim_id?: string;
  phone?: string;
  district?: string;
  state?: string;
  distress_score?: number;
  severity_level?: string;
  reason?: string;
}

export interface PatientNotification {
  request_id: string;
  doctor_id: string;
  doctor_name: string;
  victim_id?: string;
  victim_name: string;
  preferred_mode: 'video' | 'voice' | 'chat';
  phone?: string;
  district: string;
  state: string;
  distress_score?: number;
  severity_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  reason?: string;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed' | 'declined';
  session_link?: string;
  scheduled_slot?: string;
  clinical_notes?: string;
  created_at: string;
  updated_at: string;
}

export const psychiatristApi = {
  async doctorLogin(doctorId: string, password: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: any;
  }> {
    return apiRequest('/auth/doctor/login', {
      method: 'POST',
      body: JSON.stringify({
        doctor_id: doctorId.trim(),
        password,
      }),
    });
  },

  async getDoctors(district?: string): Promise<DoctorProfile[]> {
    const q = new URLSearchParams();
    if (district && district !== 'ALL') q.append('district', district);
    const qs = q.toString();
    const url = '/psychiatrist/doctors' + (qs ? '?' + qs : '');
    return apiRequest<DoctorProfile[]>(url);
  },

  async requestConnect(payload: ConnectRequestPayload): Promise<{
    success: boolean;
    message: string;
    request_id: string;
    request: PatientNotification;
  }> {
    return apiRequest('/psychiatrist/connect-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getNotifications(params?: { doctor_id?: string; status?: string }): Promise<{
    total: number;
    pending_count: number;
    notifications: PatientNotification[];
  }> {
    const q = new URLSearchParams();
    if (params?.doctor_id && params.doctor_id !== 'ALL') q.append('doctor_id', params.doctor_id);
    if (params?.status && params.status !== 'ALL') q.append('status', params.status);
    const qs = q.toString();
    const url = '/psychiatrist/notifications' + (qs ? '?' + qs : '');
    return apiRequest(url);
  },

  async actionNotification(
    requestId: string,
    action: 'accept' | 'schedule' | 'complete' | 'decline',
    details?: { scheduled_slot?: string; clinical_notes?: string }
  ): Promise<{
    success: boolean;
    action: string;
    message: string;
    request: PatientNotification;
  }> {
    return apiRequest('/psychiatrist/notifications/' + requestId + '/action', {
      method: 'POST',
      body: JSON.stringify({
        action,
        scheduled_slot: details?.scheduled_slot,
        clinical_notes: details?.clinical_notes,
      }),
    });
  },
};
