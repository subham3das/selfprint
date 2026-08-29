import React from 'react';
import { X, Info, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutStoreModal: React.FC<AboutStoreModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  About Self Print
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Store ID &amp; software license telemetry
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  Active Station ID
                </span>
                <p className="text-xl font-bold text-slate-900 font-mono">
                  SP10239
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Application Version</span>
                <span className="font-bold text-slate-800 font-mono">v1.0.0 (Build 2026.08.29)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Spooler Protocol</span>
                <span className="font-medium text-slate-800">Direct RAW IPP / WebSocket Relay</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Registration Date</span>
                <span className="font-medium text-slate-800">15 January 2024</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>License Status</span>
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enterprise Store License
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Cloud Relay Status</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Connected (Latency 12ms)
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
