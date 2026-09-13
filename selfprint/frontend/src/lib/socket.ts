import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/api';

let socket: Socket | null = null;
let activeStoreId: string | null = null;
let activeJobId: string | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = SOCKET_URL;
    const token =
      localStorage.getItem('selfprint_admin_token') ||
      localStorage.getItem('selfprint_store_token') ||
      localStorage.getItem('auth_token') ||
      '';

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token
      }
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend real-time server:', socket?.id);
      
      const adminToken = localStorage.getItem('selfprint_admin_token');
      if (adminToken && socket) {
        socket.emit('join_admin');
      }
      if (activeStoreId && socket) {
        socket.emit('join_store', activeStoreId);
      }
      if (activeJobId && socket) {
        socket.emit('join_job', activeJobId);
      }
    });

    socket.on('connect_error', (err) => {
      console.debug('[Socket] Connection retry...', err.message);
    });
  }
  return socket;
};

export const joinAdminRoom = () => {
  const s = getSocket();
  if (s) {
    s.emit('join_admin');
  }
};

export const joinStoreRoom = (storeId: string) => {
  if (!storeId) return;
  activeStoreId = storeId;
  const s = getSocket();
  if (s) {
    s.emit('join_store', storeId);
  }
};

export const joinJobRoom = (jobId: string) => {
  if (!jobId) return;
  activeJobId = jobId;
  const s = getSocket();
  if (s) {
    s.emit('join_job', jobId);
  }
};

export default getSocket;
