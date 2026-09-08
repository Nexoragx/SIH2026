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
  context_score?: number;
  district?: string;
  state?: string;
}

export interface AssessmentBackendResponse {
  id: string;
  session_id: string;
  distress_score: number;
  severity_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  alert_triggered: boolean;
  ambulance_108_dispatched: boolean;
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
    counselling?: { recommended: boolean; service: string; contact: string; details: string };
    ngo_partners?: { name: string; service: string; district: string; helpline: string }[];
    legal_aid?: { recommended: boolean; scheme: string; assistance: string; helpline: string };
    medical_support?: { recommended: boolean; facility: string; action: string };
    financial_aid?: { scheme: string; eligibility: string; link: string };
  };
  created_at: string;
}

export interface AssessmentHistoryResponse {
  total_assessments: number;
  history: {
    id: string;
    session_id: string;
    distress_score: number;
    severity_level: string;
    created_at: string;
    status: string;
  }[];
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
};
