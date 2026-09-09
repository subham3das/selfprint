export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Self-Print';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;
