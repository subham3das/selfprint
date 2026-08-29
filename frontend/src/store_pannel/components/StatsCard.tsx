import React from 'react';
import {
  FileText,
  IndianRupee,
  Printer,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { StatItem } from '../types/dashboard.types';

interface StatsCardsGridProps {
  stats: StatItem[];
  onSelectTab?: (tab: string) => void;
}

export const StatsCard: React.FC<{
  stat: StatItem;
  onSelectTab?: (tab: string) => void;
}> = ({ stat, onSelectTab }) => {
  const getIconAndStyles = (variant: StatItem['variant']) => {
    switch (variant) {
      case 'purple':
        return {
          icon: FileText,
          bgIcon: 'bg-indigo-50 text-[#4F46E5]',
          border: 'border-slate-100',
          actionColor: 'text-indigo-600 hover:text-indigo-700'
        };
      case 'green':
        return {
          icon: IndianRupee,
          bgIcon: 'bg-emerald-50 text-emerald-600',
          border: 'border-slate-100',
          actionColor: 'text-emerald-600 hover:text-emerald-700'
        };
      case 'blue':
        return {
          icon: Printer,
          bgIcon: 'bg-sky-50 text-sky-600',
          border: 'border-slate-100',
          actionColor: 'text-sky-600 hover:text-sky-700'
        };
      case 'amber':
        return {
          icon: Clock,
          bgIcon: 'bg-amber-50 text-amber-600',
          border: 'border-slate-100',
          actionColor: 'text-amber-600 hover:text-amber-700'
        };
    }
  };

  const config = getIconAndStyles(stat.variant);
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4"
    >
      {/* Icon Box */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${config.bgIcon}`}
      >
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500">{stat.title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          {stat.value}
        </p>

        {/* Trend or Action Link */}
        {stat.trend && (
          <div className="flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
            <span className="flex items-center font-bold">
              ↑ {stat.trend.value}
            </span>
            <span className="text-slate-400 font-normal">{stat.trend.period}</span>
          </div>
        )}

        {stat.actionLabel && (
          <button
            onClick={() => stat.actionTab && onSelectTab?.(stat.actionTab)}
            className={`inline-flex items-center gap-1 mt-1 text-xs font-medium ${config.actionColor} transition-colors group`}
          >
            <span>{stat.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const StatsGrid: React.FC<StatsCardsGridProps> = ({ stats, onSelectTab }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat) => (
        <StatsCard key={stat.id} stat={stat} onSelectTab={onSelectTab} />
      ))}
    </div>
  );
};
