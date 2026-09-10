import { apiRequest } from './client';
import { AssessmentBackendResponse } from './assessmentApi';

export interface AdminReportSummary {
  id: string;
  session_id: string;
  victim_id?: string;
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
  getReports(limit = 100): Promise<AdminReportRegistry> {
    return apiRequest<AdminReportRegistry>(`/interview/admin/reports?limit=${limit}`);
  },
  getReport(reportId: string): Promise<AssessmentBackendResponse & Record<string, any>> {
    return apiRequest(`/interview/admin/reports/${reportId}`);
  },
};
