// src/api/client.js
import axios from 'axios';
import { store } from '../store/index';
import { logoutUser } from '../store/slices/authSlice';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Endpoints that must NEVER trigger a refresh ───
const NO_REFRESH_URLS = [
  '/auth/refresh-token',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
];

let isRefreshing = false;
let failedQueue = [];
let refreshDisabled = false; // circuit breaker — stops the loop after first failure

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const url = originalRequest.url || '';

    const isAuthFlowCall = NO_REFRESH_URLS.some((u) => url.includes(u));
    const is401 = error.response?.status === 401;

    // ── STOP CONDITIONS ──
    // 1. Not a 401
    // 2. Already retried this request
    // 3. This IS an auth flow call (refresh/login/logout)
    // 4. Circuit breaker is open (a previous refresh already failed)
    if (!is401 || originalRequest._retry || isAuthFlowCall || refreshDisabled) {
      return Promise.reject(error);
    }

    // ── If a refresh is already in flight, queue this request ──
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      // Success → flush queue
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      // ── OPEN THE CIRCUIT BREAKER ──
      // Don't try to refresh again until the user reloads / logs in manually
      refreshDisabled = true;

      processQueue(refreshError);
      store.dispatch(logoutUser());

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Reset circuit breaker when user logs in again ──
export const resetRefreshCircuit = () => {
  refreshDisabled = false;
  isRefreshing = false;
  failedQueue = [];
};

export default apiClient;