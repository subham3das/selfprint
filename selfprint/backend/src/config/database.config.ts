import { ConnectOptions } from 'mongoose';
import { env } from './environment';

export const databaseConfig: {
  uri: string;
  options: ConnectOptions;
} = {
  uri: env.MONGODB_URI,
  options: {
    dbName: 'selfprint',
    autoIndex: env.isDevelopment,
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4
  }
};


export default databaseConfig;
