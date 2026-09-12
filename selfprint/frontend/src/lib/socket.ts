import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/config/api';

let socket: Socket | null = null;

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
      // Auto-join admin room if admin token exists
      const adminToken = localStorage.getItem('selfprint_admin_token');
      if (adminToken && socket) {
        socket.emit('join_admin');
      }
    });

    socket.on('connect_error', (err) => {
      // Silent retry
      console.debug('Socket connection retry...', err.message);
    });
  }
  return socket;
};

export default getSocket;
