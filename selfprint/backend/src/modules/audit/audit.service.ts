import mongoose from 'mongoose';
import { AuditLogModel } from '../../models/auditLog.model';

export interface CreateAuditLogParams {
  action: string;
  actorId?: string | mongoose.Types.ObjectId;
  actorEmail: string;
  actorRole: string;
  targetEntity: string;
  targetId?: string;
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED';
}

export class AuditService {
  /**
   * Record an immutable administrative action log entry
   */
  public async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await AuditLogModel.create({
        action: params.action,
        actorId: params.actorId ? new mongoose.Types.ObjectId(params.actorId.toString()) : undefined,
        actorEmail: params.actorEmail,
        actorRole: params.actorRole || 'SYSTEM',
        targetEntity: params.targetEntity,
        targetId: params.targetId || '',
        description: params.description,
        details: params.details || {},
        ipAddress: params.ipAddress || '',
        userAgent: params.userAgent || '',
        status: params.status || 'SUCCESS'
      });
    } catch (err) {
      console.error('Failed to write audit log entry:', err);
    }
  }
}

export const auditService = new AuditService();
export default auditService;
