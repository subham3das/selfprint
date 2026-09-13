import React from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Wifi,
  Ban,
  Trash2,
  MapPin
} from 'lucide-react';
import { StoreStatsData } from '../types/store.types';

interface StoreStatsCardsProps {
  stats: StoreStatsData;
  isLoading?: boolean;
}

export const StoreStatsCards: React.FC<StoreStatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Stores',
      value: stats.totalStores,
      subText: '100% of all stores',
      icon: Store,
      iconBg: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'active',
      title: 'Active Stores',
      value: stats.activeStores,
      trend: stats.activePercent ? `+${stats.activePercent}` : undefined,
      isPositive: true,
      icon: Store,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'blocked',
      title: 'Blocked Stores',
      value: stats.blockedStores ?? 0,
      subText: `${stats.blockedPercent || '0%'} of all stores`,
      icon: Ban,
      iconBg: 'bg-rose-50 text-rose-600'
    },
    {
      id: 'deleted',
      title: 'Deleted Stores',
      value: stats.deletedStores ?? 0,
      subText: `${stats.deletedPercent || '0%'} archived`,
      icon: Trash2,
      iconBg: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'offline',
      title: 'Offline Stores',
      value: stats.offlineStores,
      trend: stats.offlinePercent ? `${stats.offlinePercent}` : undefined,
      isPositive: false,
      icon: Wifi,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'cities',
      title: 'Total Cities',
      value: stats.totalCities,
      subText: 'Active network presence',
      icon: MapPin,
      iconBg: 'bg-sky-50 text-sky-600'
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
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 truncate">
                {c.title}
              </span>
            </div>

            {/* Numeric Value or Skeleton */}
            <div className="mt-3">
              {isLoading ? (
                <div className="w-14 h-7 bg-slate-200/80 rounded-lg animate-pulse" />
              ) : (
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {c.value}
                </span>
              )}
            </div>

            {/* Bottom Subtext or Clean Trend Indicator */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              {isLoading ? (
                <div className="w-20 h-3 bg-slate-100 rounded animate-pulse" />
              ) : c.trend ? (
                <span
                  className={`font-bold ${
                    c.isPositive ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {c.trend}
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

export default StoreStatsCards;
