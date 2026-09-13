import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DetectedPrinter,
  PrinterNotificationItem
} from '../types/printerSetup.types';
import { printerService } from '../services/printer.service';
import { storeAuthService } from '../services/storeAuth.service';
import { getSocket } from '@/lib/socket';
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
  serialNumber: '—',
  isColor: false,
  isDuplexSupported: false,
  isAutoCutSupported: false,
  isDriverInstalled: false,
  paperLevel: 0,
  inkLevels: { black: 0 }
};

export const usePrinterMonitoring = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('OFFLINE');
  const [isConnectorOnline, setIsConnectorOnline] = useState<boolean>(false);
  const [hostInfo, setHostInfo] = useState<any>(null);
  const [printers, setPrinters] = useState<DetectedPrinter[]>([]);
  const [activePrinter, setActivePrinter] = useState<DetectedPrinter>(EMPTY_PRINTER);
  const [notifications, setNotifications] = useState<PrinterNotificationItem[]>([]);

  const lastKnownStateRef = useRef<ConnectionState | null>(null);
  const recentNotifsRef = useRef<Map<string, number>>(new Map());
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addNotification = useCallback(
    (item: Omit<PrinterNotificationItem, 'id' | 'timestamp'>) => {
      // Deduplication: suppress duplicate notifications within 10 seconds (Requirement 4)
      const key = `${item.type}:${item.title}:${item.message}`;
      const now = Date.now();
      const lastSent = recentNotifsRef.current.get(key);
      if (lastSent && now - lastSent < 10000) {
        return;
      }
      recentNotifsRef.current.set(key, now);

      const newNotif: PrinterNotificationItem = {
        ...item,
        id: `notif-${now}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: 'Just now'
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Queries connector status exclusively from the Backend (Single Source of Truth).
   */
  const checkConnectorStatus = useCallback(async () => {
    try {
      const storeId = storeAuthService.getStoreId() || undefined;
      const backendStatus = await printerService.getConnectorStatus(storeId);

      // Never treat 400 Bad Request / Validation Failure as Connector Offline
      if (backendStatus.isInvalidRequest || backendStatus.httpStatus === 400) {
        return false;
      }

      const prevState = lastKnownStateRef.current;

      if (backendStatus.isOnline && backendStatus.paired) {
        setIsConnectorOnline(true);
        setHostInfo({
          hostname: backendStatus.connector?.hostname,
          version: backendStatus.connector?.version,
          machineId: backendStatus.connector?.machineId,
          lastHeartbeat: backendStatus.lastHeartbeat,
          authenticated: backendStatus.authenticated,
          socketConnected: backendStatus.socketConnected,
          printerCount: backendStatus.printerCount
        });

        const effectiveState = (backendStatus.state as ConnectionState) || (backendStatus.printerCount > 0 ? 'READY' : 'CONNECTED');
        setConnectionState(effectiveState);
        lastKnownStateRef.current = effectiveState;

        // ONLY fire notification when transitioning from OFFLINE to CONNECTED/READY
        if (prevState === 'OFFLINE') {
          addNotification({
            type: 'success',
            title: 'Connector Online',
            message: `Desktop Connector verified online via Cloud Backend.`
          });
        }

        // Synchronize physical printers strictly from backend telemetry
        const rawPhysical = Array.isArray(backendStatus.physicalPrinters) ? backendStatus.physicalPrinters : [];
        const mapped: DetectedPrinter[] = rawPhysical.map((p: any) => ({
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
        setPrinters(mapped);
        if (mapped.length > 0) {
          setActivePrinter(mapped[0]);
        } else {
          setActivePrinter(EMPTY_PRINTER);
        }

        console.log('[usePrinterMonitoring] Hardware state synced from backend:', {
          isConnectorOnline: backendStatus.isOnline,
          backendReportedPrinters: backendStatus.printerCount,
          mappedPrintersCount: mapped.length,
          activePrinter: mapped[0]?.name || 'None'
        });

        return true;
      } else {
        const nextState: ConnectionState =
          (backendStatus.state as ConnectionState) ||
          (backendStatus.httpStatus === 404 ? 'NOT_PAIRED' : 'OFFLINE');

        lastKnownStateRef.current = nextState;
        setIsConnectorOnline(false);
        setConnectionState(nextState);
        setPrinters([]);
        setActivePrinter(EMPTY_PRINTER);
        printerService.clearSavedPrinter();

        // ONLY show offline notification on TRUE transition from CONNECTED/READY -> OFFLINE
        if ((prevState === 'CONNECTED' || prevState === 'READY') && backendStatus.httpStatus === 408) {
          addNotification({
            type: 'error',
            title: 'Connector Offline',
            message: backendStatus.errorMessage || 'Desktop Connector heartbeat timeout (>35s).'
          });
        }
        return false;
      }
    } catch {
      // Network failure: silent update during background polling
      const prevState = lastKnownStateRef.current;
      lastKnownStateRef.current = 'OFFLINE';
      setIsConnectorOnline(false);
      setConnectionState('OFFLINE');
      setPrinters([]);
      setActivePrinter(EMPTY_PRINTER);

      if (prevState === 'CONNECTED' || prevState === 'READY') {
        addNotification({
          type: 'error',
          title: 'Connector Offline',
          message: 'Desktop Connector host service communication lost.'
        });
      }
      return false;
    }
  }, [addNotification]);

  // Initial check and periodic polling (every 5s to Backend only)
  useEffect(() => {
    checkConnectorStatus();
    checkTimerRef.current = setInterval(checkConnectorStatus, 5000);

    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, [checkConnectorStatus]);

  // Realtime Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();

    // Auto-join store room if store token exists
    const storeId = storeAuthService.getStoreId() || localStorage.getItem('selfprint_store_id') || 'default';
    socket.emit('join_store', storeId);

    const handlePrinterSynced = (data: { count?: number; printers?: any[] }) => {
      const raw = Array.isArray(data.printers) ? data.printers : [];
      const mapped: DetectedPrinter[] = raw.map((p: any) => ({
        id: p.id || p.deviceId || p.name,
        name: p.printerName || p.name,
        brand: p.brand || 'Generic',
        model: p.model || p.printerName || p.name,
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
      setPrinters(mapped);
      if (mapped.length > 0) {
        setActivePrinter(mapped[0]);
      } else {
        setActivePrinter(EMPTY_PRINTER);
      }
      console.log('[usePrinterMonitoring:handlePrinterSynced] Realtime printers synced:', { count: mapped.length, printers: mapped });
    };

    const handleConnectorConnected = (data: any) => {
      const prevState = lastKnownStateRef.current;
      lastKnownStateRef.current = 'CONNECTED';
      setIsConnectorOnline(true);
      setConnectionState('CONNECTED');
      if (data?.hostname) {
        setHostInfo((prev: any) => ({ ...prev, hostname: data.hostname }));
      }
      if (prevState === 'OFFLINE') {
        addNotification({
          type: 'success',
          title: 'Connector Online',
          message: 'Desktop Connector reconnected.'
        });
      }
    };

    const handleConnectorAuthenticated = () => {
      lastKnownStateRef.current = 'CONNECTED';
      setIsConnectorOnline(true);
      setConnectionState('CONNECTED');
      addNotification({
        type: 'success',
        title: 'Connector Authenticated',
        message: 'Device token verified successfully.'
      });
    };

    const handleConnectorDisconnected = (data: any) => {
      const prevState = lastKnownStateRef.current;
      lastKnownStateRef.current = 'OFFLINE';
      setIsConnectorOnline(false);
      setConnectionState('OFFLINE');
      setPrinters([]);
      setActivePrinter(EMPTY_PRINTER);
      printerService.clearSavedPrinter();

      // Only fire toast if previously in connected/ready state
      if (prevState === 'CONNECTED' || prevState === 'READY') {
        addNotification({
          type: 'error',
          title: 'Connector Offline',
          message: data?.reason || 'Desktop Connector heartbeat timeout (>35s) or disconnected.'
        });
      }
    };

    const handleConnectorReconnecting = () => {
      setConnectionState('RECONNECTING');
    };

    const handleConnectorStatus = (data: { status?: string; state?: ConnectionState; printerCount?: number }) => {
      const nextState = data?.state || (data?.status as ConnectionState);
      if (nextState) {
        setConnectionState(nextState);
        if (nextState === 'OFFLINE' || nextState === 'NOT_INSTALLED' || nextState === 'ERROR') {
          setIsConnectorOnline(false);
          setActivePrinter(EMPTY_PRINTER);
          setPrinters([]);
        } else if (nextState === 'READY' || nextState === 'CONNECTED' || nextState === 'HOST_RUNNING') {
          setIsConnectorOnline(true);
        }
      }
    };

    const handleHardwareScanStarted = () => {
      setConnectionState('SCANNING');
    };

    const handleHardwareScanCompleted = (_data: { count: number }) => {
      setConnectionState('READY');
    };

    const handlePrinterNotification = (data: { type?: 'info' | 'success' | 'warning' | 'error'; title?: string; message?: string }) => {
      if (data?.title) {
        addNotification({
          type: data.type || 'info',
          title: data.title,
          message: data.message || ''
        });
      }
    };

    const handleConnectorPaired = (data: any) => {
      setIsConnectorOnline(true);
      setConnectionState('CONNECTED');
      if (data?.storeName) {
        addNotification({
          type: 'success',
          title: 'Connector Paired',
          message: `Connector paired successfully with ${data.storeName}.`
        });
      }
    };

    const handleHeartbeat = (data: any) => {
      setIsConnectorOnline(true);
      const count = data?.printerCount ?? data?.physicalPrinterCount ?? 0;
      if (data?.state) {
        setConnectionState(data.state as ConnectionState);
      } else {
        setConnectionState(count > 0 ? 'READY' : 'CONNECTED');
      }
      setHostInfo((prev: any) => ({
        ...prev,
        lastHeartbeat: data?.timestamp,
        authenticated: data?.authenticated,
        socketConnected: data?.socketConnected,
        printerCount: count
      }));
      if (Array.isArray(data?.printers) || Array.isArray(data?.physicalPrinters)) {
        const raw = Array.isArray(data?.printers) ? data.printers : data.physicalPrinters;
        handlePrinterSynced({ count: raw.length, printers: raw });
      }
    };

    socket.on('printer_synced', handlePrinterSynced);
    socket.on('printers_updated', handlePrinterSynced);
    socket.on('printer_status_changed', handlePrinterSynced);
    socket.on('connector_connected', handleConnectorConnected);
    socket.on('connector_authenticated', handleConnectorAuthenticated);
    socket.on('connector_paired', handleConnectorPaired);
    socket.on('connector_heartbeat', handleHeartbeat);
    socket.on('heartbeat', handleHeartbeat);
    socket.on('connector_disconnected', handleConnectorDisconnected);
    socket.on('connector_reconnecting', handleConnectorReconnecting);
    socket.on('connector_status', handleConnectorStatus);
    socket.on('hardware_scan_started', handleHardwareScanStarted);
    socket.on('hardware_scan_completed', handleHardwareScanCompleted);
    socket.on('printer_notification', handlePrinterNotification);
    socket.on('notification', handlePrinterNotification);
    socket.on('toast', handlePrinterNotification);

    return () => {
      socket.off('printer_synced', handlePrinterSynced);
      socket.off('printers_updated', handlePrinterSynced);
      socket.off('printer_status_changed', handlePrinterSynced);
      socket.off('connector_connected', handleConnectorConnected);
      socket.off('connector_authenticated', handleConnectorAuthenticated);
      socket.off('connector_paired', handleConnectorPaired);
      socket.off('connector_heartbeat', handleHeartbeat);
      socket.off('heartbeat', handleHeartbeat);
      socket.off('connector_disconnected', handleConnectorDisconnected);
      socket.off('connector_reconnecting', handleConnectorReconnecting);
      socket.off('connector_status', handleConnectorStatus);
      socket.off('hardware_scan_started', handleHardwareScanStarted);
      socket.off('hardware_scan_completed', handleHardwareScanCompleted);
      socket.off('printer_notification', handlePrinterNotification);
      socket.off('notification', handlePrinterNotification);
      socket.off('toast', handlePrinterNotification);
    };
  }, [addNotification]);

  const triggerMockEvent = useCallback(
    (
      eventType: 'paper_low' | 'ink_low' | 'paper_jam' | 'offline' | 'online'
    ) => {
      if (eventType === 'paper_low') {
        setActivePrinter((p) => ({ ...p, paperLevel: 12, status: 'Warning' }));
        addNotification({
          type: 'warning',
          title: 'Paper Low',
          message: 'Tray 1 has only ~12% paper remaining. Please reload A4 sheets soon.'
        });
      } else if (eventType === 'ink_low') {
        setActivePrinter((p) => ({
          ...p,
          inkLevels: { ...p.inkLevels, black: 8 },
          status: 'Warning'
        }));
        addNotification({
          type: 'warning',
          title: 'Paper Low',
          message: 'Black toner cartridge is at 8% capacity. Replace cartridge soon.'
        });
      } else if (eventType === 'paper_jam') {
        setActivePrinter((p) => ({ ...p, status: 'Error' }));
        addNotification({
          type: 'error',
          title: 'Queue Error',
          message: 'Paper jam detected in feed roller. Spooler paused.'
        });
      } else if (eventType === 'offline') {
        setActivePrinter((p) => ({ ...p, status: 'Offline' }));
        addNotification({
          type: 'error',
          title: 'Printer Offline',
          message: 'Physical printer hardware communication lost.'
        });
      } else if (eventType === 'online') {
        setActivePrinter((p) => ({
          ...p,
          status: 'Online',
          paperLevel: 90,
          inkLevels: { black: 85 }
        }));
        addNotification({
          type: 'success',
          title: 'Connector Online',
          message: 'Hardware communication restored. Spooler is ready.'
        });
      }
    },
    [addNotification]
  );

  const restartSpooler = async () => {
    if (!activePrinter.id) return;
    await printerService.restartPrinter(activePrinter.id);
    triggerMockEvent('online');
  };

  const checkHost = useCallback(async () => {
    try {
      const status = await printerService.getConnectorStatus();
      if (status) {
        setIsConnectorOnline(status.isOnline);
        setConnectionState(status.state as ConnectionState);
      }
    } catch {
      setIsConnectorOnline(false);
      setConnectionState('OFFLINE');
    }
  }, []);

  return {
    connectionState,
    isConnectorOnline,
    hostInfo,
    printers,
    activePrinter,
    setActivePrinter,
    notifications,
    addNotification,
    dismissNotification,
    triggerMockEvent,
    restartSpooler,
    checkHost
  };
};

export default usePrinterMonitoring;
