/**
 * API Configuration for SIH26094 Frontend
 * Connects to FastAPI Backend at http://localhost:8000/api/v1
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT_MS: 15000,
  ENDPOINTS: {
    // Auth Endpoints
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_ME: '/auth/me',
    AUTH_OAUTH_LOGIN: '/auth/oauth/login',

    // Assessment & Interview Endpoints
    ASSESSMENT_SUBMIT: '/interview/submit',
    ASSESSMENT_SUBMIT_VOICE: '/interview/submit-voice',
    ASSESSMENT_REPORT: (reportId) => `/interview/reports/${reportId}`,
    ASSESSMENT_HISTORY: '/interview/history',

    // Health Observer Dashboard & Interventions
    OBSERVER_DASHBOARD: '/interview/observer/dashboard',
    OBSERVER_INTERVENE: (reportId) => `/interview/observer/intervene/${reportId}`,

    // System Status
    SYSTEM_HEALTH: '/health',
    SYSTEM_ARCHITECTURE: '/architecture',
  },
};
