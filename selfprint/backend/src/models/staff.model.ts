import mongoose, { Schema, Model } from 'mongoose';

export type StaffRole =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Finance'
  | 'Operations'
  | 'Support';

export type StaffStatus =
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Pending Invitation';

export type PermissionModule =
  | 'Dashboard'
  | 'Stores'
  | 'Users'
  | 'Transactions'
  | 'Revenue'
  | 'Printers'
  | 'Support'
  | 'Analytics'
  | 'Settings'
  | 'Access Control'
  | 'Audit Logs'
  | 'System Configuration';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'approve'
  | 'manage';

export type ModulePermission = Record<PermissionAction, boolean>;
export type StaffPermissions = Record<PermissionModule, ModulePermission>;

export interface IStaff {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  avatarBg?: string;
  avatarText?: string;
  role: StaffRole;
  department: string;
  designation?: string;
  status: StaffStatus;
  lastLogin?: Date | null;
  lastLoginIp?: string;
  permissions: StaffPermissions;
  createdBy?: string;
  updatedBy?: string;
  isSuperAdmin?: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  invitationToken?: string;
  invitationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Staff email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    avatarBg: {
      type: String,
      default: 'bg-indigo-600'
    },
    avatarText: {
      type: String,
      default: 'ST'
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'Manager', 'Finance', 'Operations', 'Support'],
      default: 'Admin'
    },
    department: {
      type: String,
      default: 'Operations',
      trim: true
    },
    designation: {
      type: String,
      default: 'Staff Member',
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Pending Invitation'],
      default: 'Active'
    },
    lastLogin: {
      type: Date,
      default: null
    },
    lastLoginIp: {
      type: String,
      default: ''
    },
    permissions: {
      type: Schema.Types.Mixed,
      default: {}
    },
    createdBy: {
      type: String,
      default: 'Super Admin'
    },
    updatedBy: {
      type: String,
      default: ''
    },
    isSuperAdmin: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
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
    collection: 'staff'
  }
);

staffSchema.index({ email: 1, isDeleted: 1 });
staffSchema.index({ role: 1, status: 1 });
staffSchema.index({ department: 1 });

export const StaffModel: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>('Staff', staffSchema);

export default StaffModel;
