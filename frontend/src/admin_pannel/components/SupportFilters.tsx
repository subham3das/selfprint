import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { SupportFilterState } from '../types/support.types';

interface SupportFiltersProps {
  filters: SupportFilterState;
  onFilterChange: (newFilters: Partial<SupportFilterState>) => void;
  onReset: () => void;
}

export const SupportFilters: React.FC<SupportFiltersProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'category' | 'priority' | 'source' | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = ['All Status', 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  const categoryOptions = [
    'All Categories',
    'Technical',
    'Billing',
    'Refund',
    'Print Quality',
    'Account',
    'General'
  ];
  const priorityOptions = ['All Priorities', 'Low', 'Medium', 'High', 'Critical'];
  const sourceOptions = ['All Sources', 'QR Portal', 'Web App', 'Email', 'WhatsApp'];

  return (
    <div
      ref={filterRef}
      className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
    >
      {/* Left Search & Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by ticket ID, subject, user or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'status' ? null : 'status')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.status === 'All' ? 'All Status' : filters.status}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {statusOptions.map((opt) => {
                  const val = opt === 'All Status' ? 'All' : opt;
                  const isSelected = filters.status === val;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onFilterChange({ status: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'category' ? null : 'category')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.category === 'All' ? 'All Categories' : filters.category}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'category' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {categoryOptions.map((opt) => {
                  const val = opt === 'All Categories' ? 'All' : opt;
                  const isSelected = filters.category === val;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onFilterChange({ category: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'priority' ? null : 'priority')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.priority === 'All' ? 'All Priorities' : filters.priority}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'priority' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {priorityOptions.map((opt) => {
                  const val = opt === 'All Priorities' ? 'All' : opt;
                  const isSelected = filters.priority === val;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onFilterChange({ priority: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Source Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'source' ? null : 'source')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.source === 'All' ? 'All Sources' : filters.source}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'source' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {sourceOptions.map((opt) => {
                  const val = opt === 'All Sources' ? 'All' : opt;
                  const isSelected = filters.source === val;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onFilterChange({ source: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        <span>Reset</span>
      </button>
    </div>
  );
};
