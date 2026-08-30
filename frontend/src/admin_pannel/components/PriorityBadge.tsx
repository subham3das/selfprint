import React from 'react';
import { TicketPriority } from '../types/support.types';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getStyles = () => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-200/60';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-200/60';
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStyles()}`}
    >
      {priority}
    </span>
  );
};
