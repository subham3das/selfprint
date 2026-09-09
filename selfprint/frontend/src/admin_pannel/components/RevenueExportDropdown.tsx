import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, FileSpreadsheet, FileText, FileBarChart } from 'lucide-react';

interface RevenueExportDropdownProps {
  onExport: (format: 'csv' | 'excel' | 'pdf' | 'report' | 'summary') => void;
}

export const RevenueExportDropdown: React.FC<RevenueExportDropdownProps> = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>Export</span>
        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1"
          >
            <button
              type="button"
              onClick={() => {
                onExport('csv');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Export as CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExport('excel');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export as Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExport('pdf');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Export as PDF</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onExport('summary');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <FileBarChart className="w-4 h-4 text-indigo-600" />
              <span>Monthly Summary Report</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
