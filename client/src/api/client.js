/**
 * api/client.js — Axios instance with auth token injection and error normalisation.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds to accommodate Render free tier cold-starts
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor: attach JWT ────────────────────────── */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('wtp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Response interceptor: normalise errors & auto-retry ────── */
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;

    const isTimeout =
      err.code === 'ECONNABORTED' ||
      (err.message && err.message.toLowerCase().includes('timeout'));
    const isNetworkError = !err.response && err.message === 'Network Error';

    // Auto-retry once on timeout or cold-start network drop
    if ((isTimeout || isNetworkError) && config && !config._isRetry) {
      config._isRetry = true;
      // Brief 1.5s delay before retry to let server finish booting
      await new Promise((r) => setTimeout(r, 1500));
      return client(config);
    }

    let message =
      err.response?.data?.message ||
      err.response?.data?.error   ||
      err.message                  ||
      'An unexpected error occurred';

    if (isTimeout) {
      message = 'Server response timed out. The cloud server on Render may be waking up from sleep mode. Please try again.';
    } else if (isNetworkError) {
      message = 'Unable to connect to the backend server. Please verify your connection or try again in a few moments.';
    }

    const status  = err.response?.status || 0;
    const errors  = err.response?.data?.errors;
    return Promise.reject(Object.assign(new Error(message), { status, errors }));
  }
);

export default client;
