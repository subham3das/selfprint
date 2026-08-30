import React from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Wifi,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  Coins,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AdminStatCardItem } from '../../types/admin.types';

interface AdminStatCardsGridProps {
  stats: AdminStatCardItem[];
}

const getStatIcon = (iconName: AdminStatCardItem['iconName']) => {
  switch (iconName) {
    case 'store':
    case 'active-store':
      return Store;
    case 'offline-store':
      return Wifi;
    case 'users':
      return Users;
    case 'orders':
      return ShoppingBag;
    case 'live-orders':
      return Clock;
    case 'completed-orders':
      return CheckCircle2;
    case 'failed-orders':
      return XCircle;
    case 'today-revenue':
      return Wallet;
    case 'monthly-revenue':
      return TrendingUp;
    case 'commission':
      return Coins;
    case 'aov':
      return Receipt;
    default:
      return Store;
  }
};

const getColorClasses = (color: AdminStatCardItem['colorScheme']) => {
  switch (color) {
    case 'blue':
      return { bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'emerald':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'red':
      return { bg: 'bg-rose-50', text: 'text-rose-500' };
    case 'indigo':
      return { bg: 'bg-indigo-50', text: 'text-indigo-600' };
    case 'amber':
      return { bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'purple':
      return { bg: 'bg-purple-50', text: 'text-purple-600' };
    case 'teal':
      return { bg: 'bg-teal-50', text: 'text-teal-600' };
    case 'pink':
      return { bg: 'bg-pink-50', text: 'text-pink-600' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600' };
  }
};

export const AdminStatCardsGrid: React.FC<AdminStatCardsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5">
      {stats.map((stat, idx) => {
        const Icon = getStatIcon(stat.iconName);
        const { bg, text } = getColorClasses(stat.colorScheme);

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.02 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl ${bg} ${text} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 truncate leading-tight">
                {stat.title}
              </span>
            </div>

            {/* Big Numeric Value */}
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </span>
            </div>

            {/* Subtext: Percentage Change + Comparison */}
            <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              {stat.isLive ? (
                <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>● Live</span>
                </div>
              ) : (
                <>
                  <span
                    className={`flex items-center font-bold ${
                      stat.isPositive ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                    )}
                    <span>{stat.change}</span>
                  </span>
                  <span className="text-slate-400 truncate">
                    {stat.comparisonText}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
