import { ConnectorAuditLogModel } from './model';
import { AuditActionType, ConnectorAuditLog } from './types';

// In-memory fallback audit buffer (keeps last 500 logs)
const inMemoryAuditLogs: ConnectorAuditLog[] = [];

export class ConnectorAuditService {
  /**
   * Records an audit log entry for a connector lifecycle or administrative action.
   */
  public async log(
    connectorId: string,
    action: AuditActionType,
    details?: Record<string, unknown> | null,
    performedBy = 'SYSTEM',
    ipAddress = '127.0.0.1'
  ): Promise<void> {
    const entry: ConnectorAuditLog = {
      connectorId,
      action,
      details: details || null,
      performedBy,
      ipAddress,
      timestamp: new Date()
    };

    try {
      if (ConnectorAuditLogModel) {
        await ConnectorAuditLogModel.create(entry);
      } else {
        inMemoryAuditLogs.unshift(entry);
        if (inMemoryAuditLogs.length > 500) {
          inMemoryAuditLogs.pop();
        }
      }
    } catch (err) {
      console.error('[ConnectorAudit] Error writing audit log:', err);
    }
  }

  /**
   * Retrieves audit logs for a specific connector.
   */
  public async getLogsByConnector(connectorId: string, limit = 50): Promise<ConnectorAuditLog[]> {
    if (ConnectorAuditLogModel) {
      return await ConnectorAuditLogModel.find({ connectorId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    } else {
      return inMemoryAuditLogs
        .filter((l) => l.connectorId === connectorId)
        .slice(0, limit);
    }
  }
}

export const connectorAuditService = new ConnectorAuditService();
