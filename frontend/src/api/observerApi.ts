import { apiRequest } from './client';

export interface ObserverDashboardFilters {
  district?: string;
  state?: string;
  severity?: string;
  limit?: number;
}

export interface BackendCaseSummary {
  id: string;
  session_id: string;
  victim_id?: string;
  distress_score: number;
  severity_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: string;
  touchpoint?: string;
  alert_triggered: boolean;
  created_at: string;
}

export interface ObserverDashboardData {
  jurisdiction: {
    role: string;
    district: string;
    state: string;
  };
  statistics: {
    total_cases: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
    active_108_dispatches: number;
  };
  cases: BackendCaseSummary[];
}

export interface CaseInterventionPayload {
  status: 'PENDING_TRIAGE' | 'UNDER_REVIEW' | 'INTERVENTION_ASSIGNED' | 'CRISIS_DISPATCHED' | 'RESOLVED';
  assigned_psychiatrist_id?: string;
  assigned_observer_id?: string;
  observer_notes?: string;
  dispatch_108_ambulance?: boolean;
}

export const observerApi = {
  /**
   * Fetch observer dashboard caseload statistics and recent cases
   */
  async getDashboard(filters: ObserverDashboardFilters = {}): Promise<ObserverDashboardData> {
    const params = new URLSearchParams();
    if (filters.district) params.append('district', filters.district);
    if (filters.state) params.append('state', filters.state);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<ObserverDashboardData>(`/interview/observer/dashboard${queryString}`);
  },

  /**
   * Update case status, assign providers, add clinical notes, or trigger 108 emergency dispatch
   */
  async updateIntervention(reportId: string, payload: CaseInterventionPayload): Promise<any> {
    return apiRequest(`/interview/observer/intervene/${reportId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
