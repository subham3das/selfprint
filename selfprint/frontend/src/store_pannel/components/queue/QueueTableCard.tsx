import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Filter,
  Eye,
  MoreVertical,
  Check,
  Play,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QueueJobItem,
  QueueJobStatus,
  QueueFilters
} from '../../types/queue.types';

interface QueueTableCardProps {
  jobs: QueueJobItem[];
  filters: QueueFilters;
  onTabChange: (tab: 'All Jobs' | QueueJobStatus) => void;
  onSearchChange: (query: string) => void;
  onOpenFilterModal: () => void;
  onViewDetails: (job: QueueJobItem) => void;
  onStatusChange: (jobId: string, newStatus: QueueJobStatus) => void;
  onDeleteJob: (jobId: string) => void;
}

const QueueRowActionMenu: React.FC<{
  job: QueueJobItem;
  onViewDetails: (job: QueueJobItem) => void;
  onStatusChange: (jobId: string, newStatus: QueueJobStatus) => void;
  onDeleteJob: (jobId: string) => void;
}> = ({ job, onViewDetails, onStatusChange, onDeleteJob }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = 210;

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
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
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
                onViewDetails(job);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Details</span>
            </button>

            {job.status === 'Waiting' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(job.id, 'Printing');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors font-medium cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mark Printing</span>
              </button>
            )}

            {job.status === 'Printing' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(job.id, 'Completed');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors font-medium cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Completed</span>
              </button>
            )}

            {(job.status === 'Failed' || job.status === 'Completed') && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(job.id, 'Waiting');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Again / Retry</span>
              </button>
            )}

            {job.status === 'Waiting' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStatusChange(job.id, 'Cancelled');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Cancel Job</span>
              </button>
            )}

            <div className="border-t border-slate-100 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onDeleteJob(job.id);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete from Queue</span>
            </button>
          </motion.div>,
          document.body
        )}
    </div>
  );
};

export const QueueTableCard: React.FC<QueueTableCardProps> = ({
  jobs,
  filters,
  onTabChange,
  onSearchChange,
  onOpenFilterModal,
  onViewDetails,
  onStatusChange,
  onDeleteJob
}) => {
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Tab counts
  const printingCount = jobs.filter((j) => j.status === 'Printing').length;
  const waitingCount = jobs.filter((j) => j.status === 'Waiting').length;

  const tabs: { id: 'All Jobs' | QueueJobStatus; label: string; count?: number }[] = [
    { id: 'All Jobs', label: 'All Jobs' },
    { id: 'Printing', label: 'Printing', count: printingCount },
    { id: 'Waiting', label: 'Waiting', count: waitingCount },
    { id: 'Completed', label: 'Completed' },
    { id: 'Failed', label: 'Failed' }
  ];

  // Filtering
  const filteredJobs = jobs
    .filter((job) => {
      // Tab match
      if (filters.statusTab !== 'All Jobs' && job.status !== filters.statusTab) {
        return false;
      }
      // Paper size match
      if (filters.paperSize && filters.paperSize !== 'All' && job.paperSize !== filters.paperSize) {
        return false;
      }
      // Color mode match
      if (filters.colorMode && filters.colorMode !== 'All' && job.colorMode !== filters.colorMode) {
        return false;
      }
      // Search match
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchCode = job.jobCode.toLowerCase().includes(q);
        const matchName = job.fileName.toLowerCase().includes(q);
        const matchCustomer = job.customerName.toLowerCase().includes(q);
        const matchFullId = job.fullJobId.toLowerCase().includes(q);
        const matchPhone = job.customerPhone?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchCustomer && !matchFullId && !matchPhone) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'highest_pages':
          return b.pages - a.pages;
        case 'lowest_pages':
          return a.pages - b.pages;
        case 'price_high':
          return b.estimatedPrice - a.estimatedPrice;
        case 'price_low':
          return a.estimatedPrice - b.estimatedPrice;
        default:
          return 0;
      }
    });

  const hasActiveFilters =
    (filters.paperSize && filters.paperSize !== 'All') ||
    (filters.colorMode && filters.colorMode !== 'All') ||
    filters.sortBy !== 'newest';

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);


  const getStatusBadge = (job: QueueJobItem) => {
    switch (job.status) {
      case 'Printing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Printing
          </span>
        );
      case 'Waiting':
        return (
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Waiting
            </span>
            {job.statusReason && (
              <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                {job.statusReason}
              </p>
            )}
          </div>
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
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
              ✕ Failed
            </span>
            {job.statusReason && (
              <p className="text-[10px] text-rose-500 mt-0.5 font-medium">
                {job.statusReason}
              </p>
            )}
          </div>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Tabs */}
        <div className="flex items-center gap-5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = filters.statusTab === tab.id;
            return (
              <button

                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setCurrentPage(1);
                }}
                className={`py-2 text-xs font-semibold transition-colors relative whitespace-nowrap ${
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
                    layoutId="queuePageTabIndicator"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Button */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Job ID or File Name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filter Modal Trigger Button */}
          <button
            onClick={onOpenFilterModal}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0 ${
              hasActiveFilters
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>

      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse min-w-[660px]">
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
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <span>
                    {jobs.length === 0
                      ? 'No print jobs available'
                      : 'No print jobs match your filter criteria.'}
                  </span>
                </td>
              </tr>
            ) : (
              displayedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Job ID */}
                  <td className="py-3.5 px-2 font-bold text-indigo-600">
                    {job.jobCode}
                  </td>

                  {/* File Name with Red PDF icon & Size */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-extrabold text-rose-600 tracking-tighter">
                          PDF
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span
                          className="font-bold text-slate-800 max-w-[140px] truncate block leading-tight"
                          title={job.fileName}
                        >
                          {job.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {job.fileSize}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-2 text-slate-600 font-medium">
                    {job.customerName}
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

                  {/* Status Badge */}
                  <td className="py-3.5 px-2">{getStatusBadge(job)}</td>

                  {/* Time & TimeAgo */}
                  <td className="py-3.5 px-2">
                    <div className="text-slate-800 font-medium">{job.uploadTime}</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      {job.timeAgo}
                    </div>
                  </td>

                  {/* Row Actions */}
                  <td className="py-3.5 px-2 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewDetails(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Job Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <QueueRowActionMenu
                        job={job}
                        onViewDetails={onViewDetails}
                        onStatusChange={onStatusChange}
                        onDeleteJob={onDeleteJob}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">
          Showing {displayedJobs.length > 0 ? startIndex + 1 : 0} to{' '}
          {startIndex + displayedJobs.length} of {filteredJobs.length} jobs
        </span>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === p
                  ? 'border border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
