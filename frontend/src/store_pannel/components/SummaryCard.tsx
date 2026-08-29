import React from 'react';
import { SummaryBreakdown } from '../types/dashboard.types';

interface SummaryCardProps {
  summary: SummaryBreakdown;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  // Donut chart calculation (SVG circle stroke-dasharray)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  // Slices: Completed (75%), Printing (8%), Waiting (10%), Failed (7%) to match visual aesthetics
  const segments = [
    {
      name: 'Completed',
      count: summary.completed,
      percent: summary.completedPercent,
      color: '#10B981', // Emerald green
      dotBg: 'bg-[#10B981]',
      share: 0.75
    },
    {
      name: 'Printing',
      count: summary.printing,
      percent: summary.printingPercent,
      color: '#6366F1', // Indigo / Purple
      dotBg: 'bg-[#6366F1]',
      share: 0.08
    },
    {
      name: 'Waiting',
      count: summary.waiting,
      percent: summary.waitingPercent,
      color: '#F59E0B', // Amber / Orange
      dotBg: 'bg-[#F59E0B]',
      share: 0.10
    },
    {
      name: 'Failed',
      count: summary.failed,
      percent: summary.failedPercent,
      color: '#EF4444', // Red
      dotBg: 'bg-[#EF4444]',
      share: 0.07
    }
  ];

  // Calculate stroke dash offsets
  let accumulatedShare = 0;
  const renderedSegments = segments.map((seg) => {
    const strokeDasharray = `${seg.share * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedShare * circumference;
    accumulatedShare += seg.share;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Today's Summary
          </h2>
        </div>

        {/* Chart + Legend Area */}
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Donut Chart SVG */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="11"
              />

              {/* Segments */}
              {renderedSegments.map((seg) => (
                <circle
                  key={seg.name}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="11"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              ))}
            </svg>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 text-xs flex-1">
            {segments.map((seg) => (
              <div
                key={seg.name}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${seg.dotBg}`} />
                  <span className="text-slate-600 font-medium">{seg.name}</span>
                </div>
                <span className="text-slate-700 font-semibold">
                  {seg.count} ({seg.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Total Revenue */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Total Revenue</span>
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
          {summary.totalRevenue}
        </span>
      </div>
    </div>
  );
};
