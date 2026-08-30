import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Gauge, Wrench } from 'lucide-react';
import { CALIBRATION_STEPS } from '../../data/printer.mock';

interface PrinterCalibrationProps {
  progress: number;
  currentStepIndex: number;
  printerName: string;
}

export const PrinterCalibration: React.FC<PrinterCalibrationProps> = ({
  progress,
  currentStepIndex,
  printerName
}) => {
  return (
    <div className="py-6 px-4 max-w-lg mx-auto space-y-6 text-center">
      {/* Top Animated Diagnostic Gauge */}
      <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center shadow-sm relative">
        <Gauge className="w-8 h-8 stroke-[1.75]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md"
        >
          <Wrench className="w-2.5 h-2.5" />
        </motion.div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Calibrating & Diagnosing Printer
        </h3>
        <p className="text-xs text-slate-500">
          Running diagnostic checks on <strong className="text-slate-800">{printerName}</strong>...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 text-left">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
          <span>Self-Calibration Progress</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* 6 Step Diagnostic Checklist */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5">
        {CALIBRATION_STEPS.map((step) => {
          const isPassed = step.id <= currentStepIndex;
          const isCurrent = step.id === currentStepIndex + 1;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-white border border-purple-200 shadow-2xs'
                  : isPassed
                  ? 'bg-emerald-50/40'
                  : 'opacity-50'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>

              <div className="min-w-0 text-xs">
                <p
                  className={`font-bold ${
                    isPassed
                      ? 'text-slate-900'
                      : isCurrent
                      ? 'text-purple-900'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
