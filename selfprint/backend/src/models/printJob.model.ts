import mongoose, { Schema, Model } from 'mongoose';

export type PrintJobStatus =
  | 'Waiting'
  | 'Printing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'WAITING'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type PrintJobType = 'BW' | 'COLOR' | 'B&W' | 'Color';
export type PaperSizeType = 'A4' | 'A3' | 'Letter' | 'Legal';
export type PaymentStatusType = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'PAID' | 'PENDING' | 'FAILED';

export interface IPrintJob {
  _id: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId | null;
  deletedStoreId?: string | null;
  deletedStoreName?: string | null;
  userId?: mongoose.Types.ObjectId | null;
  jobNumber: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  totalPages: number;
  copies: number;
  printType: PrintJobType;
  paperSize: PaperSizeType;
  selectedPages: number[] | string;
  customerName?: string;
  status: PrintJobStatus;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  price: number;
  paymentStatus: PaymentStatusType;
  createdAt: Date;
  updatedAt: Date;
}

const printJobSchema = new Schema<IPrintJob>(
  {
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
    jobNumber: {
      type: String,
      required: [true, 'Job number is required'],
      trim: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    fileSize: {
      type: String,
      default: '2.4 MB'
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages is required'],
      min: 1
    },
    copies: {
      type: Number,
      required: [true, 'Copies is required'],
      min: 1,
      default: 1
    },
    printType: {
      type: String,
      enum: ['BW', 'COLOR', 'B&W', 'Color'],
      default: 'B&W'
    },
    paperSize: {
      type: String,
      enum: ['A4', 'A3', 'Letter', 'Legal'],
      default: 'A4'
    },
    selectedPages: {
      type: Schema.Types.Mixed,
      default: 'all'
    },
    customerName: {
      type: String,
      default: 'Guest',
      trim: true
    },
    status: {
      type: String,
      enum: [
        'Waiting',
        'Printing',
        'Completed',
        'Failed',
        'Cancelled',
        'WAITING',
        'PRINTING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
      ],
      default: 'Waiting'
    },
    queuedAt: {
      type: Date,
      default: Date.now
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    price: {
      type: Number,
      required: [true, 'Job price is required'],
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded', 'PAID', 'PENDING', 'FAILED'],
      default: 'Paid'
    }
  },
  {
    timestamps: true,
    collection: 'print_jobs'
  }
);

// Indexes
printJobSchema.index({ jobNumber: 1 }, { unique: true });
printJobSchema.index({ storeId: 1, createdAt: -1 });
printJobSchema.index({ storeId: 1, status: 1, createdAt: -1 });
printJobSchema.index({ deletedStoreId: 1 });

export const PrintJobModel: Model<IPrintJob> =
  mongoose.models.PrintJob || mongoose.model<IPrintJob>('PrintJob', printJobSchema);

export default PrintJobModel;
