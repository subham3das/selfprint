import React from 'react';
import {
  LogIn,
  LogOut,
  ShieldAlert,
  Key,
  Store,
  Printer,
  DollarSign,
  User,
  ShieldCheck,
  Headphones,
  Settings,
  Database,
  FileCode,
  Activity
} from 'lucide-react';
import { AuditActionType } from '../types/audit.types';


interface AuditActionBadgeProps {
  action: AuditActionType;
}

export const AuditActionBadge: React.FC<AuditActionBadgeProps> = ({ action }) => {
  const getActionConfig = () => {
    switch (action) {
      case 'Login':
        return { icon: LogIn, color: 'text-indigo-600 bg-indigo-50' };
      case 'Logout':
        return { icon: LogOut, color: 'text-slate-600 bg-slate-100' };
      case 'Failed Login':
        return { icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' };
      case 'Password Reset':
        return { icon: Key, color: 'text-amber-600 bg-amber-50' };
      case 'Store Created':
      case 'Store Updated':
      case 'Store Deleted':
        return { icon: Store, color: 'text-blue-600 bg-blue-50' };
      case 'Printer Added':
      case 'Printer Removed':
      case 'Printer Restarted':
        return { icon: Printer, color: 'text-cyan-600 bg-cyan-50' };
      case 'Revenue Updated':
      case 'Payment Success':
      case 'Payment Failed':
        return { icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' };
      case 'User Created':
      case 'User Deleted':
        return { icon: User, color: 'text-purple-600 bg-purple-50' };
      case 'Role Changed':
      case 'Permission Changed':
        return { icon: ShieldCheck, color: 'text-purple-600 bg-purple-50' };
      case 'Support Ticket Closed':
        return { icon: Headphones, color: 'text-teal-600 bg-teal-50' };
      case 'Settings Updated':
        return { icon: Settings, color: 'text-slate-700 bg-slate-100' };
      case 'API Key Generated':
        return { icon: Key, color: 'text-amber-600 bg-amber-50' };
      case 'Backup Created':
      case 'Restore Started':
      case 'Database Cleanup':
        return { icon: Database, color: 'text-indigo-600 bg-indigo-50' };
      case 'Export Generated':
        return { icon: FileCode, color: 'text-blue-600 bg-blue-50' };
      default:
        return { icon: Activity, color: 'text-slate-600 bg-slate-100' };
    }
  };

  const { icon: Icon, color } = getActionConfig();

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-5 h-5 rounded-md ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="font-bold text-slate-800 text-xs truncate max-w-[130px]">
        {action}
      </span>
    </div>
  );
};
