import mongoose, { Schema, Model } from 'mongoose';

export interface IQRLink {
  _id: mongoose.Types.ObjectId;
  token: string;
  storeId: mongoose.Types.ObjectId;
  targetUrl: string;
  templateName: string;
  primaryColor: string;
  secondaryColor: string;
  uploadLimitMb: number;
  welcomeMessage: string;
  logoUrl?: string;
  expiry: string;
  version: number;
  totalScans: number;
  downloadsCount: number;
  lastScannedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const qrLinkSchema = new Schema<IQRLink>(
  {
    token: {
      type: String,
      required: [true, 'QR token is required'],
      trim: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required']
    },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      trim: true
    },
    templateName: {
      type: String,
      default: 'default'
    },
    primaryColor: {
      type: String,
      default: '#6366F1'
    },
    secondaryColor: {
      type: String,
      default: '#1E293B'
    },
    uploadLimitMb: {
      type: Number,
      default: 50
    },
    welcomeMessage: {
      type: String,
      default: 'Scan to upload documents instantly & pick up your high quality prints!'
    },
    logoUrl: {
      type: String,
      default: ''
    },
    expiry: {
      type: String,
      default: 'No Expiry'
    },
    version: {
      type: Number,
      default: 1
    },
    totalScans: {
      type: Number,
      default: 0
    },
    downloadsCount: {
      type: Number,
      default: 0
    },
    lastScannedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'qr_links'
  }
);

qrLinkSchema.index({ token: 1 }, { unique: true });
qrLinkSchema.index({ storeId: 1 });

export const QRLinkModel: Model<IQRLink> =
  mongoose.models.QRLink || mongoose.model<IQRLink>('QRLink', qrLinkSchema);

export default QRLinkModel;
