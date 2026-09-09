import React, { useState } from 'react';
import {
  X,
  Settings,
  Printer,
  CheckCircle2,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrinterStatusInfo } from '../types/dashboard.types';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: PrinterStatusInfo;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const PrinterSettingsModal: React.FC<PrinterSettingsModalProps> = ({
  isOpen,
  onClose,
  printer,
  isPaused,
  onTogglePause
}) => {
  const [paperSize, setPaperSize] = useState(printer.paperSize);
  const [colorDefault, setColorDefault] = useState<'B&W' | 'Color'>('B&W');
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestPrint = () => {
    setTestPrintSuccess(true);
    setTimeout(() => setTestPrintSuccess(false), 3000);
  };

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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Printer Configuration
                </h3>
                <p className="text-xs text-slate-500">{printer.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <div className="p-6 space-y-4 text-xs">
            {/* Status & Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  Printer Queue Status
                </span>
                <span className="text-slate-500">
                  {isPaused
                    ? 'Queue is paused. New jobs will wait.'
                    : 'Queue is actively printing incoming jobs.'}
                </span>
              </div>
              <button
                onClick={onTogglePause}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                  isPaused
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </div>

            {/* Paper Size Setting */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Default Paper Tray Size</label>
              <div className="grid grid-cols-3 gap-2">
                {['A4', 'Letter', 'Legal'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                      paperSize === size
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Color Profile */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Default Printing Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {(['B&W', 'Color'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setColorDefault(mode)}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                      colorDefault === mode
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'B&W' ? 'Monochrome (B&W)' : 'Color Print'}
                  </button>
                ))}
              </div>
            </div>

            {/* IP Address */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Hardware Network IP</label>
              <input
                type="text"
                readOnly
                value={printer.ipAddress || '192.168.1.145'}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
              />
            </div>

            {/* Test Print Feedback */}
            {testPrintSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Test page sent successfully to {printer.name}!</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleTestPrint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Test Page</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
