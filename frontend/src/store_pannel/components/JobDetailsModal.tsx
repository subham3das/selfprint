import React from 'react';
import { X, Printer, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobItem } from '../types/dashboard.types';

interface JobDetailsModalProps {
  job: JobItem | null;
  onClose: () => void;
  onReprint?: (job: JobItem) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onReprint
}) => {
  if (!job) return null;

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
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {job.jobCode}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Job Details
                </h3>
                <p className="text-xs text-slate-500">
                  Received at {job.time} ({job.timeAgo})
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
          <div className="p-6 space-y-5">
            {/* File Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-xs text-rose-600">
                  PDF
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {job.fileName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {job.fileSize || '3.2 MB'} &bull; {job.pages} pages &bull; {job.copies} copy
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  job.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : job.status === 'Printing'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    : job.status === 'Waiting'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}
              >
                {job.status}
              </span>
            </div>

            {/* Print Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Color Option</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  {job.colorMode === 'B&W' ? (
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-indigo-500" />
                  )}
                  {job.colorMode}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Customer Type</span>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {job.customer}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Total Bill</span>
                <p className="font-bold text-emerald-600 text-sm">
                  ₹{job.cost.toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
                <span className="text-slate-400 font-medium">Target Device</span>
                <p className="font-bold text-slate-800 text-sm">
                  HP LaserJet 1020
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onReprint?.(job);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Send to Printer</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
