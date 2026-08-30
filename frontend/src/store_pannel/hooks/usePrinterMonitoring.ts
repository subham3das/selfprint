import { useState, useCallback } from 'react';
import {
  DetectedPrinter,
  PrinterNotificationItem
} from '../types/printerSetup.types';

import { MOCK_DETECTED_PRINTERS } from '../data/printer.mock';
import { printerService } from '../services/printer.service';

export const usePrinterMonitoring = () => {
  const [activePrinter, setActivePrinter] = useState<DetectedPrinter>(() => {
    return (
      printerService.getSavedPrinter() || MOCK_DETECTED_PRINTERS[0]
    );
  });

  const [notifications, setNotifications] = useState<PrinterNotificationItem[]>([
    {
      id: 'notif-init-ready',
      type: 'success',
      title: 'Printer Ready',
      message: `${activePrinter.name} is connected and ready for auto-printing.`,
      timestamp: 'Just now'
    }
  ]);

  const addNotification = useCallback(
    (item: Omit<PrinterNotificationItem, 'id' | 'timestamp'>) => {
      const newNotif: PrinterNotificationItem = {
        ...item,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: 'Just now'
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const triggerMockEvent = useCallback(
    (
      eventType: 'paper_low' | 'ink_low' | 'paper_jam' | 'offline' | 'online'
    ) => {
      if (eventType === 'paper_low') {
        setActivePrinter((p) => ({ ...p, paperLevel: 12, status: 'Warning' }));
        addNotification({
          type: 'warning',
          title: 'Paper Running Low',
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
          title: 'Toner Level Low',
          message: 'Black toner cartridge is at 8% capacity. Replace cartridge soon.'
        });
      } else if (eventType === 'paper_jam') {
        setActivePrinter((p) => ({ ...p, status: 'Error' }));
        addNotification({
          type: 'error',
          title: 'Paper Jam Detected',
          message: 'A sheet appears to be stuck inside the feeder tray. Please clear the jam.'
        });
      } else if (eventType === 'offline') {
        setActivePrinter((p) => ({ ...p, status: 'Offline' }));
        addNotification({
          type: 'error',
          title: 'Printer Disconnected',
          message: 'Printer communication lost. Check USB cable or power supply.'
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
          title: 'Printer Reconnected',
          message: 'Hardware communication restored. Spooler is ready.'
        });
      }
    },
    [addNotification]
  );

  const restartSpooler = async () => {
    await printerService.restartPrinter(activePrinter.id);
    triggerMockEvent('online');
  };

  return {
    activePrinter,
    setActivePrinter,
    notifications,
    addNotification,
    dismissNotification,
    triggerMockEvent,
    restartSpooler
  };
};
