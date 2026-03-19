// lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StartSessionResponse {
  sessionId: string;
  currentPattern: string;
  currentProblem: any;
  messages: any[];
  nextAction: string;
}

export interface SubmitCodeResponse {
  passed: boolean;
  executionResult: any;
  messages: any[];
  nextAction: string;
  attemptCount: number;
}

export interface HintResponse {
  hint: any;
  hintLevel: number;
  nextAction: string;
}

export const agentAPI = {
  startSession: async (userId: string): Promise<StartSessionResponse> => {
    const response = await api.post('/api/agent/start-session', { userId });
    return response.data;
  },

  submitCode: async (sessionId: string, code: string, language: string): Promise<SubmitCodeResponse> => {
    const response = await api.post('/api/agent/submit-code', { sessionId, code, language });
    return response.data;
  },

  requestHint: async (sessionId: string): Promise<HintResponse> => {
    const response = await api.post('/api/agent/request-hint', { sessionId });
    return response.data;
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(`/api/agent/session/${sessionId}`);
    return response.data;
  },

  nextProblem: async (sessionId: string) => {
    const response = await api.post('/api/agent/next-problem', { sessionId });
    return response.data;
  }
};

export const problemAPI = {
  getAll: async (pattern?: string, difficulty?: string) => {
    const response = await api.get('/api/problems', { params: { pattern, difficulty } });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/problems/${id}`);
    return response.data;
  },

  getByPattern: async (pattern: string) => {
    const response = await api.get(`/api/problems/pattern/${pattern}`);
    return response.data;
  },

  getPatterns: async () => {
    const response = await api.get('/api/problems/meta/patterns');
    return response.data;
  }
};

export const progressAPI = {
  get: async (userId: string) => {
    const response = await api.get(`/api/progress/${userId}`);
    return response.data;
  },

  getStats: async (userId: string) => {
    const response = await api.get(`/api/progress/${userId}/stats`);
    return response.data;
  },

  updateStreak: async (userId: string) => {
    const response = await api.post(`/api/progress/${userId}/streak`);
    return response.data;
  },

  getPatternProgress: async (userId: string, pattern: string) => {
    const response = await api.get(`/api/progress/${userId}/patterns/${pattern}`);
    return response.data;
  }
};

export default api;