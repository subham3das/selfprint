import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IQRHistory extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  template: string;
  url: string;
  qrToken?: string;
  version: number;
  expiry: string;
  status: 'Active' | 'Expired' | 'Revoked';
  downloadsCount: number;
  scanCount: number;
  createdOn: string;
  createdAt: Date;
  updatedAt: Date;
}

const qrHistorySchema = new Schema<IQRHistory>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: 'Main Store'
    },
    template: {
      type: String,
      default: 'default'
    },
    url: {
      type: String,
      required: true
    },
    qrToken: {
      type: String,
      trim: true
    },
    version: {
      type: Number,
      default: 1
    },
    expiry: {
      type: String,
      default: 'No Expiry'
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Revoked'],
      default: 'Active'
    },
    downloadsCount: {
      type: Number,
      default: 0
    },
    scanCount: {
      type: Number,
      default: 0
    },
    createdOn: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'qr_history'
  }
);

// Indexes
qrHistorySchema.index({ storeId: 1, createdAt: -1 });
qrHistorySchema.index({ qrToken: 1 });

export const QRHistoryModel: Model<IQRHistory> =
  mongoose.models.QRHistory || mongoose.model<IQRHistory>('QRHistory', qrHistorySchema);

export default QRHistoryModel;
