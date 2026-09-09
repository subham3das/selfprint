import mongoose, { Schema, Model } from 'mongoose';

export type PrinterStatusType = 'ONLINE' | 'PRINTING' | 'OFFLINE' | 'WARNING' | 'ERROR' | 'PAUSED';
export type PrinterConnectionType = 'USB' | 'WIFI' | 'NETWORK' | 'LAN' | 'BLUETOOTH' | 'VIRTUAL';

export interface IPrinter {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  hostId?: mongoose.Types.ObjectId;
  deviceId?: string;
  printerName: string;
  model: string;
  brand: string;
  driver?: string;
  port?: string;
  connectionType: PrinterConnectionType;
  status: PrinterStatusType;
  paperLevel: number;
  tonerLevel: number;
  isDefault: boolean;
  capabilities?: {
    isColor?: boolean;
    isDuplex?: boolean;
    isAutoCut?: boolean;
    paperSizes?: string[];
  };
  lastHeartbeat: Date;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const printerSchema = new Schema<IPrinter>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'Host'
    },
    deviceId: {
      type: String,
      trim: true
    },
    printerName: {
      type: String,
      required: [true, 'Printer name is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Printer model is required'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Printer brand is required'],
      trim: true
    },
    driver: {
      type: String,
      trim: true
    },
    port: {
      type: String,
      trim: true
    },
    connectionType: {
      type: String,
      enum: ['USB', 'WIFI', 'NETWORK', 'LAN', 'BLUETOOTH', 'VIRTUAL'],
      default: 'USB'
    },
    status: {
      type: String,
      enum: ['ONLINE', 'PRINTING', 'OFFLINE', 'WARNING', 'ERROR', 'PAUSED'],
      default: 'ONLINE'
    },
    paperLevel: {
      type: Number,
      default: 90,
      min: 0,
      max: 100
    },
    tonerLevel: {
      type: Number,
      default: 85,
      min: 0,
      max: 100
    },
    isDefault: {
      type: Boolean,
      default: true
    },
    capabilities: {
      isColor: { type: Boolean, default: false },
      isDuplex: { type: Boolean, default: true },
      isAutoCut: { type: Boolean, default: false },
      paperSizes: { type: [String], default: ['A4', 'Letter'] }
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'printers'
  }
);

// Compound Index for fast lookup by store & status
printerSchema.index({ storeId: 1, status: 1 });
printerSchema.index({ storeId: 1, isDefault: 1 });

export const PrinterModel: Model<IPrinter> =
  mongoose.models.Printer || mongoose.model<IPrinter>('Printer', printerSchema);

export default PrinterModel;
