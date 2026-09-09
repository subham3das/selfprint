import mongoose, { Schema, Model } from 'mongoose';

export interface IStaffInvitation {
  _id: mongoose.Types.ObjectId;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  department: string;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  permissions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const staffInvitationSchema = new Schema<IStaffInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      required: true,
      default: 'Admin'
    },
    department: {
      type: String,
      required: true,
      default: 'Operations'
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    invitedBy: {
      type: String,
      default: 'Super Admin'
    },
    expiresAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING'
    },
    permissions: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'staff_invitations'
  }
);

staffInvitationSchema.index({ email: 1, status: 1 });

export const StaffInvitationModel: Model<IStaffInvitation> =
  mongoose.models.StaffInvitation || mongoose.model<IStaffInvitation>('StaffInvitation', staffInvitationSchema);

export default StaffInvitationModel;
