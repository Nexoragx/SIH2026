import { apiRequest } from './client';
import { AssessmentBackendResponse } from './assessmentApi';

export interface AdminReportSummary {
  id: string;
  session_id: string;
  victim_id?: string;
  patient_name?: string;
  victim_name?: string;
  distress_score: number;
  severity_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: string;
  alert_triggered: boolean;
  clinical_assessment?: AssessmentBackendResponse['clinical_assessment'];
  created_at: string | null;
}

export interface AdminReportRegistry {
  total_reports: number;
  reports: AdminReportSummary[];
}

export const adminReportsApi = {
  getReports(params?: { limit?: number; severity?: string; search?: string }): Promise<AdminReportRegistry & Record<string, any>> {
    const q = new URLSearchParams();
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.severity && params.severity !== 'ALL') q.append('severity', params.severity);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return apiRequest(`/interview/admin/reports${qs ? `?${qs}` : ''}`);
  },
  getReport(reportId: string): Promise<AssessmentBackendResponse & Record<string, any>> {
    return apiRequest(`/interview/admin/reports/${reportId}`);
  },
};
