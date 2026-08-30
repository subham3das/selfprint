import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Send,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AdminSupportTicketItem, TicketStatus } from '../types/support.types';
import { SupportStatusBadge } from './SupportStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';

interface ViewTicketModalProps {
  ticket: AdminSupportTicketItem | null;
  onClose: () => void;
  onSendReply: (ticketId: string, message: string) => void;
  onAssign: (ticket: AdminSupportTicketItem) => void;
  onChangeStatus: (ticketId: string, status: TicketStatus) => void;
}

export const ViewTicketModal: React.FC<ViewTicketModalProps> = ({
  ticket,
  onClose,
  onSendReply,
  onAssign,
  onChangeStatus
}) => {
  const [replyText, setReplyText] = useState('');

  if (!ticket) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendReply(ticket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 truncate max-w-sm">
                  {ticket.subject}
                </h3>
                <SupportStatusBadge status={ticket.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {ticket.ticketId} • Created {ticket.createdDate} at {ticket.createdTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Customer & Ticket Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Customer
              </span>
              <p className="font-bold text-slate-900 mt-1 truncate">
                {ticket.customerName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {ticket.customerEmail}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Store
              </span>
              <p className="font-bold text-slate-900 mt-1 truncate">
                {ticket.storeName}
              </p>
              <p className="text-[11px] text-slate-500">Source: {ticket.source}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Classification
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <CategoryBadge category={ticket.category} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Assigned Admin
              </span>
              <p className="font-bold text-slate-900 mt-1 truncate">
                {ticket.assignedAdminName}
              </p>
            </div>
          </div>

          {/* Chat / Ticket Messages Thread */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">
              Ticket Conversation History
            </h4>

            <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 max-h-56 overflow-y-auto">
              {ticket.messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700">
                        {msg.senderName}
                      </span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        isAdmin
                          ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Reply Form */}
          <form onSubmit={handleSend} className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Write a Reply to Customer
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="absolute right-3 bottom-3 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-3 py-1.5 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAssign(ticket)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Reassign Ticket</span>
            </button>

            {ticket.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => onChangeStatus(ticket.id, 'Resolved')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark as Resolved</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
};
