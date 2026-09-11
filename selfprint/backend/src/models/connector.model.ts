import mongoose, { Schema, Model, Document } from 'mongoose';
import { ConnectionState } from '../modules/connector/connector.types';

export interface IConnector extends Document {
  connectorId: string;
  storeId: mongoose.Types.ObjectId;
  storeName?: string;
  merchantId?: mongoose.Types.ObjectId;
  machineId: string;
  hostname: string;
  windowsUser?: string;
  os?: string;
  version: string;
  deviceToken: string;
  status: 'ONLINE' | 'OFFLINE';
  state: ConnectionState;
  lastHeartbeat: Date;
  lastSeen: Date;
  pairedAt?: Date;
  health: {
    cpuUsagePercent?: number;
    memoryMB?: number;
    diskGB?: number;
    printSpoolerStatus?: string;
    hasInternet?: boolean;
    latencyMs?: number | null;
    activeQueueSize?: number;
  };
  connectedPrinters: number;
  physicalPrinters: any[];
  driverVersion?: string;
  hostRunning: boolean;
  authenticated: boolean;
  socketConnected: boolean;
  assignedPrinter?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const connectorSchema = new Schema<IConnector>(
  {
    connectorId: {
      type: String,
      required: [true, 'Connector ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true
    },
    storeName: {
      type: String,
      trim: true
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    machineId: {
      type: String,
      required: [true, 'Machine ID is required'],
      trim: true
    },
    hostname: {
      type: String,
      required: [true, 'Hostname is required'],
      trim: true
    },
    windowsUser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      default: 'Windows'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    deviceToken: {
      type: String,
      required: [true, 'Device Token is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'ONLINE',
      index: true
    },
    state: {
      type: String,
      default: 'CONNECTED'
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    pairedAt: {
      type: Date,
      default: Date.now
    },
    health: {
      cpuUsagePercent: { type: Number, default: 0 },
      memoryMB: { type: Number, default: 0 },
      diskGB: { type: Number, default: 0 },
      printSpoolerStatus: { type: String, default: 'Running' },
      hasInternet: { type: Boolean, default: true },
      latencyMs: { type: Number, default: null },
      activeQueueSize: { type: Number, default: 0 }
    },
    connectedPrinters: {
      type: Number,
      default: 0
    },
    physicalPrinters: {
      type: [Schema.Types.Mixed] as any,
      default: []
    },
    driverVersion: {
      type: String,
      default: 'Windows Print Spooler v4'
    },
    hostRunning: {
      type: Boolean,
      default: true
    },
    authenticated: {
      type: Boolean,
      default: true
    },
    socketConnected: {
      type: Boolean,
      default: true
    },
    assignedPrinter: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'connectors'
  }
);

connectorSchema.index({ storeId: 1, connectorId: 1 });

export const ConnectorModel: Model<IConnector> =
  mongoose.models.Connector || mongoose.model<IConnector>('Connector', connectorSchema);

export default ConnectorModel;
