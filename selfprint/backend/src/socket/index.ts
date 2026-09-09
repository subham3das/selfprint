import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils';

class SocketManager {
  private io: SocketIOServer | null = null;
  public isInitialized = false;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow all origins with credentials support
          callback(null, true);
        },
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`🔌 Socket connected: ${socket.id}`);

      // Admin Room Subscription
      socket.on('join_admin', () => {
        socket.join('admin');
        logger.info(`🛡️ Socket ${socket.id} joined admin room`);
      });

      // Store Room Subscription
      socket.on('join_store', (storeId: string) => {
        if (storeId) {
          socket.join(`store:${storeId}`);
          logger.info(`🏪 Socket ${socket.id} joined store:${storeId}`);
        }
      });

      // Customer Job Tracking Subscription
      socket.on('join_job', (jobId: string) => {
        if (jobId) {
          socket.join(`job:${jobId}`);
          logger.info(`📄 Socket ${socket.id} joined job:${jobId}`);
        }
      });

      socket.on('disconnect', (reason) => {
        logger.info(`🔌 Socket disconnected: ${socket.id} (${reason})`);
      });
    });

    this.isInitialized = true;
    logger.info('🚀 WebSocket & Socket.io server initialized successfully');
    return this.io;
  }

  public emitToStore(storeId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`store:${storeId}`).emit(event, data);
      this.io.to('admin').emit(event, data);
      this.io.emit(event, data); // Global broadcast fallback
    }
  }

  public emitToJob(jobId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`job:${jobId}`).emit(event, data);
      this.io.to('admin').emit(event, data);
    }
  }

  public broadcastToStore(storeId: string, event: string, data: any): void {
    this.emitToStore(storeId, event, data);
  }
}

export const socketManager = new SocketManager();
export default socketManager;
