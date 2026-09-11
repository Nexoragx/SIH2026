import { apiRequest } from './client';

export interface SupportResource {
  id: string;
  category: 'mental_health' | 'victim_support' | 'emergency';
  name: string;
  number: string;
  alt_number?: string | null;
  availability: string;
  languages: string;
  description: string;
  region: string;
  verified: boolean;
}

export interface EmergencyDispatchResponse {
  success: boolean;
  dispatch_id: string;
  demo_mode: boolean;
  message: string;
  protocol: string;
  status: string;
  eta_minutes: number;
  created_at: string;
}

export interface ChatMessageResponse {
  session_id: string;
  reply: string;
  crisis_flag: boolean;
  action_required: 'CONTINUE' | 'SHOW_CRISIS_SCREEN';
  support_numbers?: string[];
  timestamp: string;
  exercise_suggestion?: {
    type: 'breathing' | 'grounding' | 'journal' | 'sounds' | 'muscle' | 'emdr';
    title: string;
    description: string;
    button_label?: string;
    buttonLabel?: string;
  };
}

export interface CheckinScheduleResponse {
  interval_days: number;
  cadence_label: string;
  next_due_date: string;
  days_remaining: number;
  completed_sessions: number;
  status: string;
  can_start_early: boolean;
}

export const supportApi = {
  /**
   * Fetch verified support helplines & resources
   */
  async getResources(category?: string): Promise<SupportResource[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest<SupportResource[]>(`/support/resources${query}`);
  },

  /**
   * Dispatch emergency 108 assistance (safe demo mode for SIH)
   */
  async dispatchEmergency(payload: {
    case_id?: string;
    location?: string;
    reason?: string;
    caller_phone?: string;
  }): Promise<EmergencyDispatchResponse> {
    return apiRequest<EmergencyDispatchResponse>('/emergency/dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Send text to empathetic ANVAYA Support companion with safety phrase detection
   */
  async sendChatMessage(
    message: string,
    sessionId?: string,
    language: string = 'en'
  ): Promise<ChatMessageResponse> {
    return apiRequest<ChatMessageResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        language,
      }),
    });
  },

  /**
   * Get periodic check-in cadence and next due date
   */
  async getCheckinSchedule(): Promise<CheckinScheduleResponse> {
    return apiRequest<CheckinScheduleResponse>('/checkins/schedule');
  },

  /**
   * Manually record crisis alert from client
   */
  async createAlert(payload: {
    case_id: string;
    reason: string;
    category?: string;
    priority?: string;
    location?: string;
  }): Promise<{ success: boolean; alert: any }> {
    return apiRequest<{ success: boolean; alert: any }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch observer active triggers / alerts
   */
  async getAlerts(status?: string): Promise<{ alerts: any[]; total: number }> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<{ alerts: any[]; total: number }>(`/alerts${query}`);
  },
};
