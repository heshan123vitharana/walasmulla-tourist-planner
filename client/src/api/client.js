/**
 * api/client.js — Axios instance with auth token injection and error normalisation.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ─── Request interceptor: attach JWT ────────────────────────── */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('wtp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── Response interceptor: normalise errors ─────────────────── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error   ||
      err.message                  ||
      'An unexpected error occurred';
    const status  = err.response?.status || 0;
    const errors  = err.response?.data?.errors;
    return Promise.reject(Object.assign(new Error(message), { status, errors }));
  }
);

export default client;
