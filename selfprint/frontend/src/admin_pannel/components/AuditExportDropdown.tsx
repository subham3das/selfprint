import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileSpreadsheet, FileText, Code, File, Lock } from 'lucide-react';
import { usePermission } from '../context/PermissionContext';

interface AuditExportDropdownProps {
  onExport: (format: 'csv' | 'excel' | 'pdf' | 'json') => void;
  disabled?: boolean;
}

export const AuditExportDropdown: React.FC<AuditExportDropdownProps> = ({ onExport, disabled = false }) => {
  const { can } = usePermission();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasExportPermission = can('audit', 'export') && !disabled;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!hasExportPermission) {
    return (
      <div className="relative group inline-block">
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-400 border border-slate-200 font-semibold text-xs rounded-xl cursor-not-allowed opacity-70"
          title="You don't have Export permission."
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
          <ChevronDown className="w-3 h-3 text-slate-400 opacity-40" />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none">
          You don't have Export permission.
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Export</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExport('csv');
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export as CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExport('excel');
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <File className="w-3.5 h-3.5 text-green-600" />
            <span>Export as Excel</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExport('pdf');
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Export as PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExport('json');
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export as JSON</span>
          </button>
        </div>
      )}
    </div>
  );
};
