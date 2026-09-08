/**
 * Assessment Service
 * Handles multi-modal mental health assessments, distress calculation, and reports
 */

import { apiService } from './api.service.js';
import { API_CONFIG } from '../config/api.config.js';
import { storage } from '../utils/storage.js';

export const assessmentService = {
  /**
   * Submits multi-modal assessment (MADRS, PHQ-9, GAD-7 + text)
   */
  async submitAssessment(payload) {
    return await apiService.post(API_CONFIG.ENDPOINTS.ASSESSMENT_SUBMIT, payload);
  },

  /**
   * Submits audio voice sample with assessment metadata
   */
  async submitVoiceAssessment(audioFile, metadata = {}) {
    const formData = new FormData();
    formData.append('file', audioFile);
    if (Object.keys(metadata).length > 0) {
      formData.append('data_json', JSON.stringify(metadata));
    }

    const token = storage.getAccessToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ASSESSMENT_SUBMIT_VOICE}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to process voice assessment');
    }

    return await response.json();
  },

  /**
   * Fetches full assessment report by ID
   */
  async getReport(reportId) {
    return await apiService.get(API_CONFIG.ENDPOINTS.ASSESSMENT_REPORT(reportId));
  },

  /**
   * Fetches historical assessments for the logged-in victim
   */
  async getHistory() {
    return await apiService.get(API_CONFIG.ENDPOINTS.ASSESSMENT_HISTORY);
  },
};
