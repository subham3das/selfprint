import React from 'react';
import { UserStatus } from '../types/user.types';

interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active</span>
        </span>
      );
    case 'Inactive':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Inactive</span>
        </span>
      );
    case 'Banned':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Banned</span>
        </span>
      );
    case 'Blocked':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Blocked</span>
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Pending</span>
        </span>
      );
    case 'Verified':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100/80">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Verified</span>
        </span>
      );
    default:
      return null;
  }
};
