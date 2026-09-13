import { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { DetectedPrinter } from '../types/printerSetup.types';
import { printerService } from '../services/printer.service';
import { useConnectorStore } from '../stores/useConnectorStore';
import { ConnectionState } from '../types/connectionState';

export type { ConnectionState };
export type RealtimeConnectionState = ConnectionState;

export const EMPTY_PRINTER: DetectedPrinter = {
  id: '',
  name: 'No printer configured',
  model: 'Not Configured',
  brand: 'Generic',
  type: 'LaserJet',
  status: 'Not Configured' as any,
  connection: 'USB',
  firmwareVersion: '1.0.0',
  serialNumber: '-',
  isColor: false,
  isDuplexSupported: false,
  isAutoCutSupported: false,
  isDriverInstalled: false,
  paperLevel: 0,
  inkLevels: { black: 0 }
};

/**
 * Lightweight adapter hook over centralized useConnectorStore.
 * Zero duplicate socket listeners. Single source of truth.
 */
export const usePrinterMonitoring = () => {
  const {
    isOnline,
    state,
    hostname,
    lastHeartbeat,
    authenticated,
    socketConnected,
    physicalPrinters,
    physicalPrinterCount,
    hydrate
  } = useConnectorStore();

  // Hydrate connector state once
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Map physical printers to DetectedPrinter format
  const mappedPrinters: DetectedPrinter[] = (physicalPrinters || []).map((p: any) => ({
    id: p.id || p.deviceId || p.name,
    name: p.name || p.printerName,
    brand: p.brand || 'Generic',
    model: p.model || p.name,
    type: p.type || 'LaserJet',
    connection: p.connectionType || p.connection || 'USB',
    port: p.port || 'USB001',
    isColor: p.capabilities?.isColor ?? false,
    isDuplexSupported: p.capabilities?.isDuplex ?? true,
    isAutoCutSupported: p.capabilities?.isAutoCut ?? false,
    isDriverInstalled: true,
    paperLevel: p.paperLevel ?? 90,
    inkLevels: { black: p.tonerLevel ?? 85 },
    status: p.status === 'ONLINE' ? 'Online' : 'Offline',
    firmwareVersion: '1.0.0',
    serialNumber: p.id || p.name
  }));

  const [selectedPrinter, setSelectedPrinter] = useState<DetectedPrinter | null>(null);
  const activePrinter: DetectedPrinter = selectedPrinter || (mappedPrinters.length > 0 ? mappedPrinters[0] : EMPTY_PRINTER);

  const hostInfo = {
    hostname,
    lastHeartbeat,
    authenticated,
    socketConnected,
    printerCount: physicalPrinterCount
  };

  const restartSpooler = async () => {
    if (!activePrinter.id) return;
    await printerService.restartPrinter(activePrinter.id);
  };

  const checkHost = useCallback(async () => {
    await hydrate(undefined, true);
  }, [hydrate]);

  return {
    connectionState: (state as ConnectionState) || (isOnline ? 'CONNECTED' : 'OFFLINE'),
    isConnectorOnline: isOnline,
    hostInfo,
    printers: mappedPrinters,
    activePrinter,
    setActivePrinter: (p: DetectedPrinter) => setSelectedPrinter(p),
    notifications: [],
    addNotification: () => {},
    dismissNotification: () => {},
    triggerMockEvent: (_eventType: any) => {},
    restartSpooler,
    checkHost
  };
};

export default usePrinterMonitoring;
