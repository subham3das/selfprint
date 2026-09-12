import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
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
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192;
    const menuHeight = 220;

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
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

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
    <div className="relative inline-flex items-center gap-1">
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
        ref={buttonRef}
        type="button"
        title="More Actions"
        onClick={handleToggle}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer active:scale-95"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Floating Portal Menu */}
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
            className="w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onView(printer);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
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
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onDelete(printer.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Unregister Printer</span>
              </button>
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  );
};
