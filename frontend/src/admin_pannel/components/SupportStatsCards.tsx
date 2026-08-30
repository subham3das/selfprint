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
}

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({ stats }) => {
  const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string }> = {
    'total-tickets': { icon: Inbox, bg: 'bg-purple-50 text-purple-600' },
    'open-tickets': { icon: HelpCircle, bg: 'bg-emerald-50 text-emerald-600' },
    'in-progress': { icon: Clock, bg: 'bg-amber-50 text-amber-600' },
    'resolved-tickets': { icon: CheckCircle2, bg: 'bg-sky-50 text-sky-600' },
    'closed-tickets': { icon: XCircle, bg: 'bg-rose-50 text-rose-500' },
    'satisfaction-rate': { icon: Star, bg: 'bg-indigo-50 text-indigo-600' }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
      {stats.cards.map((c, idx) => {
        const iconConfig = iconMap[c.id] || { icon: Inbox, bg: 'bg-purple-50 text-purple-600' };
        const Icon = iconConfig.icon;

        // Sparkline coordinates
        const svgW = 120;
        const svgH = 26;
        const pts = c.sparkline;
        const minVal = Math.min(...pts);
        const maxVal = Math.max(...pts);
        const range = maxVal - minVal || 1;

        const coords = pts.map((val, i) => {
          const x = (i / (pts.length - 1)) * svgW;
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

            {/* Trend subtitle */}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              <span
                className={`font-bold truncate ${
                  c.isPositive ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {c.trend}
              </span>
            </div>

            {/* Mini SVG Sparkline */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 w-full h-[26px]">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-full overflow-visible"
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {coords.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={i === coords.length - 1 ? 3 : 2}
                    fill={c.color}
                  />
                ))}
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
