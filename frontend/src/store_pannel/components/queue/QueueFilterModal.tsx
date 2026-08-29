import React, { useState } from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QueueFilters,
  QueuePaperSize,
  QueueColorMode,
  QueueSortOption
} from '../../types/queue.types';

interface QueueFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: QueueFilters;
  onApplyFilters: (updated: Partial<QueueFilters>) => void;
  onResetFilters: () => void;
}

export const QueueFilterModal: React.FC<QueueFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters
}) => {
  const [paperSize, setPaperSize] = useState<QueuePaperSize | 'All'>(
    filters.paperSize || 'All'
  );
  const [colorMode, setColorMode] = useState<QueueColorMode | 'All'>(
    filters.colorMode || 'All'
  );
  const [sortBy, setSortBy] = useState<QueueSortOption>(filters.sortBy);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      paperSize,
      colorMode,
      sortBy
    });
    onClose();
  };

  const handleReset = () => {
    setPaperSize('All');
    setColorMode('All');
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
                Queue Filters &amp; Sorting
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Controls */}
          <div className="p-6 space-y-5 text-xs">
            {/* Paper Size Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">
                Paper Size
              </label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'A4', 'A3', 'Letter', 'Legal'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      paperSize === size
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">
                Color Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {(['All', 'B&W', 'Color'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setColorMode(mode)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      colorMode === mode
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as QueueSortOption)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all bg-white"
              >
                <option value="newest">Newest Upload First</option>
                <option value="oldest">Oldest Upload First</option>
                <option value="highest_pages">Highest Page Count</option>
                <option value="lowest_pages">Lowest Page Count</option>
                <option value="price_high">Highest Price</option>
                <option value="price_low">Lowest Price</option>
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
              <span>Reset Filters</span>
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
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
