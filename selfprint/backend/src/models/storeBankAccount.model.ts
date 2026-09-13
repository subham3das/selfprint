import mongoose, { Schema, Model } from 'mongoose';

export interface IBankAccountHistory {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  upiId?: string;
  updatedAt: Date;
  updatedBy?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IStoreBankAccount {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  upiId?: string;
  isVerified: boolean;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  settlementMethod: 'Bank Transfer' | 'UPI';
  verifiedAt?: Date;
  history: IBankAccountHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const storeBankAccountSchema = new Schema<IStoreBankAccount>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store reference is required']
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      uppercase: true,
      trim: true
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true
    },
    branchName: {
      type: String,
      default: '',
      trim: true
    },
    upiId: {
      type: String,
      default: '',
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Rejected'],
      default: 'Verified'
    },
    settlementMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI'],
      default: 'Bank Transfer'
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    history: {
      type: [
        {
          accountHolderName: String,
          accountNumber: String,
          ifscCode: String,
          bankName: String,
          branchName: String,
          upiId: String,
          updatedAt: { type: Date, default: Date.now },
          updatedBy: String,
          ipAddress: String,
          userAgent: String
        }
      ],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'store_bank_accounts'
  }
);

storeBankAccountSchema.index({ storeId: 1 }, { unique: true });

export const StoreBankAccountModel: Model<IStoreBankAccount> =
  mongoose.models.StoreBankAccount ||
  mongoose.model<IStoreBankAccount>('StoreBankAccount', storeBankAccountSchema);

export default StoreBankAccountModel;
