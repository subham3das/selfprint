import mongoose, { Schema, Model } from 'mongoose';

export interface IStore {
  _id: mongoose.Types.ObjectId;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  password?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber?: string;
  logo?: string;
  storeImage?: string;
  storeCode: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'BLOCKED' | 'DELETED';
  isVerified: boolean;
  isFirstLogin: boolean;
  printerConfigured: boolean;
  verifiedAt?: Date;
  blocked: boolean;
  blockedAt?: Date;
  blockedBy?: mongoose.Types.ObjectId;
  blockReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Store email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    alternatePhone: {
      type: String,
      default: '',
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    address: {
      type: String,
      required: [true, 'Store address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      default: 'Assam',
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true
    },
    gstNumber: {
      type: String,
      default: '',
      trim: true,
      uppercase: true
    },
    logo: {
      type: String,
      default: ''
    },
    storeImage: {
      type: String,
      default: ''
    },
    storeCode: {
      type: String,
      required: [true, 'Store code is required'],
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'BLOCKED', 'DELETED'],
      default: 'ACTIVE'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isFirstLogin: {
      type: Boolean,
      default: true
    },
    printerConfigured: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    blocked: {
      type: Boolean,
      default: false,
      index: true
    },
    blockedAt: {
      type: Date
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    blockReason: {
      type: String,
      default: '',
      trim: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    tokenVersion: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'stores'
  }
);

// Indexes
storeSchema.index({ email: 1 }, { unique: true });
storeSchema.index({ storeCode: 1 }, { unique: true });
storeSchema.index({ phone: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ city: 1 });
storeSchema.index({ blocked: 1 });
storeSchema.index({ isDeleted: 1 });

export const StoreModel: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>('Store', storeSchema);

export default StoreModel;
