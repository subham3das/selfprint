import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Radio, Search } from 'lucide-react';

interface PrinterScannerProps {
  progress: number;
  message: string;
}

export const PrinterScanner: React.FC<PrinterScannerProps> = ({
  progress,
  message
}) => {
  return (
    <div className="py-8 px-4 text-center space-y-6 max-w-md mx-auto">
      {/* Radar Scanner Animation */}
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        {/* Outer Pulsing Rings */}
        <motion.div
          animate={{ scale: [1, 1.4, 1.8], opacity: [0.6, 0.3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-purple-500/40 bg-purple-500/5"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1.5], opacity: [0.8, 0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: 'easeOut' }}
          className="absolute inset-2 rounded-full border border-indigo-400/40 bg-indigo-500/5"
        />

        {/* Center Hardware Icon Box */}
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/30">
          <Printer className="w-10 h-10 stroke-[1.75]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center shadow-md border border-purple-100"
          >
            <Radio className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-xs font-bold text-purple-800">
          <Search className="w-3.5 h-3.5 animate-pulse" />
          <span>Searching Ports & Local Network</span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900">
          Detecting Connected Printers
        </h3>

        <p className="text-xs text-slate-500 font-mono h-5 flex items-center justify-center transition-all">
          {message}
        </p>
      </div>

      {/* Live Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 rounded-full"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
          <span>Scanning Drivers</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Helpful Hint */}
      <p className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
        💡 <strong className="text-slate-700">Tip:</strong> Make sure your printer is turned on and connected via USB cable or Wi-Fi network.
      </p>
    </div>
  );
};
