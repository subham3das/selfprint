import mongoose, { Schema, Model, Document } from 'mongoose';

export type SettlementStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'Completed' | 'Pending' | 'Failed';
export type SettlementPaymentMethod =
  | 'Bank Transfer'
  | 'UPI'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'RazorpayX';

export interface ISettlement extends Document {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  merchantId?: mongoose.Types.ObjectId | null;
  amount: number;
  commission: number;
  netAmount: number;
  status: SettlementStatus;
  transactionReference: string; // UTR or Reference No
  paymentMethod: SettlementPaymentMethod;
  processedBy: string;
  processedById?: mongoose.Types.ObjectId | null;
  processedAt: Date;
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
      enum: ['COMPLETED', 'PENDING', 'FAILED', 'Completed', 'Pending', 'Failed'],
      default: 'COMPLETED',
      index: true
    },
    transactionReference: {
      type: String,
      required: [true, 'Transaction reference (UTR) is required'],
      trim: true,
      index: true
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

export const SettlementModel: Model<ISettlement> =
  mongoose.models.Settlement ||
  mongoose.model<ISettlement>('Settlement', settlementSchema);

export default SettlementModel;
