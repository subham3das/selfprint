import mongoose, { Schema, Model } from 'mongoose';

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
  verifiedAt?: Date;
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
    verifiedAt: {
      type: Date,
      default: Date.now
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
