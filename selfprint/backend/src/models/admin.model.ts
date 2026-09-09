import mongoose, { Schema, Model } from 'mongoose';

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'STAFF'
  | 'MANAGER'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'SUPPORT'
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Finance'
  | 'Operations'
  | 'Support';

export type AdminStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Pending Invitation';

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  name: string;
  displayName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminStatus;
  isActivated: boolean;
  activatedAt?: Date;
  permissions: any;
  avatar?: string;
  createdBy?: mongoose.Types.ObjectId | string | null;
  lastLogin?: Date;
  lastLoginIp?: string;
  lastActive?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId | string | null;
  inviteToken?: string;
  inviteExpiresAt?: Date;
  inviteSentAt?: Date;
  emailStatus?: 'PENDING' | 'SENT' | 'FAILED';
  invitationToken?: string;
  invitationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true
    },
    displayName: {
      type: String,
      trim: true,
      default: 'Administrator'
    },
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    department: {
      type: String,
      default: 'Platform Operations',
      trim: true
    },
    designation: {
      type: String,
      default: 'Staff Member',
      trim: true
    },
    passwordHash: {
      type: String,
      default: '',
      select: false
    },
    role: {
      type: String,
      default: 'ADMIN'
    },
    status: {
      type: String,
      default: 'ACTIVE'
    },
    isActivated: {
      type: Boolean,
      default: false
    },
    activatedAt: {
      type: Date
    },
    permissions: {
      type: Schema.Types.Mixed,
      default: ['FULL_ACCESS']
    },
    avatar: {
      type: String,
      default: ''
    },
    createdBy: {
      type: Schema.Types.Mixed,
      default: null
    },
    lastLogin: {
      type: Date
    },
    lastLoginIp: {
      type: String,
      default: ''
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: Schema.Types.Mixed,
      default: null
    },
    inviteToken: {
      type: String
    },
    inviteExpiresAt: {
      type: Date
    },
    inviteSentAt: {
      type: Date
    },
    emailStatus: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING'
    },
    invitationToken: {
      type: String
    },
    invitationExpiresAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'admins'
  }
);

// Indexes
adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ inviteToken: 1 });
adminSchema.index({ invitationToken: 1 });
adminSchema.index({ isDeleted: 1 });
adminSchema.index({ isDeleted: 1, role: 1 });

export const AdminModel: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);

export default AdminModel;
