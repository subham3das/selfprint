/**
 * Request body and parameter validators for Connector API endpoints.
 */

import { RegisterConnectorDto, HeartbeatDto, PrinterSyncDto } from './types';

export class ConnectorValidator {
  public static validateRegister(body: any): { isValid: boolean; error?: string; value?: RegisterConnectorDto } {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body must be a valid JSON object.' };
    }

    const { connectorId, machineId, hostname, osVersion, windowsUser, connectorVersion } = body;

    if (!connectorId || typeof connectorId !== 'string' || connectorId.trim().length === 0) {
      return { isValid: false, error: 'Field "connectorId" is required and must be a non-empty string.' };
    }

    if (!machineId || typeof machineId !== 'string' || machineId.trim().length === 0) {
      return { isValid: false, error: 'Field "machineId" is required and must be a non-empty string.' };
    }

    if (!hostname || typeof hostname !== 'string') {
      return { isValid: false, error: 'Field "hostname" is required.' };
    }

    if (!osVersion || typeof osVersion !== 'string') {
      return { isValid: false, error: 'Field "osVersion" is required.' };
    }

    if (!connectorVersion || typeof connectorVersion !== 'string') {
      return { isValid: false, error: 'Field "connectorVersion" is required.' };
    }

    return {
      isValid: true,
      value: {
        connectorId: connectorId.trim(),
        machineId: machineId.trim(),
        hostname: hostname.trim(),
        osVersion: osVersion.trim(),
        windowsUser: typeof windowsUser === 'string' ? windowsUser.trim() : 'SYSTEM',
        connectorVersion: connectorVersion.trim()
      }
    };
  }

  public static validateHeartbeat(body: any): { isValid: boolean; error?: string; value?: HeartbeatDto } {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body must be a valid JSON object.' };
    }

    const {
      connectorId,
      machineId,
      uptime,
      printerCount,
      memoryUsage,
      diskUsage,
      cpuUsage,
      spoolerStatus,
      activeQueueSize,
      connectorVersion
    } = body;

    if (!connectorId || typeof connectorId !== 'string') {
      return { isValid: false, error: 'Field "connectorId" is required.' };
    }

    if (!machineId || typeof machineId !== 'string') {
      return { isValid: false, error: 'Field "machineId" is required.' };
    }

    return {
      isValid: true,
      value: {
        connectorId: connectorId.trim(),
        machineId: machineId.trim(),
        uptime: typeof uptime === 'number' ? uptime : 0,
        printerCount: typeof printerCount === 'number' ? printerCount : 0,
        memoryUsage: typeof memoryUsage === 'object' ? memoryUsage : undefined,
        diskUsage: typeof diskUsage === 'object' ? diskUsage : undefined,
        cpuUsage: typeof cpuUsage === 'number' ? cpuUsage : undefined,
        spoolerStatus: typeof spoolerStatus === 'string' ? spoolerStatus : 'Running',
        activeQueueSize: typeof activeQueueSize === 'number' ? activeQueueSize : 0,
        connectorVersion: typeof connectorVersion === 'string' ? connectorVersion.trim() : '0.2.0'
      }
    };
  }

  public static validatePrinterSync(body: any): { isValid: boolean; error?: string; value?: PrinterSyncDto } {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Request body must be a valid JSON object.' };
    }

    const { connectorId, machineId, printers } = body;

    if (!connectorId || typeof connectorId !== 'string') {
      return { isValid: false, error: 'Field "connectorId" is required.' };
    }

    if (!Array.isArray(printers)) {
      return { isValid: false, error: 'Field "printers" must be an array.' };
    }

    return {
      isValid: true,
      value: {
        connectorId: connectorId.trim(),
        machineId: typeof machineId === 'string' ? machineId.trim() : undefined,
        printers
      }
    };
  }
}
