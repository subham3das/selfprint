import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserCheck } from 'lucide-react';
import { AdminSupportTicketItem, TicketPriority } from '../types/support.types';

interface AssignTicketModalProps {
  ticket: AdminSupportTicketItem | null;
  onClose: () => void;
  onAssign: (ticketId: string, adminName: string, priority?: TicketPriority) => void;
}

export const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  ticket,
  onClose,
  onAssign
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState(ticket?.assignedAdminName || 'Amit Sharma');
  const [priority, setPriority] = useState<TicketPriority>(ticket?.priority || 'Medium');

  if (!ticket) return null;

  const admins = [
    { name: 'Amit Sharma', role: 'Senior Support Lead' },
    { name: 'Priya Verma', role: 'Billing & Payments Specialist' },
    { name: 'Neha Patel', role: 'Hardware & Printer Technician' },
    { name: 'Rohit Singh', role: 'Customer Success Executive' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(ticket.id, selectedAdmin, priority);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Assign Ticket
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {ticket.ticketId} • {ticket.subject}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Select Support Agent / Admin
            </label>
            <div className="space-y-2">
              {admins.map((adm) => (
                <button
                  key={adm.name}
                  type="button"
                  onClick={() => setSelectedAdmin(adm.name)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedAdmin === adm.name
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{adm.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{adm.role}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Ticket Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Critical">Critical Priority</option>
            </select>
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
              <UserCheck className="w-4 h-4" />
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
