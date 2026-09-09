import React from 'react';
import { motion } from 'framer-motion';

interface PrinterIllustrationProps {
  isPrinting: boolean;
  currentPage: number;
  totalPages: number;
}

export const PrinterIllustration: React.FC<PrinterIllustrationProps> = ({
  isPrinting,
  currentPage,
  totalPages
}) => {
  return (
    <div className="relative w-full max-w-[280px] h-[190px] mx-auto flex items-center justify-center select-none">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Printer Machine Construction */}
      <div className="relative w-56 h-36 flex flex-col items-center">
        {/* Top Paper In-Tray */}
        <div className="w-28 h-7 bg-slate-200 rounded-t-xl border border-slate-300 flex items-center justify-center relative overflow-hidden shadow-inner">
          <div className="w-24 h-5 bg-white rounded-t-md shadow-xs border border-slate-200" />
        </div>

        {/* Printer Main Chassis */}
        <div className="relative w-56 h-24 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 p-3 flex flex-col justify-between z-10">
          {/* Top Panel with Power LED & Screen */}
          <div className="flex items-center justify-between">
            {/* Brand / Logo */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
              <span className="text-[10px] font-mono text-slate-300 font-bold tracking-wider">
                HP LASERJET
              </span>
            </div>

            {/* LCD Screen Display */}
            <div className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700/60 flex items-center gap-1 font-mono text-[9px] text-emerald-400">
              {isPrinting ? (
                <>
                  <span className="animate-spin text-[8px]">&bull;</span>
                  <span>PRINTING {currentPage}/{totalPages}</span>
                </>
              ) : (
                <span>READY</span>
              )}
            </div>
          </div>

          {/* Paper Output Slot */}
          <div className="relative w-full h-3 bg-slate-950 rounded-lg border border-slate-700/80 flex items-center justify-center overflow-visible">
            {/* Paper Extruding Sheet */}
            {isPrinting && (
              <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{
                  y: [0, 16, 28, 16, 0],
                  opacity: [0.8, 1, 1, 1, 0.8]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut'
                }}
                className="absolute top-2 w-32 h-14 bg-white rounded-md shadow-lg border border-slate-200 p-1.5 flex flex-col justify-between pointer-events-none z-20"
              >
                {/* Simulated text lines on paper */}
                <div className="space-y-1">
                  <div className="w-3/4 h-1 bg-slate-300 rounded-full" />
                  <div className="w-full h-1 bg-slate-200 rounded-full" />
                  <div className="w-5/6 h-1 bg-slate-200 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[8px] font-mono text-indigo-600 font-bold">
                  <span>SELF PRINT</span>
                  <span>p.{currentPage}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Tray Accent */}
          <div className="flex items-center justify-between text-[8px] text-slate-400">
            <span className="font-mono">Tray 1: A4</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            </div>
          </div>
        </div>

        {/* Bottom Output Tray Catch */}
        <div className="w-48 h-6 bg-slate-300/80 rounded-b-xl border-b border-x border-slate-400 -mt-1 shadow-md flex items-center justify-center">
          <div className="w-40 h-1.5 bg-slate-400/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};
