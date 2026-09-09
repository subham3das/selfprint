import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach exact session token based on endpoint and active portal
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    let token: string | null = null;

    if (url.includes('/admin') || pathname.startsWith('/admin')) {
      token =
        localStorage.getItem('selfprint_admin_token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('auth_token');
    } else if (url.includes('/store') || pathname.startsWith('/store')) {
      token =
        localStorage.getItem('selfprint_store_token') ||
        localStorage.getItem('store_token') ||
        localStorage.getItem('auth_token');
    } else {
      token =
        localStorage.getItem('selfprint_admin_token') ||
        localStorage.getItem('selfprint_store_token') ||
        localStorage.getItem('auth_token');
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 expired/invalid token
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // Store panel 401: clear store token, redirect to login
      if (url.includes('/store/')) {
        localStorage.removeItem('selfprint_store_token');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/store/login')) {
          window.location.href = '/store/login';
        }
      }

      // Admin panel 401: clear admin token, redirect to admin login
      if (url.includes('/admin/')) {
        localStorage.removeItem('selfprint_admin_token');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
