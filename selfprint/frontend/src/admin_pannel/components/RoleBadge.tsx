import React from 'react';
import { ShieldCheck, Shield, UserCog, DollarSign, Wrench, Headphones } from 'lucide-react';
import { StaffRole } from '../types/access.types';

interface RoleBadgeProps {
  role: StaffRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  switch (role) {
    case 'Super Admin':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SUPER ADMIN</span>
        </span>
      );
    case 'Admin':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          <Shield className="w-3 h-3 text-indigo-600" />
          <span>Admin</span>
        </span>
      );
    case 'Manager':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
          <UserCog className="w-3 h-3 text-blue-600" />
          <span>Manager</span>
        </span>
      );
    case 'Finance':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <DollarSign className="w-3 h-3 text-emerald-600" />
          <span>Finance</span>
        </span>
      );
    case 'Operations':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200/80">
          <Wrench className="w-3 h-3 text-cyan-600" />
          <span>Operations</span>
        </span>
      );
    case 'Support':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
          <Headphones className="w-3 h-3 text-teal-600" />
          <span>Support</span>
        </span>
      );
  }
};
