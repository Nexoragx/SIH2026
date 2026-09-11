import { apiRequest } from './client';

export interface AssessmentSubmissionPayload {
  touchpoint_type?: 'web_portal' | 'mobile_app' | 'ivrs_call' | 'sms' | 'chatbot';
  language?: string;
  madrs?: { answers: number[] };
  phq9?: { answers: number[] };
  gad7?: { answers: number[] };
  text_content?: string;
  personal_history?: string;
  is_crisis_halt?: boolean;
  sleep_hours?: number;
  sleep_quality?: string;
  mood_input?: string;
  safety_threat_active?: boolean;
  threat_report?: {
    safety_status?: string;
    threat_active?: boolean;
    details?: string;
  };
  context_score?: number;
  district?: string;
  state?: string;
  patient_name?: string;
  victim_name?: string;
  victim_id?: string;
  user_id?: string;
}

export interface AssessmentBackendResponse {
  id: string;
  session_id: string;
  patient_name?: string;
  victim_name?: string;
  victim_id?: string;
  distress_score: number;
  severity_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  alert_triggered: boolean;
  ambulance_108_dispatched: boolean;
  alert_details?: {
    alert_triggered?: boolean;
    high_risk_alert?: boolean;
    critical_alert?: boolean;
    threat_alert?: boolean;
    ambulance_108_dispatched?: boolean;
  };
  fused_features?: {
    weights: Record<string, number>;
    modalities_contributions: Record<string, number>;
    fused_raw_score: number;
  };
  clinical_assessment?: {
    answered_items: number;
    total_score: number;
    maximum_score: number;
    severity_category: 'Normal/minimal' | 'Mild' | 'Moderate' | 'Severe' | 'Not assessed';
    item_scores: Record<string, number>;
    leading_domains: { domain: string; score: number }[];
    method: string;
  };
  shap_explainability: {
    features: { feature: string; impact: string; shap_value: number }[];
    primary_driver: string;
    confidence_interval: [number, number];
  };
  temporal_trend: {
    historical_series: number[];
    trend_direction: string;
    worsening_risk_flag: boolean;
    projected_7d_score: number;
    lstm_state: string;
  };
  recommendations: {
    counsellor_call?: { recommended: boolean; urgency: string; service: string; contact: string; details: string };
    follow_up?: { recommended: boolean; interval_days: number; action: string; due_in_hours: number };
    safety_review?: { required: boolean; protection_level: string; legal_aid: string; protocol: string };
    counselling?: { recommended: boolean; service: string; contact: string; details: string };
    ngo_partners?: { name: string; service: string; district: string; helpline: string }[];
    legal_aid?: { recommended: boolean; scheme: string; assistance: string; helpline: string };
    medical_support?: { recommended: boolean; facility: string; action: string };
    financial_aid?: { scheme: string; eligibility: string; link: string };
  };
  created_at: string;
}

export interface AssessmentHistoryItem {
  id: string;
  session_id: string;
  victim_id?: string;
  distress_score: number;
  severity_level: string;
  created_at: string;
  status: string;
  clinical_assessment?: any;
  total_madrs?: number;
  fused_features?: any;
  shap_explanations?: any;
  temporal_trend?: any;
  alert_triggered?: boolean;
  ambulance_108_dispatched?: boolean;
  recommendations?: any;
  voice_analysis?: any;
  nlp_analysis?: any;
}

export interface AssessmentHistoryResponse {
  total_assessments: number;
  history: AssessmentHistoryItem[];
  latest_report?: AssessmentHistoryItem;
}

export const assessmentApi = {
  /**
   * Submit multi-modal mental health screening to FastAPI backend
   */
  async submitAssessment(payload: AssessmentSubmissionPayload): Promise<AssessmentBackendResponse> {
    return apiRequest<AssessmentBackendResponse>('/interview/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Submit voice recording with optional screening data
   */
  async submitVoiceAssessment(
    audioBlob: Blob,
    payload?: AssessmentSubmissionPayload,
    fileName: string = 'recording.webm'
  ): Promise<AssessmentBackendResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    if (payload) {
      formData.append('data_json', JSON.stringify(payload));
    }

    return apiRequest<AssessmentBackendResponse>('/interview/submit-voice', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Retrieve full explainability report by session or report ID
   */
  async getReport(reportId: string): Promise<any> {
    return apiRequest(`/interview/reports/${reportId}`);
  },

  /**
   * Retrieve victim assessment history
   */
  async getVictimHistory(): Promise<AssessmentHistoryResponse> {
    return apiRequest<AssessmentHistoryResponse>('/interview/history');
  },

  /**
   * Fetch all assessment reports for Executive Admin Panel with ML diagnostics
   */
  async getAdminReports(params?: { severity?: string; search?: string; limit?: number }): Promise<{
    total_count: number;
    matched_count: number;
    severity_summary: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
    };
    reports: any[];
  }> {
    const q = new URLSearchParams();
    if (params?.severity && params.severity.toUpperCase() !== 'ALL') {
      q.append('severity', params.severity.toUpperCase());
    }
    if (params?.search && params.search.trim()) {
      q.append('search', params.search.trim());
    }
    if (params?.limit) {
      q.append('limit', String(params.limit));
    }
    const url = `/interview/admin/reports${q.toString() ? `?${q.toString()}` : ''}`;
    return apiRequest(url);
  },
};
