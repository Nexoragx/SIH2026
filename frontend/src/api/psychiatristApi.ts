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

  async getCaseload(params?: {
    severity?: string;
    district?: string;
    limit?: number;
  }): Promise<ClinicalCaseloadCase[]> {
    const q = new URLSearchParams();
    if (params?.severity && params.severity !== 'ALL') q.append('severity', params.severity);
    if (params?.district && params.district !== 'ALL') q.append('district', params.district);
    if (params?.limit) q.append('limit', String(params.limit));
    const qs = q.toString();
    const url = '/psychiatrist/caseload' + (qs ? '?' + qs : '');
    return apiRequest<ClinicalCaseloadCase[]>(url);
  },

  async saveCaseloadNotes(
    caseId: string,
    data: { clinical_notes?: string; scheduled_slot?: string; status?: string }
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest('/psychiatrist/caseload/' + caseId + '/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export interface ClinicalCaseloadCase {
  id: string;
  session_id: string;
  pseudonym: string;
  age: number;
  district: string;
  state?: string;
  distressScore: number;
  distress_score?: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  severity_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  madrsScore: number;
  dsm5Probable: boolean;
  referredBy: string;
  referredDate: string;
  slotScheduled?: string;
  status: 'pending_review' | 'session_scheduled' | 'consultation_completed' | string;
  shapSummary: string;
  clinicalNotes?: string;
  detectedLanguage?: string;
  touchpoint?: string;
  touchpoint_type?: string;
  created_at?: string;
  // Full ML explainability and diagnostic analysis fields
  shap_explanations?: {
    baseline_score?: number;
    model_prediction?: number;
    features?: Array<{
      feature: string;
      shap_value?: number;
      importance?: number;
      points?: number;
      relative_pct?: number;
      impact?: string;
    }>;
  };
  fused_features?: {
    form_distress?: number;
    nlp_distress?: number;
    voice_distress?: number;
    sleep_distress?: number;
    threat_distress?: number;
    context_score?: number;
    modalities_contributions?: {
      questionnaire_score?: number;
      emotion_score?: number;
      voice_features?: number;
      sleep_behaviour?: number;
      threat_indicators?: number;
    };
  };
  nlp_analysis?: {
    nlp_distress_score?: number;
    sentiment_polarity?: string;
    confidence?: number;
    emotions?: Record<string, number>;
    threat_detected?: boolean;
  };
  voice_analysis?: {
    voice_distress_score?: number;
    pitch_instability_jitter?: number;
    vocal_tremor_hz?: number;
    harmonics_to_noise_ratio?: number;
    stress_level?: string;
  };
  temporal_trend?: {
    historical_series?: number[];
    trend_direction?: string;
    projected_7d_score?: number;
  };
  raw_answers?: any;
  clinical_assessment?: {
    madrs_total?: number;
    severity?: string;
    suicidal_intent?: boolean;
    answers?: number[];
    clinical_summary?: string;
    primary_driver?: string;
    dsm5_probable_depression?: boolean;
  };
  alert_triggered?: boolean;
  ambulance_108_dispatched?: boolean;
  alert_details?: {
    alert_triggered?: boolean;
    ambulance_108_dispatched?: boolean;
    dispatch_id?: string;
    priority?: string;
    reason?: string;
  };
}

