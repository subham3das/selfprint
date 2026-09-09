import React from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Monitor,
  Clock,
  WifiOff,
  Wrench,
  Printer
} from 'lucide-react';
import { PrinterStatsData } from '../types/printer.types';

interface PrinterStatsCardsProps {
  stats: PrinterStatsData;
  isLoading?: boolean;
}

export const PrinterStatsCards: React.FC<PrinterStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`prt-stat-skel-${idx}`}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-28 animate-pulse"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
              <div className="w-20 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded mt-2" />
            <div className="w-24 h-2.5 bg-slate-100 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total-printers',
      title: 'Total Printers',
      value: (stats.totalPrinters || 0).toLocaleString(),
      percentLabel: null,
      subText: '100% of all printers',
      isPositive: true,
      icon: Store,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'online-printers',
      title: 'Online Printers',
      value: (stats.onlinePrinters || 0).toLocaleString(),
      percentLabel: stats.onlinePercent || '0% of total',
      subText: stats.onlineTrend || 'No online devices',
      isPositive: (stats.onlinePrinters || 0) > 0,
      icon: Monitor,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'busy-printers',
      title: 'Busy Printers',
      value: (stats.busyPrinters || 0).toLocaleString(),
      percentLabel: stats.busyPercent || '0% of total',
      subText: stats.busyTrend || 'Idle',
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'offline-printers',
      title: 'Offline Printers',
      value: (stats.offlinePrinters || 0).toLocaleString(),
      percentLabel: stats.offlinePercent || '0% of total',
      subText: stats.offlineTrend || 'All connected',
      isPositive: (stats.offlinePrinters || 0) === 0,
      icon: WifiOff,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      value: (stats.maintenancePrinters || 0).toLocaleString(),
      percentLabel: stats.maintenancePercent || '0% of total',
      subText: stats.maintenanceTrend || 'None',
      isPositive: (stats.maintenancePrinters || 0) === 0,
      icon: Wrench,
      iconBg: 'bg-sky-50 text-sky-600'
    },
    {
      id: 'total-prints',
      title: 'Total Prints (This Month)',
      value: (stats.totalPrintsMonth || 0).toLocaleString(),
      percentLabel: null,
      subText: stats.totalPrintsMonthTrend || '0% from last month',
      isPositive: true,
      icon: Printer,
      iconBg: 'bg-purple-50 text-purple-600'
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
            {/* Top Icon + Title */}
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

            {/* Numeric Value + Optional Percentage Badge */}
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {c.value}
              </span>
              {c.percentLabel && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {c.percentLabel}
                </p>
              )}
            </div>

            {/* Bottom Subtext */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              <span
                className={`font-bold truncate ${
                  c.id === 'total-printers'
                    ? 'text-slate-400'
                    : c.isPositive
                    ? 'text-emerald-600'
                    : 'text-rose-500'
                }`}
              >
                {c.subText}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
