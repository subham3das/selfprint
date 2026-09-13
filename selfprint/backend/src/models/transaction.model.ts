import mongoose, { Schema, Model, Document } from 'mongoose';

export type PaymentGatewayType = 'RAZORPAY' | 'CASHFREE' | 'UPI' | 'WALLET' | 'CASH';
export type TransactionStatusType = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type SettlementStatusType = 'PENDING' | 'SETTLED';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  transactionId: string;
  storeId?: mongoose.Types.ObjectId | null;
  deletedStoreId?: string | null;
  deletedStoreName?: string | null;
  userId?: mongoose.Types.ObjectId | null;
  jobId: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  storeEarnings: number;
  currency: string;
  paymentGateway: PaymentGatewayType;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: TransactionStatusType;
  settlementStatus: SettlementStatusType;
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null
    },
    deletedStoreId: {
      type: String,
      default: null,
      index: true
    },
    deletedStoreName: {
      type: String,
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'PrintJob',
      required: [true, 'Print Job ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0
    },
    storeEarnings: {
      type: Number,
      required: [true, 'Store earnings amount is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentGateway: {
      type: String,
      enum: ['RAZORPAY', 'CASHFREE', 'UPI', 'WALLET', 'CASH'],
      default: 'UPI'
    },
    gatewayOrderId: {
      type: String,
      trim: true
    },
    gatewayPaymentId: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'PAID'
    },
    settlementStatus: {
      type: String,
      enum: ['PENDING', 'SETTLED'],
      default: 'PENDING'
    },
    settledAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'transactions'
  }
);

// Indexes
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ jobId: 1 });
transactionSchema.index({ storeId: 1, createdAt: -1 });
transactionSchema.index({ storeId: 1, status: 1, createdAt: -1 });
transactionSchema.index({ deletedStoreId: 1 });

export const TransactionModel: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default TransactionModel;
