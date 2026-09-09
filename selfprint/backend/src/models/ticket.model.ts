import mongoose, { Schema, Model } from 'mongoose';

export type TicketStatus =
  | 'Open'
  | 'Pending'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Escalated';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Technical'
  | 'Billing'
  | 'Refund'
  | 'Print Quality'
  | 'Account'
  | 'General'
  | 'Other';

export interface ISupportMessage {
  sender: 'customer' | 'admin';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: Date;
  attachments?: string[];
  isRead?: boolean;
}

export interface ITicket {
  _id: mongoose.Types.ObjectId;
  ticketId: string;
  subject: string;
  description?: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  storeId?: mongoose.Types.ObjectId | null;
  userId?: mongoose.Types.ObjectId | null;
  assignedAdminId?: mongoose.Types.ObjectId | null;
  assignedAdminName?: string;
  assignedAdminAvatar?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  source: 'Web App' | 'QR Portal' | 'Email' | 'WhatsApp';
  messages: ISupportMessage[];
  internalNotes?: string[];
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  satisfactionRating?: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketActivity {
  _id: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  ticketNumber: string;
  action: 'created' | 'assigned' | 'resolved' | 'status_changed' | 'feedback' | 'replied';
  description: string;
  actor: string;
  iconType: 'receipt' | 'user' | 'check' | 'clock' | 'heart';
  createdAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    attachments: { type: [String], default: [] },
    isRead: { type: Boolean, default: false }
  },
  { _id: true }
);

const ticketSchema = new Schema<ITicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Billing', 'Refund', 'Print Quality', 'Account', 'General', 'Other'],
      default: 'General'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'],
      default: 'Open'
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAdminName: {
      type: String,
      default: 'Unassigned'
    },
    assignedAdminAvatar: {
      type: String,
      default: ''
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      default: ''
    },
    customerAvatar: {
      type: String,
      default: ''
    },
    source: {
      type: String,
      enum: ['Web App', 'QR Portal', 'Email', 'WhatsApp'],
      default: 'Web App'
    },
    messages: [supportMessageSchema],
    internalNotes: {
      type: [String],
      default: []
    },
    resolution: {
      type: String
    },
    resolvedBy: {
      type: String
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'tickets'
  }
);

// Indexes
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ storeId: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

const ticketActivitySchema = new Schema<ITicketActivity>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    ticketNumber: { type: String, required: true },
    action: {
      type: String,
      enum: ['created', 'assigned', 'resolved', 'status_changed', 'feedback', 'replied'],
      required: true
    },
    description: { type: String, required: true },
    actor: { type: String, required: true },
    iconType: {
      type: String,
      enum: ['receipt', 'user', 'check', 'clock', 'heart'],
      default: 'receipt'
    }
  },
  {
    timestamps: true,
    collection: 'ticket_activities'
  }
);

ticketActivitySchema.index({ createdAt: -1 });

export const TicketModel: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', ticketSchema);

export const TicketActivityModel: Model<ITicketActivity> =
  mongoose.models.TicketActivity || mongoose.model<ITicketActivity>('TicketActivity', ticketActivitySchema);

export default TicketModel;
