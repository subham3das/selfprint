import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Sparkles } from 'lucide-react';

interface PrintProgressCardProps {
  fileName: string;
  currentPage: number;
  totalPages: number;
  currentCopy: number;
  totalCopies: number;
  percent: number;
  secondsRemaining: number;
}

export const PrintProgressCard: React.FC<PrintProgressCardProps> = ({
  fileName,
  currentPage,
  totalPages,
  currentCopy,
  totalCopies,
  percent,
  secondsRemaining
}) => {
  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4 select-none">
      {/* File & Status Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {fileName}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Copy {currentCopy} of {totalCopies} &bull; {totalPages} pages per copy
            </p>
          </div>
        </div>

        {/* Live Page Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/80 shrink-0 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Page {currentPage}/{totalPages}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Printing Page {currentPage} of {totalPages}
          </span>
          <span className="font-bold text-indigo-600 font-mono">
            {Math.round(percent)}%
          </span>
        </div>

        {/* Bar Track */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-xs relative"
          >
            {/* Shimmer light overlay */}
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Footer Info Row: Estimated Time Countdown */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-medium border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Estimated Time Remaining</span>
        </div>
        <span className="font-bold text-slate-900 font-mono">
          {secondsRemaining > 0 ? `~${secondsRemaining}s` : 'Finishing...'}
        </span>
      </div>
    </div>
  );
};
