import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { UserStatsData } from '../types/user.types';

interface UsersStatsCardsProps {
  stats: UserStatsData;
}

export const UsersStatsCards: React.FC<UsersStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subText: stats.totalUsersTrend,
      isPositive: true,
      icon: Users,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'active',
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      subText: stats.activeUsersTrend,
      isPositive: true,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'new',
      title: 'New Users (Today)',
      value: stats.newUsersToday.toLocaleString(),
      subText: stats.newUsersTrend,
      isPositive: true,
      icon: UserPlus,
      iconBg: 'bg-sky-50 text-sky-600'
    },
    {
      id: 'verified',
      title: 'Verified Users',
      value: stats.verifiedUsers.toLocaleString(),
      subText: stats.verifiedPercent,
      isPositive: null,
      icon: ShieldCheck,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'banned',
      title: 'Banned Users',
      value: stats.bannedUsers.toLocaleString(),
      subText: stats.bannedUsersTrend,
      isPositive: false,
      icon: UserX,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'online',
      title: 'Users Online',
      value: stats.usersOnline.toLocaleString(),
      subText: stats.onlineSubtitle,
      isPositive: null,
      isLive: true,
      icon: null,
      iconBg: 'bg-emerald-50 text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
      {cards.map((c, idx) => {
        const Icon = c.icon;

        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.02 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Top: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {c.isLive ? (
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                ) : (
                  Icon && <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-500 truncate">
                {c.title}
              </span>
            </div>

            {/* Numeric Value */}
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {c.value}
              </span>
            </div>

            {/* Bottom Subtext */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              {c.isPositive === true ? (
                <span className="text-emerald-600 font-bold truncate">
                  {c.subText}
                </span>
              ) : c.isPositive === false ? (
                <span className="text-rose-500 font-bold truncate">
                  {c.subText}
                </span>
              ) : (
                <span className="text-slate-400 truncate">{c.subText}</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
