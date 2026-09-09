import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageSquare } from 'lucide-react';
import { AdminSupportTicketItem } from '../types/support.types';

interface ReplyTicketModalProps {
  ticket: AdminSupportTicketItem | null;
  onClose: () => void;
  onSend: (ticketId: string, replyText: string) => void;
}

export const ReplyTicketModal: React.FC<ReplyTicketModalProps> = ({
  ticket,
  onClose,
  onSend
}) => {
  const [replyText, setReplyText] = useState('');

  if (!ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSend(ticket.id, replyText);
    setReplyText('');
  };

  const quickTemplates = [
    'We have notified the store technician to inspect the terminal.',
    'Your refund has been processed and will reflect in 2-4 hours.',
    'Please try refreshing the browser and re-scanning the QR code.',
    'Your GST invoice has been generated and sent to your email.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Reply to {ticket.customerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {ticket.ticketId} • {ticket.customerEmail}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Quick Response Templates
            </label>
            <div className="space-y-1.5">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(tmpl)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 text-[11px] transition-colors cursor-pointer truncate"
                >
                  ⚡ {tmpl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Custom Message
            </label>
            <textarea
              rows={4}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your official support response..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Response</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
