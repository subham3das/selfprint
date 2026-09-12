import { API_BASE } from '@/config/api';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Self-Print';
export const API_BASE_URL = API_BASE;

export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;
