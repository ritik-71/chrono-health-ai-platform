import axios from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://chrono-health-ai-platform.onrender.com').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For native fetch calls
export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default api;
