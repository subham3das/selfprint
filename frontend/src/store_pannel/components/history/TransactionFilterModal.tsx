import React, { useState } from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TransactionFilters,
  TransactionPaymentStatus,
  TransactionColorMode,
  TransactionPaperSize,
  TransactionSortOption,
  DateRangePreset
} from '../../types/transaction.types';

interface TransactionFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onApplyFilters: (updated: Partial<TransactionFilters>) => void;
  onResetFilters: () => void;
}

export const TransactionFilterModal: React.FC<TransactionFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters
}) => {
  const [dateRange, setDateRange] = useState<DateRangePreset>(filters.dateRange);
  const [paymentStatus, setPaymentStatus] = useState<
    'All' | TransactionPaymentStatus
  >(filters.paymentStatus);
  const [paymentMethod, setPaymentMethod] = useState<string>(filters.paymentMethod);
  const [colorMode, setColorMode] = useState<'All' | TransactionColorMode>(
    filters.colorMode
  );
  const [paperSize, setPaperSize] = useState<'All' | TransactionPaperSize>(
    filters.paperSize
  );
  const [sortBy, setSortBy] = useState<TransactionSortOption>(filters.sortBy);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      dateRange,
      paymentStatus,
      paymentMethod,
      colorMode,
      paperSize,
      sortBy
    });
    onClose();
  };

  const handleReset = () => {
    setDateRange('today');
    setPaymentStatus('All');
    setPaymentMethod('All');
    setColorMode('All');
    setPaperSize('All');
    setSortBy('newest');
    onResetFilters();
    onClose();
  };

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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Transaction Filters &amp; Sorting
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
            {/* Date Range Preset */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Date Range</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'last_7_days', label: 'Last 7 Days' },
                  { id: 'last_30_days', label: 'Last 30 Days' },
                  { id: 'this_month', label: 'This Month' }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDateRange(d.id as DateRangePreset)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      dateRange === d.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Payment Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Completed', 'Pending', 'Refunded', 'Failed'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() =>
                        setPaymentStatus(st as 'All' | TransactionPaymentStatus)
                      }
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        paymentStatus === st
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'UPI', 'Cash', 'Card', 'Wallet'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === m
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Color Mode</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'B&W', 'Color'].map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setColorMode(c as 'All' | TransactionColorMode)
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      colorMode === c
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Size */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Paper Size</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'A4', 'A3', 'Letter', 'Legal'].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setPaperSize(s as 'All' | TransactionPaperSize)
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      paperSize === s
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as TransactionSortOption)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_high">Highest Amount First</option>
                <option value="amount_low">Lowest Amount First</option>
                <option value="pages_high">Highest Page Count</option>
                <option value="pages_low">Lowest Page Count</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
