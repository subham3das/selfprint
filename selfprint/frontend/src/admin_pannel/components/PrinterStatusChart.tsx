import React from 'react';
import { Monitor } from 'lucide-react';
import { PrinterStatusSegment } from '../types/analytics.types';

interface PrinterStatusChartProps {
  segments: PrinterStatusSegment[];
}

export const PrinterStatusChart: React.FC<PrinterStatusChartProps> = ({ segments }) => {
  const rawSegments = segments || [];
  const totalCount = rawSegments.reduce((sum, s) => sum + s.count, 0);

  // SVG Donut Calculations
  const size = 120;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 mb-2">
        Printer Status Distribution
      </h3>

      {/* Donut Chart or Empty State */}
      {rawSegments.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-1 my-auto">
          <Monitor className="w-6 h-6 text-slate-300" />
          <p className="text-[11px] font-semibold">No printer hardware</p>
        </div>
      ) : (
        <>
          <div className="relative flex items-center justify-center my-2">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 overflow-visible"
            >
              {rawSegments.map((seg, idx) => {
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
                {totalCount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                Total Printers
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs mt-2 pt-2 border-t border-slate-100">
            {rawSegments.map((seg, idx) => (
              <div key={idx} className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-slate-600 font-medium truncate text-[11px]">
                    {seg.name}
                  </span>
                </div>
                <span className="font-mono text-slate-700 font-bold shrink-0 text-[10px]">
                  {seg.count} ({seg.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
