import React from 'react';
import { Layers } from 'lucide-react';
import { PaperUsageItem } from '../types/analytics.types';

interface PaperUsageCardProps {
  paperStats: PaperUsageItem[];
}

export const PaperUsageCard: React.FC<PaperUsageCardProps> = ({ paperStats }) => {
  const rawStats = paperStats || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Most Used Paper Sizes
        </h3>
      </div>

      {/* Progress Bars List or Empty State */}
      {rawStats.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-1 my-auto">
          <Layers className="w-6 h-6 text-slate-300" />
          <p className="text-[11px] font-semibold">No paper data</p>
        </div>
      ) : (
        <div className="space-y-3 my-1">
          {rawStats.map((item, idx) => {
            const maxUsage = rawStats[0]?.usage || 1;
            const barWidth = Math.max(5, (item.usage / maxUsage) * 100);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{item.paperSize}</span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-slate-700 font-bold">
                      {item.usage.toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
