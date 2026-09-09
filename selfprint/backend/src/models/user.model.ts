import mongoose, { Schema, Model } from 'mongoose';

export type UserStatusType =
  | 'Active'
  | 'Inactive'
  | 'Blocked'
  | 'Banned'
  | 'Pending'
  | 'Verified';

export type UserMembershipPlanType = 'Basic' | 'Pro' | 'Enterprise' | 'Student';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  userIdCode: string; // e.g. "USR-1001"
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  storeId?: mongoose.Types.ObjectId | null;
  city: string;
  state: string;
  fullAddress: string;
  country: string;
  status: UserStatusType;
  membershipPlan: UserMembershipPlanType;
  isVerified: boolean;
  isOnline: boolean;
  lastActive: Date;
  lastLoginAt?: Date;
  blockReason?: string;
  blockedAt?: Date;
  blockedBy?: mongoose.Types.ObjectId | null;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userIdCode: {
      type: String,
      required: [true, 'User ID code is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null
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
    fullAddress: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blocked', 'Banned', 'Pending', 'Verified'],
      default: 'Active'
    },
    membershipPlan: {
      type: String,
      enum: ['Basic', 'Pro', 'Enterprise', 'Student'],
      default: 'Basic'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    },
    blockReason: {
      type: String,
      default: ''
    },
    blockedAt: {
      type: Date
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Indexes for high-performance multi-filtering & sorting
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userIdCode: 1 }, { unique: true });
userSchema.index({ isDeleted: 1, status: 1 });
userSchema.index({ isDeleted: 1, city: 1 });
userSchema.index({ isDeleted: 1, storeId: 1 });
userSchema.index({ isDeleted: 1, membershipPlan: 1 });
userSchema.index({ isDeleted: 1, createdAt: -1 });

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default UserModel;
