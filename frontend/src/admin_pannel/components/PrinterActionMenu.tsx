import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  Edit2,
  RotateCw,
  Printer,
  PauseCircle,
  PlayCircle,
  Trash2
} from 'lucide-react';
import { AdminPrinterItem } from '../types/printer.types';

interface PrinterActionMenuProps {
  printer: AdminPrinterItem;
  onView: (p: AdminPrinterItem) => void;
  onEdit: (p: AdminPrinterItem) => void;
  onRestart: (id: string) => void;
  onTestPrint: (p: AdminPrinterItem) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PrinterActionMenu: React.FC<PrinterActionMenuProps> = ({
  printer,
  onView,
  onEdit,
  onRestart,
  onTestPrint,
  onTogglePause,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center gap-1" ref={menuRef}>
      {/* View Details Quick Button */}
      <button
        type="button"
        title="View Details"
        onClick={() => onView(printer)}
        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Edit Quick Button */}
      <button
        type="button"
        title="Edit Printer"
        onClick={() => onEdit(printer)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {/* 3-Dot More Menu */}
      <button
        type="button"
        title="More Actions"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1"
          >
            <button
              type="button"
              onClick={() => {
                onView(printer);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>View Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onEdit(printer);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-slate-400" />
              <span>Edit Configuration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onTestPrint(printer);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Run Test Print</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onRestart(printer.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCw className="w-4 h-4 text-amber-500" />
              <span>Restart Printer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onTogglePause(printer.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {printer.status === 'Busy' ? (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span>Pause Printing</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-500" />
                  <span>Resume Printing</span>
                </>
              )}
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onDelete(printer.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Unregister Printer</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
