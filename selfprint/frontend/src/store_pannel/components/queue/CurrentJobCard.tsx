import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { QueueJobItem } from '../../types/queue.types';

interface CurrentJobCardProps {
  currentJob: QueueJobItem | null;
  onViewDetails: (job: QueueJobItem) => void;
}

export const CurrentJobCard: React.FC<CurrentJobCardProps> = ({
  currentJob,
  onViewDetails
}) => {
  if (!currentJob) {
    return (
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
          Current Job
        </h2>
        <div className="py-8 text-center text-slate-400 text-xs">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <span>No active print job</span>
        </div>
      </div>
    );
  }

  const currentPage = currentJob.currentPrintingPage || 1;
  const totalPages = currentJob.pages;
  const progressPercent =
    currentJob.progressPercent || Math.round((currentPage / totalPages) * 100);

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
          Current Job
        </h2>

        {/* Job Title & Status */}
        <div className="flex items-center justify-between pt-4">
          <h3 className="text-base font-bold text-indigo-600">
            Job {currentJob.jobCode}
          </h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Printing
          </span>
        </div>

        {/* File Name Row with Red PDF Icon */}
        <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-extrabold text-rose-600 tracking-tighter">
              PDF
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate" title={currentJob.fileName}>
              {currentJob.fileName}
            </p>
            <p className="text-[11px] text-slate-400">{currentJob.fileSize}</p>
          </div>
        </div>

        {/* Meta Specs Grid */}
        <div className="space-y-2.5 pt-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Pages</span>
            <span className="text-slate-800 font-bold">{currentJob.pages}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Copies</span>
            <span className="text-slate-800 font-bold">{currentJob.copies}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Type</span>
            <span className="text-slate-800 font-bold">{currentJob.colorMode}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Started At</span>
            <span className="text-slate-800 font-bold">{currentJob.uploadTime}</span>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="text-slate-700 font-semibold">
              {currentPage} / {totalPages} pages
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium font-mono">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* View Job Details Button */}
      <button
        onClick={() => onViewDetails(currentJob)}
        className="w-full mt-4 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <Eye className="w-3.5 h-3.5 text-slate-500" />
        <span>View Job Details</span>
      </button>
    </div>
  );
};
