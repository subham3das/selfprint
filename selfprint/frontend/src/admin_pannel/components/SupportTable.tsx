import React, { useState } from 'react';
import { Copy, Check, Headphones } from 'lucide-react';
import { AdminSupportTicketItem, TicketStatus } from '../types/support.types';
import { SupportStatusBadge } from './SupportStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { SupportActionMenu } from './SupportActionMenu';

interface SupportTableProps {
  tickets: AdminSupportTicketItem[];
  isLoading?: boolean;
  onViewTicket: (t: AdminSupportTicketItem) => void;
  onReplyTicket: (t: AdminSupportTicketItem) => void;
  onAssignTicket: (t: AdminSupportTicketItem) => void;
  onChangeStatus: (id: string, status: TicketStatus) => void;
  onDeleteTicket: (id: string) => void;
}

export const SupportTable: React.FC<SupportTableProps> = ({
  tickets,
  isLoading,
  onViewTicket,
  onReplyTicket,
  onAssignTicket,
  onChangeStatus,
  onDeleteTicket
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-400">
              <th className="py-3 pl-5 pr-3">Ticket ID</th>
              <th className="py-3 px-3">Subject</th>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Assigned To</th>
              <th className="py-3 px-3">Created On</th>
              <th className="py-3 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`supp-skel-${idx}`} className="animate-pulse">
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                      <div>
                        <div className="w-20 h-3 bg-slate-200 rounded" />
                        <div className="w-16 h-2 bg-slate-100 rounded mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 pr-5 pl-3 text-right">
                    <div className="w-6 h-6 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Headphones className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No support tickets found</p>
                    <p className="text-xs text-slate-400">All customer support requests will appear here in real time.</p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* 1. Ticket ID Column */}
                  <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                      <span>{t.ticketId}</span>
                      <button
                        type="button"
                        title="Copy Ticket ID"
                        onClick={() => handleCopyId(t.ticketId)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer"
                      >
                        {copiedId === t.ticketId ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 2. Subject Column */}
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                      {t.subject}
                    </p>
                  </td>

                  {/* 3. User Column (Avatar/Initials + Name + Email) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {t.customerAvatar ? (
                        <img
                          src={t.customerAvatar}
                          alt={t.customerName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {(t.customerName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                          {t.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {t.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 4. Category Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <CategoryBadge category={t.category} />
                  </td>

                  {/* 5. Priority Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>

                  {/* 6. Status Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <SupportStatusBadge status={t.status} />
                  </td>

                  {/* 7. Assigned To Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {(t.assignedAdminName || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800 text-xs truncate max-w-[110px]">
                        {t.assignedAdminName}
                      </span>
                    </div>
                  </td>

                  {/* 8. Created On Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <p className="font-medium text-slate-800 text-xs">
                      {t.createdDate}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {t.createdTime}
                    </p>
                  </td>

                  {/* 9. Actions Column */}
                  <td className="py-3.5 pr-5 pl-3 text-right whitespace-nowrap">
                    <SupportActionMenu
                      ticket={t}
                      onView={onViewTicket}
                      onReply={onReplyTicket}
                      onAssign={onAssignTicket}
                      onChangeStatus={onChangeStatus}
                      onDelete={onDeleteTicket}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
