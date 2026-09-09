import mongoose, { Schema, Model } from 'mongoose';

export type HostStatusType = 'ONLINE' | 'OFFLINE';

export interface IHost {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  hostId: string;
  deviceName: string;
  os: string;
  osRelease?: string;
  hostVersion: string;
  ipAddress?: string;
  status: HostStatusType;
  lastHeartbeat: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hostSchema = new Schema<IHost>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    hostId: {
      type: String,
      required: [true, 'Host ID is required'],
      trim: true
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true
    },
    os: {
      type: String,
      required: [true, 'OS is required'],
      trim: true
    },
    osRelease: {
      type: String,
      trim: true
    },
    hostVersion: {
      type: String,
      default: '1.0.0'
    },
    ipAddress: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'ONLINE'
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'hosts'
  }
);

// Indexes
hostSchema.index({ storeId: 1, hostId: 1 }, { unique: true });

export const HostModel: Model<IHost> =
  mongoose.models.Host || mongoose.model<IHost>('Host', hostSchema);

export default HostModel;
