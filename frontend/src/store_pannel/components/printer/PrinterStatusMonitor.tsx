import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  FileText,
  Droplet,
  X
} from 'lucide-react';

import { DetectedPrinter } from '../../types/printerSetup.types';

interface PrinterStatusMonitorProps {
  printer: DetectedPrinter;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenWizard: () => void;
  onRunTestPrint: () => void;
  onRestartSpooler: () => void;
  onTriggerEvent?: (event: 'paper_low' | 'ink_low' | 'paper_jam' | 'offline' | 'online') => void;
}

export const PrinterStatusMonitor: React.FC<PrinterStatusMonitorProps> = ({
  printer,
  isPaused,
  onTogglePause,
  onOpenWizard,
  onRunTestPrint,
  onRestartSpooler,
  onTriggerEvent
}) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);

  const getStatusColor = () => {
    if (isPaused) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Spooler Paused' };
    if (printer.status === 'Online') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500 animate-pulse', label: 'Online & Ready' };
    if (printer.status === 'Printing') return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500 animate-spin', label: 'Printing Job' };
    if (printer.status === 'Warning') return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Warning (Low Stock)' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', label: 'Offline / Error' };
  };

  const status = getStatusColor();

  const handleTestPrint = async () => {
    setIsTesting(true);
    await onRunTestPrint();
    setIsTesting(false);
    setTestPrintSuccess(true);
    setTimeout(() => setTestPrintSuccess(false), 3000);
  };

  return (
    <>
      {/* Dashboard Status Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full group hover:border-purple-300 transition-all">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 tracking-tight">
                  Hardware Status
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  {printer.port || printer.ipAddress || 'USB001'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform hover:scale-105 cursor-pointer ${status.bg} ${status.text} ${status.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span>{status.label}</span>
            </button>
          </div>

          {/* Center Graphic & Telemetry */}
          <div className="py-4 flex flex-col items-center justify-center text-center">
            {/* SVG Printer Graphic */}
            <div className="w-28 h-20 relative flex items-center justify-center mb-2">
              <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <ellipse cx="80" cy="110" rx="65" ry="8" fill="#E2E8F0" />
                <rect x="20" y="50" width="120" height="55" rx="12" fill="#1E293B" />
                <rect x="35" y="15" width="90" height="40" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
                <rect x="42" y="70" width="76" height="8" rx="4" fill="#0EA5E9" />
                <circle cx="125" cy="65" r="4" fill={printer.status === 'Online' ? '#10B981' : '#EF4444'} />
                <rect x="38" y="90" width="84" height="22" rx="4" fill="#F1F5F9" />
              </svg>
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm">
              {printer.name}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {printer.model} • {printer.connection}
            </p>
          </div>

          {/* Paper & Ink Gauges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {/* Paper Level */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                  Paper
                </span>
                <span className="font-mono font-extrabold text-slate-800">
                  {printer.paperLevel}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    printer.paperLevel > 30 ? 'bg-purple-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${printer.paperLevel}%` }}
                />
              </div>
            </div>

            {/* Ink / Toner Level */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-cyan-600" />
                  Toner
                </span>
                <span className="font-mono font-extrabold text-slate-800">
                  {printer.inkLevels.black}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    printer.inkLevels.black > 25 ? 'bg-cyan-600' : 'bg-rose-500'
                  }`}
                  style={{ width: `${printer.inkLevels.black}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isPaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-emerald-700" /> : <Pause className="w-3.5 h-3.5 fill-slate-700" />}
            <span>{isPaused ? 'Resume Spooler' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDetailsModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
            title="Printer Diagnostics & Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Details & Diagnostics Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 z-10 text-xs overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {printer.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Serial: {printer.serialNumber} • Firmware: {printer.firmwareVersion}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Alert Pill */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${status.bg} ${status.border}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                  <span className={`font-extrabold ${status.text}`}>{status.label}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Port: {printer.port || printer.ipAddress || 'USB001'}
                </span>
              </div>

              {/* Hardware Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestPrint}
                  className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl font-bold text-purple-800 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{testPrintSuccess ? 'Test Print Sent!' : 'Print Test Page'}</span>
                </button>

                <button
                  type="button"
                  onClick={onRestartSpooler}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restart Spooler</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    onOpenWizard();
                  }}
                  className="col-span-2 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Launch Printer Setup Wizard</span>
                </button>
              </div>

              {/* Simulation Sandbox for Testing Status Scenarios */}
              {onTriggerEvent && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    🧪 Hardware Event Simulation (Development Demo)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTriggerEvent('online')}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Set Online
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerEvent('paper_low')}
                      className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      Trigger Paper Low
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerEvent('ink_low')}
                      className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      Trigger Ink Low
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerEvent('paper_jam')}
                      className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors"
                    >
                      Trigger Paper Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerEvent('offline')}
                      className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors"
                    >
                      Set Offline
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
