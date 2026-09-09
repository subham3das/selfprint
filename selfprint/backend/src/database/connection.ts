import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';

/**
 * MongoDB Connection Manager for Self Print Platform
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {
    this.registerEventListeners();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private registerEventListeners(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      console.log('✅ MongoDB connected successfully to selfprint database');
    });

    mongoose.connection.on('error', (err) => {
      this.isConnected = false;
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      console.warn('⚠️ MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      console.log('🔄 MongoDB reconnected to selfprint database.');
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    try {
      console.log('⏳ Connecting to MongoDB (database: selfprint)...');
      await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB on startup:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected && mongoose.connection.readyState === 0) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 MongoDB connection disconnected cleanly.');
    } catch (error) {
      console.error('❌ Error while disconnecting MongoDB:', error);
      throw error;
    }
  }

  public checkHealth(): boolean {
    return mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    return states[mongoose.connection.readyState] || 'Unknown';
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export const connectDatabase = () => dbConnection.connect();
export const disconnectDatabase = () => dbConnection.disconnect();
export const isDatabaseHealthy = () => dbConnection.checkHealth();
export default dbConnection;
