import React from 'react';
import { TicketCategory } from '../types/support.types';

interface CategoryBadgeProps {
  category: TicketCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getStyles = () => {
    switch (category) {
      case 'Technical':
        return 'bg-purple-50 text-purple-600 border-purple-200/60';
      case 'Billing':
        return 'bg-sky-50 text-sky-600 border-sky-200/60';
      case 'Print Quality':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200/60';
      case 'Refund':
        return 'bg-teal-50 text-teal-600 border-teal-200/60';
      case 'Account':
        return 'bg-cyan-50 text-cyan-600 border-cyan-200/60';
      case 'General':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStyles()}`}
    >
      {category}
    </span>
  );
};
