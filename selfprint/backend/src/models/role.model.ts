import mongoose, { Schema, Model } from 'mongoose';
import { StaffPermissions } from './staff.model';

export interface IRole {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  defaultPermissions: StaffPermissions;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    defaultPermissions: {
      type: Schema.Types.Mixed,
      default: {}
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

export const RoleModel: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);

export default RoleModel;
