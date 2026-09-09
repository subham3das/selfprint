import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { HeatmapHourPoint } from '../types/audit.types';


interface AuditHeatmapProps {
  points: HeatmapHourPoint[];
}

export const AuditHeatmap: React.FC<AuditHeatmapProps> = ({ points }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapHourPoint | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (count: number, riskCount: number) => {
    if (riskCount > 0) return 'bg-rose-500 hover:bg-rose-600';
    if (count > 100) return 'bg-purple-600 hover:bg-purple-700';
    if (count > 60) return 'bg-purple-400 hover:bg-purple-500';
    if (count > 20) return 'bg-purple-200 hover:bg-purple-300';
    if (count > 0) return 'bg-purple-50 hover:bg-purple-100';
    return 'bg-slate-100 hover:bg-slate-200';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Security & Audit Activity Heatmap (7 × 24)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log generation intensity and threat spikes by hour of day
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
          <span className="w-2.5 h-2.5 rounded-xs bg-purple-200" />
          <span className="w-2.5 h-2.5 rounded-xs bg-purple-400" />
          <span className="w-2.5 h-2.5 rounded-xs bg-purple-600" />
          <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" title="Security Threat" />
          <span>More / Threat</span>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto relative">
        <div className="min-w-[620px]">
          {/* Hours Header */}
          <div className="flex items-center pl-10 mb-1 text-[9px] font-mono text-slate-400">
            {hours.map((h) => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* 7 Days Rows */}
          <div className="space-y-1.5">
            {days.map((dayName, dayIdx) => (
              <div key={dayName} className="flex items-center gap-1.5">
                <span className="w-8 text-[11px] font-bold text-slate-500 shrink-0">
                  {dayName}
                </span>

                <div className="flex items-center gap-1 flex-1">
                  {hours.map((h) => {
                    const pt = points.find(
                      (p) => p.dayIndex === dayIdx && p.hour === h
                    ) || { dayIndex: dayIdx, hour: h, count: 0, riskCount: 0 };

                    return (
                      <div
                        key={h}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={`flex-1 h-5 rounded-xs transition-colors cursor-pointer ${getColor(
                          pt.count,
                          pt.riskCount
                        )}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="mt-3 p-2.5 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-lg">
            <span className="font-bold">
              {days[hoveredPoint.dayIndex]}, {hoveredPoint.hour}:00 - {hoveredPoint.hour + 1}:00
            </span>
            <div className="flex items-center gap-3">
              <span>{hoveredPoint.count} total events logged</span>
              {hoveredPoint.riskCount > 0 && (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {hoveredPoint.riskCount} security flags
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
