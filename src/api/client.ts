import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';

import { ApiError } from './http';

const baseURL = String(import.meta.env.VITE_API_BASE_URL ?? '');

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically (if present).
apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      // Basic auto-logout behavior.
      window.localStorage.removeItem('access_token');
      window.location.assign('/login');
    }

    const message =
      typeof (data as any)?.message === 'string'
        ? (data as any).message
        : error.message || 'Request failed';

    return Promise.reject(new ApiError(message, status, data));
  },
);

