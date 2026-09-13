import { io, Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { BACKEND_URL } from '../config/api';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initDesktopSocket(
  queryClient: QueryClient,
  url = BACKEND_URL
): Socket {
  if (socket) return socket;

  const cleanUrl = url.trim().replace(/\/+$/, '');

  socket = io(cleanUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: true
  });

  const store = useAppStore.getState;

  // Connect
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

  // Disconnect
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

  // Reconnect attempt in progress
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

  // Reconnect error / retry in progress
  socket.io.on('reconnect_error', () => {
    const { setBackendConnected, setSocketReconnecting } = store();
    setBackendConnected(false);
    setSocketReconnecting(true);
  });

  // Printer hardware events
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

  // Print Job Lifecycle
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

  // Cloud Push Notifications
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

  // Connector Unpaired / Ownership Revoked
  socket.on('connector_unpaired', () => {
    const { showToast, addActivity } = store();

    localStorage.removeItem('selfprint_device_token');
    localStorage.removeItem('selfprint_paired_store_name');
    localStorage.removeItem('selfprint_store_id');
    localStorage.removeItem('selfprint_store_code');
    localStorage.removeItem('selfprint_owner_name');

    fetch('http://127.0.0.1:4500/unpair', { method: 'POST' }).catch(() => {});

    showToast('Connector Unpaired', 'This connector was unlinked from the Store. Returning to unpaired state.', 'warning');
    addActivity({
      type: 'CONNECTOR_STOPPED',
      title: 'Connector Unpaired',
      description: 'Store ownership revoked by Store Dashboard.'
    });

    queryClient.invalidateQueries({ queryKey: ['health'] });
    queryClient.invalidateQueries({ queryKey: ['printers'] });

    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  // Store Blocked by Administrator
  socket.on('store_blocked', (data: any) => {
    const { showToast, addNotification, addActivity } = store();

    localStorage.removeItem('selfprint_device_token');
    localStorage.removeItem('selfprint_saved_auth');
    localStorage.removeItem('selfprint_paired_store_name');

    fetch('http://127.0.0.1:4500/unpair', { method: 'POST' }).catch(() => {});

    const msg = data?.message || 'Store blocked by administrator.';
    showToast('Store Blocked', msg, 'error');
    addNotification({
      title: 'Store Blocked',
      message: msg,
      severity: 'error',
      source: 'BACKEND'
    });
    addActivity({
      type: 'ERROR',
      title: 'Store Blocked',
      description: `Store blocked by administrator: ${data?.reason || 'Access revoked'}`
    });

    queryClient.invalidateQueries({ queryKey: ['health'] });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  // Store Deleted by Administrator
  socket.on('store_deleted', (data: any) => {
    const { showToast, addNotification, addActivity } = store();

    localStorage.removeItem('selfprint_device_token');
    localStorage.removeItem('selfprint_saved_auth');
    localStorage.removeItem('selfprint_paired_store_name');
    localStorage.removeItem('selfprint_store_id');

    fetch('http://127.0.0.1:4500/unpair', { method: 'POST' }).catch(() => {});

    const msg = data?.message || 'This store has been deleted by the administrator.';
    showToast('Store Deleted', msg, 'error');
    addNotification({
      title: 'Store Deleted',
      message: msg,
      severity: 'error',
      source: 'BACKEND'
    });
    addActivity({
      type: 'CONNECTOR_STOPPED',
      title: 'Store Deleted',
      description: 'Store was deleted from platform by administrator.'
    });

    queryClient.invalidateQueries({ queryKey: ['health'] });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  // Force Logout
  socket.on('force_logout', () => {
    localStorage.removeItem('selfprint_saved_auth');
    localStorage.removeItem('selfprint_store_token');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });

  return socket;
}
