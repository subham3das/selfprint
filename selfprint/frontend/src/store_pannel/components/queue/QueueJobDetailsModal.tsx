import React from 'react';
import {
  X,
  Play,
  Check,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
  Phone,
  User,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueJobItem, QueueJobStatus } from '../../types/queue.types';

interface QueueJobDetailsModalProps {
  job: QueueJobItem | null;
  onClose: () => void;
  onStatusChange: (jobId: string, status: QueueJobStatus) => void;
}

export const QueueJobDetailsModal: React.FC<QueueJobDetailsModalProps> = ({
  job,
  onClose,
  onStatusChange
}) => {
  if (!job) return null;

  const timelineSteps: { key: QueueJobStatus; label: string }[] = [
    { key: 'Waiting', label: 'Waiting in Queue' },
    { key: 'Printing', label: 'Printing' },
    { key: 'Completed', label: 'Completed' }
  ];

  const getStepIndex = (status: QueueJobStatus) => {
    switch (status) {
      case 'Waiting':
        return 0;
      case 'Printing':
        return 1;
      case 'Completed':
        return 2;
      case 'Failed':
      case 'Cancelled':
        return 1;
    }
  };

  const currentIndex = getStepIndex(job.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center">
                {job.jobCode}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Job Metadata &amp; Timeline
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {job.fullJobId}
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
            {/* Status Timeline */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Job Progress Lifecycle
              </span>

              <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-slate-200 z-0" />

                {timelineSteps.map((step, idx) => {
                  const isDone = currentIndex >= idx && job.status !== 'Failed' && job.status !== 'Cancelled';
                  const isCurrent = currentIndex === idx;
                  const isTerminalFail = (job.status === 'Failed' || job.status === 'Cancelled') && idx === 1;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10 text-center"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isTerminalFail
                            ? 'bg-rose-500 text-white shadow-sm'
                            : isDone
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-1.5 ${
                          isCurrent ? 'text-indigo-600' : 'text-slate-600'
                        }`}
                      >
                        {isTerminalFail ? job.status : step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Metadata Box */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {job.fileName}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    job.status === 'Printing'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : job.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : job.status === 'Waiting'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {/* Grid of specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Customer</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    {job.customerName}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Phone</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {job.customerPhone || 'N/A'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Pages / Copies</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Layers className="w-3 h-3 text-slate-400" />
                    {job.pages} p &bull; {job.copies} cp
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Color / Size</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {job.colorMode} &bull; {job.paperSize}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Price</span>
                  <span className="font-bold text-emerald-600 block mt-0.5">
                    ₹{job.estimatedPrice.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Payment</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <CreditCard className="w-3 h-3 text-emerald-600" />
                    {job.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Times */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Uploaded: <strong>{job.uploadTime}</strong> ({job.timeAgo})
              </span>
              {job.estimatedFinishTime && (
                <span>
                  Est. Finish: <strong>{job.estimatedFinishTime}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Footer Status Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-t border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-1.5">
              {job.status === 'Waiting' && (
                <button
                  onClick={() => {
                    onStatusChange(job.id, 'Printing');
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Printing</span>
                </button>
              )}

              {job.status === 'Printing' && (
                <button
                  onClick={() => {
                    onStatusChange(job.id, 'Completed');
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}

              {(job.status === 'Failed' || job.status === 'Completed') && (
                <button
                  onClick={() => {
                    onStatusChange(job.id, 'Waiting');
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Print Again</span>
                </button>
              )}

              {job.status === 'Waiting' && (
                <button
                  onClick={() => {
                    onStatusChange(job.id, 'Cancelled');
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
