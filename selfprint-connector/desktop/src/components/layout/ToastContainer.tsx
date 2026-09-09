import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NotificationSeverity } from '../../types';

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  const iconMap: Record<NotificationSeverity, React.ReactNode> = {
    info: <Info className="w-4 h-4 text-blue-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />
  };

  const borderMap: Record<NotificationSeverity, string> = {
    info: 'border-blue-500/30',
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border ${borderMap[toast.severity]} shadow-2xl text-slate-100`}
          >
            <div className="mt-0.5">{iconMap[toast.severity]}</div>
            <div className="flex-1 pr-2">
              <h5 className="text-xs font-semibold text-slate-100">{toast.title}</h5>
              <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
