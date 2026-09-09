import React from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Star
} from 'lucide-react';
import { SupportStatsData } from '../types/support.types';

interface SupportStatsCardsProps {
  stats: SupportStatsData;
  isLoading?: boolean;
}

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`supp-stat-skel-${idx}`}
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

  const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
    'total-tickets': { icon: Inbox, bg: 'bg-purple-50 text-purple-600' },
    'open-tickets': { icon: HelpCircle, bg: 'bg-emerald-50 text-emerald-600' },
    'in-progress': { icon: Clock, bg: 'bg-amber-50 text-amber-600' },
    'resolved-tickets': { icon: CheckCircle2, bg: 'bg-sky-50 text-sky-600' },
    'closed-tickets': { icon: XCircle, bg: 'bg-rose-50 text-rose-500' },
    'satisfaction': { icon: Star, bg: 'bg-indigo-50 text-indigo-600' }
  };

  const cards = stats?.cards || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
      {cards.map((c, idx) => {
        const iconConfig = iconMap[c.id] || { icon: Inbox, bg: 'bg-purple-50 text-purple-600' };
        const Icon = iconConfig.icon;

        // Sparkline coordinates
        const svgW = 120;
        const svgH = 26;
        const pts = c.sparkline && c.sparkline.length > 0 ? c.sparkline : [0, 0, 0, 0, 0, 0];
        const minVal = Math.min(...pts);
        const maxVal = Math.max(...pts);
        const range = maxVal - minVal || 1;

        const coords = pts.map((val, i) => {
          const x = (i / Math.max(1, pts.length - 1)) * svgW;
          const y = svgH - 4 - ((val - minVal) / range) * (svgH - 8);
          return { x, y };
        });

        const pathD = coords.reduce((acc, pt, i) => {
          return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
        }, '');

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
                className={`w-8 h-8 rounded-xl ${iconConfig.bg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
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

            {/* Sparkline Visual */}
            <div className="mt-2 h-7 w-full overflow-hidden flex items-end">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
                <path
                  d={pathD}
                  fill="none"
                  stroke={c.color || '#6366F1'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Bottom Subtext */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              <span
                className={`font-bold truncate ${
                  c.isPositive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {c.trend}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
