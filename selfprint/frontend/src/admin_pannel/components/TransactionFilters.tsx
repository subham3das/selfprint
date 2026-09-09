import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Calendar,
  X,
  Check
} from 'lucide-react';
import { TransactionFilterState } from '../types/transaction.types';
import { ExportDropdown } from './ExportDropdown';

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  onFilterChange: (newFilters: Partial<TransactionFilterState>) => void;
  onReset: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  uniqueStores: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExport,
  uniqueStores
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'store' | 'payment' | 'date' | null>(null);
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

  const statusOptions = ['All', 'Success', 'Pending', 'Failed', 'Refunded', 'Cancelled'];
  const paymentOptions = ['All', 'UPI', 'PhonePe', 'Google Pay', 'Paytm', 'Razorpay', 'Cash'];
  const storeOptions = ['All', ...uniqueStores];
  const datePresets = [
    '01 May 2025 - 29 May 2025',
    'Today (29 May 2025)',
    'Yesterday',
    'Last 7 Days',
    'This Month',
    'Last 30 Days'
  ];

  return (
    <div
      ref={filterRef}
      className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
    >
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[240px] sm:min-w-[300px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search by transaction ID, store, user or amount..."
          className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'status' ? null : 'status')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
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
                className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onFilterChange({ status: st });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.status === st
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st === 'All' ? 'All Status' : st}</span>
                    {filters.status === st && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Store Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'store' ? null : 'store')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span className="truncate max-w-[110px]">
              {filters.store === 'All' ? 'All Stores' : filters.store}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <AnimatePresence>
            {openDropdown === 'store' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-48 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {storeOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onFilterChange({ store: st });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.store === st
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{st === 'All' ? 'All Stores' : st}</span>
                    {filters.store === st && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Method Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'payment' ? null : 'payment')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>
              {filters.paymentMethod === 'All'
                ? 'All Payment Methods'
                : filters.paymentMethod}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {paymentOptions.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => {
                      onFilterChange({ paymentMethod: pm });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.paymentMethod === pm
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{pm === 'All' ? 'All Payment Methods' : pm}</span>
                    {filters.paymentMethod === pm && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'date' ? null : 'date')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{filters.dateRange || 'Select Date Range'}</span>
            {filters.dateRange && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange({ dateRange: '' });
                }}
                className="hover:text-slate-900"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </span>
            )}
          </button>

          <AnimatePresence>
            {openDropdown === 'date' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {datePresets.map((dp) => (
                  <button
                    key={dp}
                    type="button"
                    onClick={() => {
                      onFilterChange({ dateRange: dp });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.dateRange === dp
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{dp}</span>
                    {filters.dateRange === dp && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Export Button */}
        <ExportDropdown onExport={onExport} />
      </div>
    </div>
  );
};
