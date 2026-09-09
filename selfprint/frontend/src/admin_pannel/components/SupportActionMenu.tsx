import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                onView(ticket);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark as Resolved</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                onDelete(ticket.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Delete Ticket</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
