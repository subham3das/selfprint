import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PlatformAnalyticsData, DonutChartSegment } from '../../types/admin.types';

interface PlatformAnalyticsCardProps {
  analytics: PlatformAnalyticsData;
  period: 'This Month' | 'This Year';
  onPeriodChange: (p: 'This Month' | 'This Year') => void;
  isLoading?: boolean;
}

const getEmptyMessage = (title: string) => {
  if (title === 'Most Used Printers') return 'No printer usage data';
  if (title === 'Peak Hours') return 'No analytics available';
  if (title === 'Print Type') return 'No print type data';
  if (title === 'Paper Size') return 'No paper usage data';
  return 'No data available';
};

// Reusable SVG Donut Chart Component
const MiniDonutChart: React.FC<{
  title: string;
  segments: DonutChartSegment[];
}> = ({ title, segments }) => {
  const size = 96;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  if (!segments || segments.length === 0) {
    return (
      <div className="bg-[#FAFBFD] border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[120px]">
        <h3 className="text-xs font-bold text-slate-800 mb-1">{title}</h3>
        <div className="py-6 flex items-center justify-center text-center text-[11px] text-slate-400 font-medium">
          {getEmptyMessage(title)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFBFD] border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[120px]">
      <h3 className="text-xs font-bold text-slate-800 mb-2">{title}</h3>

      <div className="flex items-center gap-3">
        {/* SVG Donut */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {segments.map((seg, idx) => {
              const dashLength = (seg.percentage / 100) * circumference;
              const strokeOffset =
                circumference - (accumulatedPercent / 100) * circumference;
              accumulatedPercent += seg.percentage;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-((circumference - strokeOffset) % circumference)}
                  className="transition-all duration-300 hover:opacity-85"
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-[11px] gap-1"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-600 truncate">{seg.label}</span>
              </div>
              <span className="font-bold text-slate-900 font-mono shrink-0">
                {seg.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PlatformAnalyticsCard: React.FC<PlatformAnalyticsCardProps> = ({
  analytics,
  period,
  onPeriodChange,
  isLoading
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">Platform Analytics</h2>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1"
              >
                {(['This Month', 'This Year'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onPeriodChange(p);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === p
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2x2 Donut Charts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`donut-skel-${idx}`} className="bg-slate-50 rounded-2xl p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <MiniDonutChart title="Print Type" segments={analytics?.printType || []} />
          <MiniDonutChart title="Paper Size" segments={analytics?.paperSize || []} />
          <MiniDonutChart
            title="Most Used Printers"
            segments={analytics?.mostUsedPrinters || []}
          />
          <MiniDonutChart title="Peak Hours" segments={analytics?.peakHours || []} />
        </div>
      )}
    </div>
  );
};
