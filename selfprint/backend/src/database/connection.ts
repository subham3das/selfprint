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

  public async connect(retries = 5, delayMs = 3000): Promise<void> {
    if (this.isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`⏳ Connecting to MongoDB (attempt ${attempt}/${retries})...`);
        await mongoose.connect(databaseConfig.uri, databaseConfig.options);
        this.isConnected = true;
        return;
      } catch (error) {
        console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error);
        if (attempt === retries) {
          console.error('❌ Max connection retries reached for MongoDB. Halting startup.');
          throw error;
        }
        const backoff = delayMs * attempt;
        console.log(`⏳ Retrying MongoDB connection in ${backoff / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
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
