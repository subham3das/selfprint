import { ConnectOptions } from 'mongoose';
import { env } from './environment';

export const databaseConfig: {
  uri: string;
  options: ConnectOptions;
} = {
  uri: env.MONGODB_URI,
  options: {
    autoIndex: env.isDevelopment,
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4
  }
};

export default databaseConfig;
