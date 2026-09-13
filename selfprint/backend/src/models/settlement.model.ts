import mongoose, { Schema, Model, Document } from 'mongoose';

export type SettlementStatus =
  | 'COMPLETED'
  | 'PENDING'
  | 'PROCESSING'
  | 'SETTLED'
  | 'FAILED'
  | 'Completed'
  | 'Pending'
  | 'Processing'
  | 'Settled'
  | 'Failed';

export type SettlementPaymentMethod =
  | 'Bank Transfer'
  | 'UPI'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'RazorpayX'
  | 'Manual';

export interface ISettlement extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  merchantId?: mongoose.Types.ObjectId | null;
  periodStart?: Date;
  periodEnd?: Date;
  grossRevenue: number;
  completedOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  platformCommission: number;
  gstOnCommission: number; // 18% GST on platform commission
  refundAmount: number;
  netSettlement: number;
  alreadySettled: number;
  pendingSettlement: number;
  amount: number; // Payout amount for this transaction
  commission: number;
  netAmount: number;
  status: SettlementStatus;
  transactionReference: string; // UTR or Reference No
  utr?: string;
  bankReference?: string;
  paymentMethod: SettlementPaymentMethod;
  processedBy: string;
  processedById?: mongoose.Types.ObjectId | null;
  processedAt: Date;
  settledBy?: string;
  settledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required'],
      index: true
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    periodStart: {
      type: Date,
      default: null
    },
    periodEnd: {
      type: Date,
      default: null
    },
    grossRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    completedOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    failedOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    cancelledOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    platformCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    gstOnCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    netSettlement: {
      type: Number,
      default: 0,
      min: 0
    },
    alreadySettled: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingSettlement: {
      type: Number,
      default: 0,
      min: 0
    },
    amount: {
      type: Number,
      required: [true, 'Settlement amount is required'],
      min: 0
    },
    commission: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      required: [true, 'Net payout amount is required'],
      min: 0
    },
    status: {
      type: String,
      enum: [
        'COMPLETED',
        'PENDING',
        'PROCESSING',
        'SETTLED',
        'FAILED',
        'Completed',
        'Pending',
        'Processing',
        'Settled',
        'Failed'
      ],
      default: 'COMPLETED',
      index: true
    },
    transactionReference: {
      type: String,
      required: [true, 'Transaction reference (UTR) is required'],
      trim: true,
      index: true
    },
    utr: {
      type: String,
      trim: true
    },
    bankReference: {
      type: String,
      default: '',
      trim: true
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer',
      trim: true
    },
    processedBy: {
      type: String,
      default: 'Administrator',
      trim: true
    },
    processedById: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    settledBy: {
      type: String,
      default: 'Administrator',
      trim: true
    },
    settledAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'settlements'
  }
);

settlementSchema.index({ storeId: 1, createdAt: -1 });
settlementSchema.index({ transactionReference: 1 });
settlementSchema.index({ utr: 1 });

export const SettlementModel: Model<ISettlement> =
  mongoose.models.Settlement ||
  mongoose.model<ISettlement>('Settlement', settlementSchema);

export default SettlementModel;
