/**
 * Observer Service
 * Interfaces with Health Observer Dashboard (District · State · National)
 */

import { apiService } from './api.service.js';
import { API_CONFIG } from '../config/api.config.js';

export const observerService = {
  /**
   * Fetches health observer dashboard statistics and cases
   */
  async getDashboard(params = {}) {
    const query = new URLSearchParams();
    if (params.district) query.append('district', params.district);
    if (params.state) query.append('state', params.state);
    if (params.severity) query.append('severity', params.severity);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiService.get(`${API_CONFIG.ENDPOINTS.OBSERVER_DASHBOARD}${queryString}`);
  },

  /**
   * Updates case intervention notes, assigns psychiatrist, or dispatches 108 ambulance
   */
  async updateIntervention(reportId, data) {
    return await apiService.post(API_CONFIG.ENDPOINTS.OBSERVER_INTERVENE(reportId), data);
  },
};
