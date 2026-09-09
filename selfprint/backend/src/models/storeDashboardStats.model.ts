import mongoose, { Schema, Model } from 'mongoose';

export interface IStoreDashboardStats {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  todayJobs: number;
  todayRevenue: number;
  printingNow: number;
  waitingQueue: number;
  completedToday: number;
  failedToday: number;
  pendingToday: number;
  updatedAt: Date;
}

const storeDashboardStatsSchema = new Schema<IStoreDashboardStats>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required']
    },
    todayJobs: {
      type: Number,
      default: 0
    },
    todayRevenue: {
      type: Number,
      default: 0
    },
    printingNow: {
      type: Number,
      default: 0
    },
    waitingQueue: {
      type: Number,
      default: 0
    },
    completedToday: {
      type: Number,
      default: 0
    },
    failedToday: {
      type: Number,
      default: 0
    },
    pendingToday: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'store_dashboard_stats'
  }
);

// Indexes
storeDashboardStatsSchema.index({ storeId: 1 }, { unique: true });

export const StoreDashboardStatsModel: Model<IStoreDashboardStats> =
  mongoose.models.StoreDashboardStats ||
  mongoose.model<IStoreDashboardStats>('StoreDashboardStats', storeDashboardStatsSchema);

export default StoreDashboardStatsModel;
