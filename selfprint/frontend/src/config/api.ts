/**
 * Single Source of Truth for API & Realtime Socket Endpoints
 * All HTTP clients, Auth services, Upload handlers, and WebSockets route through here.
 */

export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://selfprint.onrender.com/api/v1'
).replace(/\/+$/, '');

export const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE.replace(/\/api(\/v1)?\/?$/, '') ||
  'https://selfprint.onrender.com'
).replace(/\/+$/, '');

export default API_BASE;
