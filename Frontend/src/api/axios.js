import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let accessToken = null;
let onTokenRefreshed = null;
let onAuthFailed = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const registerAuthHandlers = ({ refreshHandler, authFailedHandler }) => {
  onTokenRefreshed = refreshHandler;
  onAuthFailed = authFailedHandler;
};

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers?.skipAuth) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config?._retry || config?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (onTokenRefreshed ? onTokenRefreshed() : Promise.reject(error)).finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (!newToken) throw error;

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      if (onAuthFailed) onAuthFailed();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
