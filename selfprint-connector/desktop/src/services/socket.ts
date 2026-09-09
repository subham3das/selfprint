import { io, Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';

let socket: Socket | null = null;

export function initDesktopSocket(url = 'http://localhost:3000'): Socket {
  if (socket) return socket;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    autoConnect: true
  });

  const { addNotification, addActivity, setConnectionStatus, showToast } = useAppStore.getState();

  socket.on('connect', () => {
    setConnectionStatus(true, true);
    addActivity({
      type: 'CONNECTOR_STARTED',
      title: 'Cloud Bridge Connected',
      description: 'WebSocket gateway connected with SelfPrint backend.'
    });
  });

  socket.on('disconnect', () => {
    setConnectionStatus(true, false);
    addNotification({
      title: 'Backend Disconnected',
      message: 'Cloud connection dropped. Auto-reconnecting in background...',
      severity: 'warning',
      source: 'BACKEND'
    });
  });

  // Printer Events
  socket.on('printer_added', (data: any) => {
    const name = data?.printer?.name || 'Printer';
    addNotification({
      title: 'Printer Connected',
      message: `Detected new hardware printer: ${name}`,
      severity: 'info',
      source: 'PRINTER'
    });
    addActivity({
      type: 'PRINTER_CONNECTED',
      title: 'Printer Added',
      description: `New printer discovered: ${name}`
    });
  });

  socket.on('printer_removed', (data: any) => {
    const name = data?.printerName || 'Printer';
    addNotification({
      title: 'Printer Disconnected',
      message: `Printer was unplugged or removed: ${name}`,
      severity: 'warning',
      source: 'PRINTER'
    });
    addActivity({
      type: 'PRINTER_REMOVED',
      title: 'Printer Removed',
      description: `Hardware device removed: ${name}`
    });
  });

  socket.on('printer_offline', (data: any) => {
    const name = data?.printerName || 'Printer';
    addNotification({
      title: 'Printer Offline',
      message: `${name} is currently offline or unreachable.`,
      severity: 'error',
      source: 'PRINTER'
    });
  });

  socket.on('printer_online', (data: any) => {
    const name = data?.printerName || 'Printer';
    addNotification({
      title: 'Printer Ready',
      message: `${name} is back online and ready to print.`,
      severity: 'success',
      source: 'PRINTER'
    });
  });

  // Print Job Lifecycle Events
  socket.on('job_status_update', (data: any) => {
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

  // Backend Direct Push Notifications
  socket.on('notification', (data: any) => {
    addNotification({
      title: data.title || 'Notification',
      message: data.message || '',
      severity: data.severity || 'info',
      source: 'BACKEND'
    });
  });

  socket.on('update_available', (data: any) => {
    addNotification({
      title: 'New Connector Version Available',
      message: `Version v${data.latestVersion} is available for update.`,
      severity: 'info',
      source: 'CONNECTOR'
    });
    showToast('Update Available', `New version v${data.latestVersion} ready to install.`, 'info');
  });

  return socket;
}
