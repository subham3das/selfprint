import { io, Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';

let socket: Socket | null = null;

/**
 * initDesktopSocket
 *
 * Connects the Desktop UI to the SelfPrint Cloud Backend WebSocket.
 * NOTE: This socket is for cloud push events only (job status, notifications).
 *
 * Printer data is NEVER sourced from this socket directly.
 * On connect/reconnect the socket triggers a re-fetch of:
 *   1. GET /health  (via queryClient.invalidateQueries)
 *   2. GET /printers (via queryClient.invalidateQueries — only runs if health is online)
 *
 * On disconnect the socket immediately:
 *   - Marks backend as disconnected
 *   - Sets isSocketReconnecting = true
 *   - Clears the ['printers'] cache (no stale data shown)
 *   - Clears the ['health'] cache
 *
 * The queryClient must be passed in from App.tsx so this module can
 * trigger re-fetches without importing from React context.
 */
export function initDesktopSocket(
  queryClient: QueryClient,
  url = 'http://localhost:5000'
): Socket {
  if (socket) return socket;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: true
  });

  const store = useAppStore.getState;

  // ─── Connect ──────────────────────────────────────────────────────────────
  socket.on('connect', () => {
    const { setBackendConnected, setSocketReconnecting, addActivity, showToast } = store();

    setBackendConnected(true);
    setSocketReconnecting(false);

    addActivity({
      type: 'CONNECTOR_STARTED',
      title: 'Backend Socket Connected',
      description: 'Socket.IO gateway connected to SelfPrint backend.'
    });

    queryClient.invalidateQueries({ queryKey: ['health'] });

    showToast('Socket Connected', 'Connected to backend realtime gateway.', 'success');
  });

  // ─── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { setBackendConnected, setSocketReconnecting, addNotification, addActivity } = store();

    setBackendConnected(false);
    setSocketReconnecting(true);

    addNotification({
      title: 'Backend Socket Disconnected',
      message: 'Cloud Socket.IO connection dropped. Reconnecting...',
      severity: 'warning',
      source: 'BACKEND'
    });

    addActivity({
      type: 'CONNECTOR_STOPPED',
      title: 'Cloud Bridge Disconnected',
      description: 'WebSocket dropped. Printer cache cleared. Waiting to reconnect.'
    });
  });

  // ─── Reconnect attempt in progress ───────────────────────────────────────
  socket.io.on('reconnect_attempt', (attempt: number) => {
    const { setSocketReconnecting } = store();
    setSocketReconnecting(true);

    if (attempt === 1) {
      useAppStore.getState().showToast(
        'Reconnecting...',
        `Attempting to reconnect to SelfPrint backend (attempt ${attempt}).`,
        'warning'
      );
    }
  });

  // ─── Reconnect error / retry in progress ─────────────────────────────────────
  socket.io.on('reconnect_error', () => {
    const { setBackendConnected, setSocketReconnecting } = store();
    setBackendConnected(false);
    setSocketReconnecting(true);
  });

  // ─── Printer hardware events (pushed by cloud, trigger re-fetch) ──────────
  socket.on('printer_added', (data: any) => {
    const { addNotification, addActivity } = store();
    const name = data?.printer?.name || 'Printer';

    addNotification({
      title: 'Printer Connected',
      message: `Host Service detected new printer: ${name}`,
      severity: 'info',
      source: 'PRINTER'
    });
    addActivity({
      type: 'PRINTER_CONNECTED',
      title: 'Printer Added',
      description: `Host Service discovered: ${name}`
    });

    // Trigger re-fetch of printer list from Host Service
    queryClient.invalidateQueries({ queryKey: ['printers'] });
  });

  socket.on('printer_removed', (data: any) => {
    const { addNotification, addActivity } = store();
    const name = data?.printerName || 'Printer';

    addNotification({
      title: 'Printer Disconnected',
      message: `Printer removed from Host Service: ${name}`,
      severity: 'warning',
      source: 'PRINTER'
    });
    addActivity({
      type: 'PRINTER_REMOVED',
      title: 'Printer Removed',
      description: `Host Service lost device: ${name}`
    });

    // Refresh printer list to reflect removal
    queryClient.invalidateQueries({ queryKey: ['printers'] });
  });

  socket.on('printer_offline', (data: any) => {
    const { addNotification } = store();
    const name = data?.printerName || 'Printer';

    addNotification({
      title: 'Printer Offline',
      message: `${name} is currently offline or unreachable.`,
      severity: 'error',
      source: 'PRINTER'
    });

    queryClient.invalidateQueries({ queryKey: ['printers'] });
  });

  socket.on('printer_online', (data: any) => {
    const { addNotification } = store();
    const name = data?.printerName || 'Printer';

    addNotification({
      title: 'Printer Ready',
      message: `${name} is back online and ready to print.`,
      severity: 'success',
      source: 'PRINTER'
    });

    queryClient.invalidateQueries({ queryKey: ['printers'] });
  });

  // ─── Print Job Lifecycle ──────────────────────────────────────────────────
  socket.on('job_status_update', (data: any) => {
    const { addNotification, addActivity } = store();

    if (data.status === 'PRINTING') {
      addActivity({
        type: 'PRINTING',
        title: 'Print Job In Progress',
        description: `Printing Job #${data.jobId} on ${data.printerName}`
      });
    } else if (data.status === 'COMPLETED') {
      addNotification({
        title: 'Print Completed',
        message: `Job #${data.jobId} printed successfully on ${data.printerName}.`,
        severity: 'success',
        source: 'SPOOLER'
      });
      addActivity({
        type: 'COMPLETED',
        title: 'Print Succeeded',
        description: `Job #${data.jobId} printed on ${data.printerName}`
      });
    } else if (data.status === 'FAILED') {
      addNotification({
        title: 'Print Failed',
        message: `Job #${data.jobId} failed: ${data.error || 'Spooler error'}`,
        severity: 'error',
        source: 'SPOOLER'
      });
      addActivity({
        type: 'ERROR',
        title: 'Print Failed',
        description: `Job #${data.jobId} failed: ${data.error || 'Error'}`
      });
    }
  });

  // ─── Cloud Push Notifications ─────────────────────────────────────────────
  socket.on('notification', (data: any) => {
    store().addNotification({
      title: data.title || 'Notification',
      message: data.message || '',
      severity: data.severity || 'info',
      source: 'BACKEND'
    });
  });

  socket.on('update_available', (data: any) => {
    const { addNotification, showToast } = store();

    addNotification({
      title: 'New Connector Version Available',
      message: `Version v${data.latestVersion} is available for update.`,
      severity: 'info',
      source: 'CONNECTOR'
    });
    showToast('Update Available', `New version v${data.latestVersion} ready to install.`, 'info');
  });

  // ─── Connector Unpaired / Ownership Revoked ──────────────────────────────
  socket.on('connector_unpaired', () => {
    const { showToast, addActivity } = store();

    // Wipe cached credentials immediately
    localStorage.removeItem('selfprint_device_token');
    localStorage.removeItem('selfprint_paired_store_name');
    localStorage.removeItem('selfprint_store_id');
    localStorage.removeItem('selfprint_store_code');
    localStorage.removeItem('selfprint_owner_name');

    // Notify daemon to wipe config without stopping host service
    fetch('http://127.0.0.1:4500/unpair', { method: 'POST' }).catch(() => {});

    showToast('Connector Unpaired', 'This connector was unlinked from the Store. Returning to unpaired state.', 'warning');
    addActivity({
      type: 'CONNECTOR_STOPPED',
      title: 'Connector Unpaired',
      description: 'Store ownership revoked by Store Dashboard.'
    });

    queryClient.invalidateQueries({ queryKey: ['health'] });
    queryClient.invalidateQueries({ queryKey: ['printers'] });

    // Refresh window to display clean unpaired state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  return socket;
}
