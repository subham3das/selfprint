import React from 'react';
import { TransactionStatus } from '../types/transaction.types';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Success':
      return (
        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
          Success
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60">
          Pending
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
          Failed
        </span>
      );
    case 'Refunded':
      return (
        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-200/60">
          Refunded
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60">
          Cancelled
        </span>
      );
    default:
      return null;
  }
};
