import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, FileSpreadsheet, FileText, Lock } from 'lucide-react';
import { usePermission } from '../context/PermissionContext';

interface ExportDropdownProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  module?: string;
  disabled?: boolean;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport,
  module = 'transactions',
  disabled = false
}) => {
  const { can } = usePermission();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasExportPermission = can(module, 'export') && !disabled;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!hasExportPermission) {
    return (
      <div className="relative group inline-block">
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold cursor-not-allowed opacity-70"
          title="You don't have Export permission."
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
          <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-40" />
        </button>

        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
          You don't have Export permission.
        </div>
      </div>
    );
  }

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
            className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1"
          >
            <button
              type="button"
              onClick={() => {
                onExport('csv');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Export as Excel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onExport('pdf');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Export as PDF</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
