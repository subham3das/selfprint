import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPairingCode extends Document {
  code: string;
  pairingCode: string;
  storeId: mongoose.Types.ObjectId;
  storeName?: string;
  merchantId?: mongoose.Types.ObjectId | null;
  connectorId?: string | null;
  used: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const pairingCodeSchema = new Schema<IPairingCode>(
  {
    code: {
      type: String,
      required: [true, 'Pairing code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    pairingCode: {
      type: String,
      uppercase: true,
      trim: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: [true, 'Store ID is required'],
      index: true
    },
    storeName: {
      type: String,
      trim: true
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    connectorId: {
      type: String,
      default: null,
      trim: true
    },
    used: {
      type: Boolean,
      default: false,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically deletes document once expiresAt time is reached
    }
  },
  {
    timestamps: true,
    collection: 'pairing_codes'
  }
);

pairingCodeSchema.index({ pairingCode: 1, used: 1 });

export const PairingCodeModel: Model<IPairingCode> =
  mongoose.models.PairingCode || mongoose.model<IPairingCode>('PairingCode', pairingCodeSchema);

export default PairingCodeModel;
