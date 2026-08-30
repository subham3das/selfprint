import React from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, UserCheck, Flame } from 'lucide-react';
import { AuditStatsData, UserActivityRankItem } from '../types/audit.types';

interface SecuritySummaryProps {
  stats: AuditStatsData;
  topAdmins: UserActivityRankItem[];
}

export const SecuritySummary: React.FC<SecuritySummaryProps> = ({
  stats,
  topAdmins
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Security Summary</h3>
          <p className="text-xs text-slate-400 mt-0.5">Platform safety & health</p>
        </div>
        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2 text-slate-600">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Critical Alerts</span>
          </div>
          <span className="font-mono font-bold text-rose-600">
            {stats.criticalEvents}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Failed Logins</span>
          </div>
          <span className="font-mono font-bold text-amber-600">
            {stats.failedLoginAttempts}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2 text-slate-600">
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>Permission Changes</span>
          </div>
          <span className="font-mono font-bold text-indigo-600">
            {stats.permissionChanges}
          </span>
        </div>
      </div>

      {/* Top Active Admins */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Most Active Administrators</span>
        </h4>

        <div className="space-y-2">
          {topAdmins.map((adm) => (
            <div
              key={adm.id}
              className="flex items-center justify-between gap-2 text-xs p-1.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg ${adm.avatarBg} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  {adm.avatarText}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {adm.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {adm.role}
                  </p>
                </div>
              </div>

              <span className="font-mono font-bold text-slate-700 shrink-0 text-[11px]">
                {adm.actionCount} acts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
