import React from 'react';
import { TicketStatus } from '../types/support.types';

interface SupportStatusBadgeProps {
  status: TicketStatus;
}

export const SupportStatusBadge: React.FC<SupportStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
      case 'In Progress':
        return 'bg-amber-50 text-amber-600 border-amber-200/60';
      case 'Pending':
        return 'bg-blue-50 text-blue-600 border-blue-200/60';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
      case 'Escalated':
        return 'bg-rose-50 text-rose-600 border-rose-200/60';
      case 'Closed':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStyles()}`}
    >
      {status}
    </span>
  );
};
