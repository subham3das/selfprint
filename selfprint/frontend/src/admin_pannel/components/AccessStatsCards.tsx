import React from 'react';
import {
  Users,
  UserCheck,
  ShieldAlert,
  UserCog,
  Headphones,
  MailQuestion
} from 'lucide-react';
import { AccessStatsData } from '../types/access.types';

interface AccessStatsCardsProps {
  stats: AccessStatsData;
  isLoading?: boolean;
}

export const AccessStatsCards: React.FC<AccessStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`acc-stat-skel-${idx}`}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between h-24 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-16 h-3 bg-slate-200 rounded" />
              <div className="w-7 h-7 rounded-xl bg-slate-100 shrink-0" />
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded mt-2" />
            <div className="w-20 h-2.5 bg-slate-100 rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  const safeStats = stats || {
    totalStaff: 0,
    activeStaff: 0,
    admins: 0,
    managers: 0,
    supportStaff: 0,
    pendingInvites: 0
  };

  const activePercent =
    safeStats.totalStaff > 0
      ? Math.round((safeStats.activeStaff / safeStats.totalStaff) * 100)
      : 0;

  const cards = [
    {
      title: 'Total Staff',
      value: (safeStats.totalStaff || 0).toLocaleString(),
      subtext: safeStats.totalStaff > 0 ? 'Enterprise directory' : 'No staff registered',
      subtextColor: 'text-indigo-600',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Active Staff',
      value: (safeStats.activeStaff || 0).toLocaleString(),
      subtext: `${activePercent}% of directory`,
      subtextColor: 'text-emerald-600',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Platform Admins',
      value: (safeStats.admins || 0).toLocaleString(),
      subtext: 'Elevated & root access',
      subtextColor: 'text-purple-600',
      icon: ShieldAlert,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Managers',
      value: (safeStats.managers || 0).toLocaleString(),
      subtext: 'Store & fleet controllers',
      subtextColor: 'text-blue-600',
      icon: UserCog,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Support Staff',
      value: (safeStats.supportStaff || 0).toLocaleString(),
      subtext: 'Helpdesk & operations',
      subtextColor: 'text-teal-600',
      icon: Headphones,
      iconBg: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Pending Invites',
      value: (safeStats.pendingInvites || 0).toLocaleString(),
      subtext: 'Awaiting email verification',
      subtextColor: 'text-amber-600',
      icon: MailQuestion,
      iconBg: 'bg-amber-50 text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 truncate">
                {c.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <p className="text-xl font-black text-slate-900 font-mono tracking-tight">
                {c.value}
              </p>
              <p className={`text-[10px] font-semibold mt-0.5 ${c.subtextColor} truncate`}>
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
