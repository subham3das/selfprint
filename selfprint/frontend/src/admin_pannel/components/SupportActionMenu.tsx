import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { AdminSupportTicketItem, TicketStatus } from '../types/support.types';

interface SupportActionMenuProps {
  ticket: AdminSupportTicketItem;
  onView: (t: AdminSupportTicketItem) => void;
  onReply: (t: AdminSupportTicketItem) => void;
  onAssign: (t: AdminSupportTicketItem) => void;
  onChangeStatus: (id: string, status: TicketStatus) => void;
  onDelete: (id: string) => void;
}

export const SupportActionMenu: React.FC<SupportActionMenuProps> = ({
  ticket,
  onView,
  onReply,
  onAssign,
  onChangeStatus,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48 is 192px
    const menuHeight = 210;

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
      {/* Quick View Button */}
      <button
        type="button"
        title="View Ticket"
        onClick={() => onView(ticket)}
        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
      >
        <Eye className="w-4 h-4" />
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
                  onView(ticket);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer text-left"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>View Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReply(ticket);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Reply Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAssign(ticket);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Assign to Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChangeStatus(ticket.id, 'Resolved');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark as Resolved</span>
              </button>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onDelete(ticket.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete Ticket</span>
              </button>
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  );
};

export default SupportActionMenu;
