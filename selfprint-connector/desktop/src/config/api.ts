/**
 * Single source of truth for SelfPrint Desktop Connector Cloud Backend
 */
export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://selfprint.onrender.com/api/v1'
).replace(/\/+$/, '');

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE.replace(/\/api(\/v1)?\/?$/, '') ||
  'https://selfprint.onrender.com'
).replace(/\/+$/, '');

export const LOCAL_BRIDGE_URL = (
  import.meta.env.VITE_HOST_BRIDGE_URL ||
  'http://127.0.0.1:4500'
).replace(/\/+$/, '');

export default API_BASE;
