import React from 'react';
import { StoreStatus } from '../types/store.types';

interface StoreStatusBadgeProps {
  status: StoreStatus;
}

export const StoreStatusBadge: React.FC<StoreStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Online':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Online</span>
        </span>
      );
    case 'Busy':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Busy</span>
        </span>
      );
    case 'Offline':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Offline</span>
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Pending</span>
        </span>
      );
    case 'Suspended':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>Suspended</span>
        </span>
      );
    default:
      return null;
  }
};
