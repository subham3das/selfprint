import React, { useState } from 'react';
import { HeatmapCell } from '../types/analytics.types';

interface PrintingHeatmapProps {
  cells: HeatmapCell[];
}

export const PrintingHeatmap: React.FC<PrintingHeatmapProps> = ({ cells }) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColorClass = (intensity: number) => {
    switch (intensity) {
      case 4:
        return 'bg-[#4338CA] hover:ring-2 hover:ring-indigo-400';
      case 3:
        return 'bg-[#6366F1] hover:ring-2 hover:ring-indigo-300';
      case 2:
        return 'bg-[#818CF8] hover:ring-2 hover:ring-indigo-200';
      case 1:
        return 'bg-[#C7D2FE] hover:ring-2 hover:ring-indigo-200';
      case 0:
      default:
        return 'bg-[#EEF2FF] hover:bg-indigo-100';
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Printing Activity by Hour
        </h3>
        {hoveredCell && (
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60">
            {hoveredCell.day} {formatHour(hoveredCell.hour)}: {hoveredCell.jobsCount} jobs
          </span>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto my-2">
        <div className="min-w-[320px]">
          {/* Hour labels header */}
          <div className="grid grid-cols-[36px_repeat(24,1fr)] gap-1 text-[10px] text-slate-400 font-bold mb-1.5 text-center">
            <div />
            {hours.map((h) => (
              <div key={h} className="truncate">
                {h === 0 || h === 6 || h === 12 || h === 18 || h === 23 ? (
                  <span>{formatHour(h)}</span>
                ) : (
                  <span className="opacity-0">·</span>
                )}
              </div>
            ))}
          </div>

          {/* Days & Cells */}
          <div className="space-y-1">
            {days.map((day) => (
              <div
                key={day}
                className="grid grid-cols-[36px_repeat(24,1fr)] gap-1 items-center"
              >
                <span className="text-[10px] font-bold text-slate-400 truncate text-left">
                  {day}
                </span>

                {hours.map((hour) => {
                  const cell = cells.find(
                    (c) => c.day === day && c.hour === hour
                  ) || {
                    day,
                    hour,
                    intensity: 0,
                    jobsCount: 0
                  };

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day} ${formatHour(hour)}: ${cell.jobsCount} jobs`}
                      className={`h-4 sm:h-5 rounded-xs transition-all cursor-pointer ${getColorClass(
                        cell.intensity
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
        <span>Low Activity</span>
        <div className="flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#EEF2FF]" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#C7D2FE]" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#818CF8]" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#6366F1]" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#4338CA]" />
        </div>
        <span>High Activity</span>
      </div>
    </div>
  );
};
