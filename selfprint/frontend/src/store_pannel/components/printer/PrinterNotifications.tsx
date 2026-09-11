import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { PrinterNotificationItem } from '../../types/printerSetup.types';

interface PrinterNotificationsProps {
  notifications: PrinterNotificationItem[];
  onDismiss: (id: string) => void;
}

export const PrinterNotifications: React.FC<PrinterNotificationsProps> = ({
  notifications,
  onDismiss
}) => {
  // Auto-dismiss each notification after 5 seconds to prevent toast accumulation (Requirement 4)
  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      setTimeout(() => {
        onDismiss(n.id);
      }, 5000)
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const isError = notif.type === 'error';
          const isWarning = notif.type === 'warning';
          const isSuccess = notif.type === 'success';

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl backdrop-blur-md flex items-start gap-3 text-xs ${
                isError
                  ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-900/20'
                  : isWarning
                  ? 'bg-amber-900/95 text-white border-amber-700 shadow-amber-900/20'
                  : isSuccess
                  ? 'bg-slate-900/95 text-white border-slate-700 shadow-slate-900/20'
                  : 'bg-slate-900/95 text-white border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-extrabold text-xs tracking-tight">
                  {notif.title}
                </p>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {notif.message}
                </p>
                <span className="text-[9px] text-slate-400 font-mono block pt-0.5">
                  {notif.timestamp}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(notif.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
