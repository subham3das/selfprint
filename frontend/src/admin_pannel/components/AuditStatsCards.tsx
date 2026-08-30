import React from 'react';
import {
  ScrollText,
  ShieldAlert,
  KeyRound,
  Flame,
  Radio,
  AlertOctagon
} from 'lucide-react';
import { AuditStatsData } from '../types/audit.types';

interface AuditStatsCardsProps {
  stats: AuditStatsData;
}

export const AuditStatsCards: React.FC<AuditStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Logs Today',
      value: stats.totalLogsToday.toLocaleString(),
      trend: stats.totalLogsTrend,
      icon: ScrollText,
      iconBg: 'bg-purple-50 text-purple-600',
      sparklineColor: '#8B5CF6',
      sparkPoints: 'M0,18 Q15,10 30,14 T60,6 T90,2'
    },
    {
      title: 'Failed Logins',
      value: stats.failedLoginAttempts.toString(),
      trend: stats.failedLoginTrend,
      icon: ShieldAlert,
      iconBg: 'bg-rose-50 text-rose-600',
      sparklineColor: '#F43F5E',
      sparkPoints: 'M0,8 Q15,14 30,10 T60,16 T90,4'
    },
    {
      title: 'Permission Changes',
      value: stats.permissionChanges.toString(),
      trend: stats.permissionChangesTrend,
      icon: KeyRound,
      iconBg: 'bg-indigo-50 text-indigo-600',
      sparklineColor: '#6366F1',
      sparkPoints: 'M0,14 Q15,16 30,8 T60,12 T90,2'
    },
    {
      title: 'Critical Events',
      value: stats.criticalEvents.toString(),
      trend: stats.criticalEventsTrend,
      icon: Flame,
      iconBg: 'bg-amber-50 text-amber-600',
      sparklineColor: '#F59E0B',
      sparkPoints: 'M0,4 Q15,12 30,8 T60,14 T90,18'
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions.toString(),
      trend: stats.activeSessionsTrend,
      icon: Radio,
      iconBg: 'bg-emerald-50 text-emerald-600',
      sparklineColor: '#10B981',
      sparkPoints: 'M0,16 Q15,10 30,12 T60,6 T90,4'
    },
    {
      title: 'Security Alerts',
      value: stats.securityAlerts.toString(),
      trend: stats.securityAlertsTrend,
      icon: AlertOctagon,
      iconBg: 'bg-rose-50 text-rose-600',
      sparklineColor: '#E11D48',
      sparkPoints: 'M0,10 Q15,6 30,14 T60,4 T90,8'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
          >
            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">
                {c.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Middle: Number & Sparkline */}
            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {c.value}
                </p>
                <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                  {c.trend}
                </p>
              </div>

              {/* Mini SVG Sparkline */}
              <div className="w-14 h-6 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 90 20" className="w-full h-full overflow-visible">
                  <path
                    d={c.sparkPoints}
                    fill="none"
                    stroke={c.sparklineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
