import React from 'react';
import { CategoryRevenueSegment } from '../types/revenue.types';
import { ArrowRight } from 'lucide-react';

interface RevenueCategoryChartProps {
  segments: CategoryRevenueSegment[];
  onViewReport?: () => void;
}

export const RevenueCategoryChart: React.FC<RevenueCategoryChartProps> = ({
  segments,
  onViewReport
}) => {
  // SVG Donut Calculations
  const size = 170;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <h3 className="text-sm font-bold text-slate-900">Revenue by Category</h3>

      {/* Main Content: Donut + Legend */}
      <div className="flex flex-col sm:flex-row items-center gap-5 my-3">
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 overflow-visible"
          >
            {segments.map((seg, idx) => {
              const strokeDasharray = `${
                (seg.percentage / 100) * circumference
              } ${circumference}`;
              const strokeDashoffset = -(
                (accumulatedPercent / 100) *
                circumference
              );
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
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-black text-slate-900 tracking-tight">
              ₹25,68,450
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 w-full text-xs">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-600 font-medium truncate">
                  {seg.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono shrink-0">
                <span className="font-bold text-slate-800">
                  {seg.amountFormatted}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {seg.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
        >
          <span>View Full Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
