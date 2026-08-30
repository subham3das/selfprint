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
}

export const AccessStatsCards: React.FC<AccessStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Staff',
      value: stats.totalStaff.toString(),
      subtext: '+4 joined this month',
      subtextColor: 'text-indigo-600',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff.toString(),
      subtext: `${Math.round((stats.activeStaff / (stats.totalStaff || 1)) * 100)}% of directory`,
      subtextColor: 'text-emerald-600',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Platform Admins',
      value: stats.admins.toString(),
      subtext: 'Elevated & root access',
      subtextColor: 'text-purple-600',
      icon: ShieldAlert,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Managers',
      value: stats.managers.toString(),
      subtext: 'Store & fleet controllers',
      subtextColor: 'text-blue-600',
      icon: UserCog,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Support Staff',
      value: stats.supportStaff.toString(),
      subtext: 'Helpdesk & operations',
      subtextColor: 'text-teal-600',
      icon: Headphones,
      iconBg: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Pending Invites',
      value: stats.pendingInvites.toString(),
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
