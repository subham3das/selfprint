import React from 'react';

interface SegmentItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface SupportOverviewChartProps {
  segments: SegmentItem[];
}

export const SupportOverviewChart: React.FC<SupportOverviewChartProps> = ({
  segments
}) => {
  // SVG Donut Calculations
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <h3 className="text-sm font-bold text-slate-900">Support Overview</h3>

      {/* Main content: Donut on left, Legend on right */}
      <div className="flex flex-col sm:flex-row items-center gap-4 my-3">
        {/* Donut */}
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
            <span className="text-base font-black text-slate-900 tracking-tight">
              1,248
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Tickets
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
              <span className="font-mono text-slate-700 font-bold shrink-0 text-[11px]">
                {seg.count} ({seg.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
