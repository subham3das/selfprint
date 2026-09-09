import { connectorStore } from '../storage/connectorStore';
import { Printer } from './types';
import { logger } from '../utils/logger';
import { printerLogger } from '../utils/printerLogger';
import { registrationService } from '../services/registration.service';
import { emitEvent } from '../websocket/socket';

export interface PrinterSyncPayload {
  connectorId: string;
  machineId: string;
  printers: Printer[];
}

/**
 * Dispatches the local machine's detected printer inventory to the SelfPrint Cloud Backend.
 */
export async function syncPrintersToBackend(printers: Printer[]): Promise<boolean> {
  const data = connectorStore.getData();
  const identity = connectorStore.getIdentity();
  const startTime = Date.now();

  // If unregistered, attempt registration
  if (!connectorStore.isRegistered()) {
    await registrationService.ensureRegistered();
  }

  // Also emit via WebSocket
  emitEvent('printer_sync', {
    connectorId: data.connectorId,
    machineId: data.machineId,
    printers,
    timestamp: new Date().toISOString()
  });

  const url = `${data.connectorSettings.backendUrl.replace(/\/$/, '')}/api/v1/connectors/printers/sync`;
  const payload: PrinterSyncPayload = {
    connectorId: data.connectorId,
    machineId: data.machineId,
    printers
  };

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `SelfPrintConnector/${identity.connectorVersion}`
    };

    const token = connectorStore.getDeviceToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      printerLogger.backendSyncSuccess(printers.length, duration);
      logger.info(`Backend sync success: Synchronized ${printers.length} local printer(s) in ${duration}ms.`);
      return true;
    } else {
      const errorText = await response.text().catch(() => '');
      const errMsg = `HTTP ${response.status}: ${errorText || response.statusText}`;
      printerLogger.backendSyncFailed(errMsg);
      logger.debug(`Backend sync skipped/failed: ${errMsg}`);
      return false;
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    printerLogger.backendSyncFailed(errMsg);
    logger.debug(`Backend sync endpoint unreachable: ${errMsg}`);
    return false;
  }
}
