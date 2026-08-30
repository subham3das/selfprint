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
}

export const PrinterStatsCards: React.FC<PrinterStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total-printers',
      title: 'Total Printers',
      value: stats.totalPrinters.toLocaleString(),
      percentLabel: null,
      subText: '100% of all printers',
      isPositive: true,
      icon: Store,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'online-printers',
      title: 'Online Printers',
      value: stats.onlinePrinters.toLocaleString(),
      percentLabel: stats.onlinePercent,
      subText: stats.onlineTrend,
      isPositive: true,
      icon: Monitor,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'busy-printers',
      title: 'Busy Printers',
      value: stats.busyPrinters.toLocaleString(),
      percentLabel: stats.busyPercent,
      subText: stats.busyTrend,
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'offline-printers',
      title: 'Offline Printers',
      value: stats.offlinePrinters.toLocaleString(),
      percentLabel: stats.offlinePercent,
      subText: stats.offlineTrend,
      isPositive: false,
      icon: WifiOff,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      value: stats.maintenancePrinters.toLocaleString(),
      percentLabel: stats.maintenancePercent,
      subText: stats.maintenanceTrend,
      isPositive: false,
      icon: Wrench,
      iconBg: 'bg-sky-50 text-sky-600'
    },
    {
      id: 'total-prints',
      title: 'Total Prints (This Month)',
      value: stats.totalPrintsMonth.toLocaleString(),
      percentLabel: null,
      subText: stats.totalPrintsMonthTrend,
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
