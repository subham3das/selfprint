import React, { useState } from 'react';
import { X, Check, FileStack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PrintPagesSelection,
  UserPrintJobConfig,
  UploadedFileInfo
} from '../types/userPrint.types';

interface PagesSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFileInfo | null;
  config: UserPrintJobConfig;
  onSave: (selection: PrintPagesSelection, customRange: string, count: number) => void;
}

export const PagesSelectorModal: React.FC<PagesSelectorModalProps> = ({
  isOpen,
  onClose,
  file,
  config,
  onSave
}) => {
  const totalPages = file?.totalPages || 12;
  const [selection, setSelection] = useState<PrintPagesSelection>(
    config.pageSelection
  );
  const [customRange, setCustomRange] = useState(config.customRange || `1-${totalPages}`);

  if (!isOpen) return null;

  const calculateCustomCount = (rangeStr: string): number => {
    try {
      const parts = rangeStr.split(',');
      let count = 0;
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            count += Math.min(totalPages, end) - Math.max(1, start) + 1;
          }
        } else {
          const num = Number(trimmed);
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            count += 1;
          }
        }
      }
      return Math.max(1, Math.min(totalPages, count));
    } catch {
      return totalPages;
    }
  };

  const handleApply = () => {
    const finalCount =
      selection === 'All' ? totalPages : calculateCustomCount(customRange);
    onSave(selection, customRange, finalCount);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Sheet / Dialog */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileStack className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Select Pages to Print
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3 text-xs">
            {/* All Pages */}
            <div
              onClick={() => setSelection('All')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                selection === 'All'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900">All Pages</p>
                <p className="text-slate-400 mt-0.5">
                  Print the entire document (1 - {totalPages})
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selection === 'All'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {selection === 'All' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Custom Range */}
            <div
              onClick={() => setSelection('Custom')}
              className={`p-3.5 rounded-2xl border space-y-2.5 cursor-pointer transition-all ${
                selection === 'Custom'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Custom Page Range</p>
                  <p className="text-slate-400 mt-0.5">
                    Specify exact pages (e.g. 1-5, 8, 10)
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selection === 'Custom'
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {selection === 'Custom' && (
                    <Check className="w-3 h-3 stroke-[3]" />
                  )}
                </div>
              </div>

              {selection === 'Custom' && (
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder={`e.g. 1-3, 5, 7-${totalPages}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-mono text-slate-800 outline-none bg-white transition-all text-xs"
                />
              )}
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={handleApply}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
            >
              Apply Selection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
