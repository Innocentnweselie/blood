import axios from "axios";

// Use relative base so Vite dev server proxy (configured in vite.config.js) forwards requests to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const normalizedBase = API_BASE_URL ? API_BASE_URL.replace(/\/$/, "") : "";
const resolvedBaseURL = normalizedBase
  ? normalizedBase.endsWith("/api")
    ? normalizedBase
    : `${normalizedBase}/api`
  : "/api";

const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const safeName = escapeRegExp(name);
  const match = document.cookie.match(new RegExp(`(?:^|; )${safeName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrfToken = readCookie('mt_csrf');
    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

export default api;
