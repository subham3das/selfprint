import mongoose, { Schema, Model } from 'mongoose';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'info' | 'warning' | 'success' | 'error';

export interface IStoreNotification {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

const storeNotificationSchema = new Schema<IStoreNotification>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'info', 'warning', 'success', 'error'],
      default: 'INFO'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    collection: 'store_notifications'
  }
);

// Compound Index for fast lookup by store, isRead, and createdAt
storeNotificationSchema.index({ storeId: 1, isRead: 1, createdAt: -1 });

export const StoreNotificationModel: Model<IStoreNotification> =
  mongoose.models.StoreNotification ||
  mongoose.model<IStoreNotification>('StoreNotification', storeNotificationSchema);

export default StoreNotificationModel;
