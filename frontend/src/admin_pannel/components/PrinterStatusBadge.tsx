import React from 'react';
import { PrinterStatus } from '../types/printer.types';

interface PrinterStatusBadgeProps {
  status: PrinterStatus;
}

export const PrinterStatusBadge: React.FC<PrinterStatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Online':
        return {
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
          dot: 'bg-emerald-500'
        };
      case 'Busy':
      case 'Printing':
        return {
          bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
          dot: 'bg-amber-500 animate-pulse'
        };
      case 'Offline':
        return {
          bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
          dot: 'bg-rose-500'
        };
      case 'Maintenance':
        return {
          bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
          dot: 'bg-blue-500'
        };
      case 'Error':
      case 'Out of Paper':
      case 'Out of Ink':
        return {
          bg: 'bg-red-50 text-red-600 border-red-200/60',
          dot: 'bg-red-500 animate-pulse'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const { bg, dot } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
