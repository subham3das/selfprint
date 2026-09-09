import React from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

import {
  DetectedPrinter,
  PrinterSetupConfig
} from '../../types/printerSetup.types';

interface PrinterTestPageProps {
  printer: DetectedPrinter;
  config: PrinterSetupConfig;
  isTestPrinting: boolean;
  testPrintSuccess: boolean;
  onPrintTestPage: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export const PrinterTestPage: React.FC<PrinterTestPageProps> = ({
  printer,
  config,
  isTestPrinting,
  testPrintSuccess,
  onPrintTestPage,
  onComplete,
  onBack
}) => {
  return (
    <div className="py-4 px-2 space-y-6 max-w-lg mx-auto text-center text-xs">
      {/* Header */}
      <div className="space-y-1.5 pb-2 border-b border-slate-100">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Step 5: Verify Hardware Test Print
        </h3>
        <p className="text-xs text-slate-500">
          Print a sample alignment and diagnostic page on <strong className="text-slate-800">{printer.name}</strong> to ensure hardware readiness.
        </p>
      </div>

      {/* Visual Test Page Preview Sheet */}
      <div className="relative mx-auto w-48 h-64 bg-white border-2 border-slate-300 rounded-xl shadow-xl p-3 flex flex-col justify-between text-left overflow-hidden select-none">
        {/* Subtle grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:8px_8px] opacity-60 pointer-events-none" />

        {/* Top Header of Test Sheet */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-black text-[9px] text-purple-700 tracking-wider uppercase">
              Self Print Diagnostic Page
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <p className="font-bold text-[10px] text-slate-800">
            {printer.name}
          </p>
          <div className="space-y-0.5 text-[8px] font-mono text-slate-500">
            <p>Port: {printer.port || printer.ipAddress || 'USB'}</p>
            <p>Paper: {config.defaultPaper} • Quality: {config.defaultQuality}</p>
            <p>Mode: {config.defaultColorMode}</p>
          </div>
        </div>

        {/* Center Alignment Grids / Color Swatches */}
        <div className="space-y-1 relative z-10 py-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-6 h-3 bg-slate-900 rounded-xs" />
            <div className="w-6 h-3 bg-cyan-500 rounded-xs" />
            <div className="w-6 h-3 bg-pink-500 rounded-xs" />
            <div className="w-6 h-3 bg-yellow-400 rounded-xs" />
          </div>
          <div className="h-0.5 w-full bg-slate-800" />
          <div className="h-0.5 w-full bg-slate-400" />
          <div className="h-0.5 w-full bg-slate-200" />
        </div>

        {/* Bottom Verification Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[8px] font-mono text-slate-400 relative z-10">
          <span>Alignment Pass ✓</span>
          <span>SP-OK-2025</span>
        </div>

        {/* Spooling overlay */}
        {isTestPrinting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-2"
          >
            <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
            <p className="text-[10px] font-bold">Sending to printer...</p>
          </motion.div>
        )}

        {/* Success tick overlay */}
        {testPrintSuccess && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-1.5 p-2 text-center"
          >
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            <p className="text-[11px] font-extrabold">Printed Successfully!</p>
            <p className="text-[9px] text-emerald-100">Check physical output tray</p>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 max-w-sm mx-auto">
        {!testPrintSuccess ? (
          <button
            type="button"
            disabled={isTestPrinting}
            onClick={onPrintTestPage}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 disabled:opacity-60"
          >
            {isTestPrinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Spooling Test Document...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Print Test Page</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <span>Complete Setup & Enable Auto-Print</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {!testPrintSuccess && (
          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Skip test print and finish setup
          </button>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[11px] text-slate-400 font-medium">
          Step 5 of 5
        </span>
      </div>
    </div>
  );
};
