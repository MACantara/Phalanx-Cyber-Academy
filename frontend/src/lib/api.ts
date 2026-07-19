import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('cyberquest_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) {
        config.headers['X-User-Id'] = String(user.id);
      }
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});
