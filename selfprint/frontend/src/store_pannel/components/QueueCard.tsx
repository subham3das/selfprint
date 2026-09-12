import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  MoreVertical,
  Check,
  ArrowRight,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { JobItem, QueueTab } from '../types/dashboard.types';

interface QueueCardProps {
  jobs: JobItem[];
  selectedTab: QueueTab;
  onTabChange: (tab: QueueTab) => void;
  onViewJob: (job: JobItem) => void;
  onViewFullQueue?: () => void;
}

const QueueCardRowActionMenu: React.FC<{
  job: JobItem;
  onViewJob: (job: JobItem) => void;
}> = ({ job, onViewJob }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 135;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;
    const top = openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleScrollOrResize = () => setIsOpen(false);

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999
            }}
            className="w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 text-left text-xs space-y-0.5"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onViewJob(job);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Preview Job</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                alert(`Reprinting ${job.fileName}...`);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reprint</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                alert(`Job ${job.jobCode} removed from queue.`);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Cancel / Delete</span>
            </button>
          </motion.div>,
          document.body
        )}
    </div>
  );
};

export const QueueCard: React.FC<QueueCardProps> = ({
  jobs,
  selectedTab,
  onTabChange,
  onViewJob,
  onViewFullQueue
}) => {
  // Tab counts
  const printingCount = jobs.filter((j) => j.status === 'Printing').length;
  const waitingCount = jobs.filter((j) => j.status === 'Waiting').length;

  const tabs: { id: QueueTab; label: string; count?: number }[] = [
    { id: 'All', label: 'All' },
    { id: 'Printing', label: 'Printing', count: printingCount },
    { id: 'Waiting', label: 'Waiting', count: waitingCount },
    { id: 'Completed', label: 'Completed' },
    { id: 'Failed', label: 'Failed' }
  ];

  const filteredJobs = jobs.filter((job) => {
    if (selectedTab === 'All') return true;
    return job.status === selectedTab;
  });

  const displayedJobs = filteredJobs.slice(0, 5);

  const getStatusBadge = (status: JobItem['status']) => {
    switch (status) {
      case 'Printing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            Printing
          </span>
        );
      case 'Waiting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Waiting
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Check className="w-3 h-3 stroke-[2.5]" />
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
            ✕ Failed
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Recent Queue
        </h2>
        <button
          onClick={onViewFullQueue}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors group"
        >
          <span>View Full Queue</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 mt-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 text-xs font-semibold transition-colors relative whitespace-nowrap ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>
                {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
              </span>
              {isActive && (
                <motion.div
                  layoutId="queueTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-2 font-semibold">Job ID</th>
              <th className="py-3 px-2 font-semibold">File Name</th>
              <th className="py-3 px-2 font-semibold">Customer</th>
              <th className="py-3 px-2 font-semibold text-center">Pages</th>
              <th className="py-3 px-2 font-semibold text-center">Copies</th>
              <th className="py-3 px-2 font-semibold">Type</th>
              <th className="py-3 px-2 font-semibold">Status</th>
              <th className="py-3 px-2 font-semibold">Time</th>
              <th className="py-3 px-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {displayedJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No jobs found for this tab.
                </td>
              </tr>
            ) : (
              displayedJobs.map((job, index) => (
                <tr
                  key={job.id || job.jobCode || `queue-job-${index}`}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Job ID */}
                  <td className="py-3.5 px-2 font-bold text-indigo-600">
                    {job.jobCode}
                  </td>

                  {/* File Name with PDF Icon */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-extrabold text-rose-600 tracking-tighter">
                          PDF
                        </span>
                      </div>
                      <span className="font-medium text-slate-800 max-w-[130px] truncate block" title={job.fileName}>
                        {job.fileName}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-2 text-slate-500 font-medium">
                    {job.customer}
                  </td>

                  {/* Pages */}
                  <td className="py-3.5 px-2 text-center text-slate-700 font-medium">
                    {job.pages}
                  </td>

                  {/* Copies */}
                  <td className="py-3.5 px-2 text-center text-slate-700 font-medium">
                    {job.copies}
                  </td>

                  {/* Type (B&W or Color) */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {job.colorMode === 'B&W' ? (
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />
                      )}
                      <span>{job.colorMode}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-2">{getStatusBadge(job.status)}</td>

                  {/* Time */}
                  <td className="py-3.5 px-2">
                    <div className="text-slate-800 font-medium">{job.time}</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {job.timeAgo}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-2 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewJob(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Job Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <QueueCardRowActionMenu job={job} onViewJob={onViewJob} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">
          Showing {displayedJobs.length > 0 ? 1 : 0} to {displayedJobs.length} of {jobs.length} jobs
        </span>
        <button
          onClick={onViewFullQueue}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-1 transition-colors group"
        >
          <span>View Full Queue</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
