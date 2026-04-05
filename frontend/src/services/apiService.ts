import axios from 'axios';
import type { Incident, Stats } from '../types/index';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
});

export const incidentService = {
  getIncidents: (limit = 50) => api.get<Incident[]>(`/incidents?limit=${limit}`),
  getStats: () => api.get<Stats>('/incidents/stats'),
  getIncidentById: (id: string) => api.get<Incident>(`/incidents/${id}`),
};

export const getImageUrl = (path: string | null) => {
  if (!path) return null;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}${path}`;
};
