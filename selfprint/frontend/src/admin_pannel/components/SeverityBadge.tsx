import React from 'react';
import { Info, CheckCircle2, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import { AuditSeverity } from '../types/audit.types';

interface SeverityBadgeProps {
  severity: AuditSeverity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  switch (severity) {
    case 'Security':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldAlert className="w-3 h-3 text-purple-600" />
          <span>Security</span>
        </span>
      );
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          <Flame className="w-3 h-3 text-rose-600" />
          <span>Critical</span>
        </span>
      );
    case 'Warning':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Warning</span>
        </span>
      );
    case 'Success':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Success</span>
        </span>
      );
    case 'Info':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Info</span>
        </span>
      );
  }
};
