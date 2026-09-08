import { apiRequest } from './client';

export interface HealthResponse {
  status: string;
  project: string;
  environment: string;
  version: string;
}

export interface ArchitectureLayer {
  tier: number;
  name: string;
  channels?: string[];
  features?: string[];
  components?: string[];
  weights?: Record<string, string>;
  scale?: string;
  severity?: string[];
  explainability?: string;
  purpose?: string;
  engines?: string[];
  levels?: string[];
  partners?: string[];
}

export interface ArchitectureResponse {
  title: string;
  layers: ArchitectureLayer[];
}

export const systemApi = {
  async checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/health');
  },

  async getArchitecture(): Promise<ArchitectureResponse> {
    return apiRequest<ArchitectureResponse>('/architecture');
  },
};
