import mongoose, { Schema, Model } from 'mongoose';

export type AuditSeverity = 'Info' | 'Success' | 'Warning' | 'Critical' | 'Security';
export type AuditStatus = 'Completed' | 'Failed' | 'Blocked' | 'Pending' | 'SUCCESS' | 'FAILED';
export type AuditRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IAuditLocation {
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  lat?: number;
  lng?: number;
}

export interface IAuditClientInfo {
  device: string;
  browser: string;
  os: string;
  userAgent: string;
}

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  action: string;
  module: string;
  severity: AuditSeverity;
  status: AuditStatus;
  riskLevel: AuditRiskLevel;
  actorId?: mongoose.Types.ObjectId;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  actorAvatarBg?: string;
  actorAvatarText?: string;
  targetEntity?: string;
  targetId?: string;
  targetResource: string;
  resourceId?: string;
  resourceType?: string;
  ipAddress: string;
  location: IAuditLocation;
  clientInfo: IAuditClientInfo;
  description: string;
  details?: Record<string, any>;
  oldValue?: Record<string, any> | string;
  newValue?: Record<string, any> | string;
  requestPayload?: Record<string, any> | string;
  responseSummary?: string;
  sessionId?: string;
  executionTimeMs?: number;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      index: true
    },
    module: {
      type: String,
      default: 'System',
      trim: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['Info', 'Success', 'Warning', 'Critical', 'Security'],
      default: 'Info',
      index: true
    },
    status: {
      type: String,
      enum: ['Completed', 'Failed', 'Blocked', 'Pending', 'SUCCESS', 'FAILED'],
      default: 'Completed',
      index: true
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
      index: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    actorName: {
      type: String,
      default: 'Administrator',
      trim: true
    },
    actorEmail: {
      type: String,
      required: [true, 'Actor email is required'],
      trim: true,
      index: true
    },
    actorRole: {
      type: String,
      default: 'Super Admin',
      trim: true,
      index: true
    },
    actorAvatarBg: {
      type: String,
      default: 'bg-indigo-600'
    },
    actorAvatarText: {
      type: String,
      default: 'AD'
    },
    targetEntity: {
      type: String,
      default: 'SYSTEM'
    },
    targetId: {
      type: String,
      default: ''
    },
    targetResource: {
      type: String,
      default: 'System Configuration',
      trim: true
    },
    resourceId: {
      type: String,
      default: ''
    },
    resourceType: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
      index: true
    },
    location: {
      city: { type: String, default: 'Guwahati' },
      state: { type: String, default: 'Assam' },
      country: { type: String, default: 'India' },
      countryCode: { type: String, default: 'IN' },
      lat: { type: Number, default: 26.1445 },
      lng: { type: Number, default: 91.7362 }
    },
    clientInfo: {
      device: { type: String, default: 'Desktop' },
      browser: { type: String, default: 'Chrome' },
      os: { type: String, default: 'Windows' },
      userAgent: { type: String, default: 'Mozilla/5.0' }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    oldValue: {
      type: Schema.Types.Mixed
    },
    newValue: {
      type: Schema.Types.Mixed
    },
    requestPayload: {
      type: Schema.Types.Mixed
    },
    responseSummary: {
      type: String,
      default: ''
    },
    sessionId: {
      type: String,
      default: ''
    },
    executionTimeMs: {
      type: Number,
      default: 45
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'audit_logs'
  }
);

// High Performance Multi-Key Indexes
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ actorEmail: 1, createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLogModel;
