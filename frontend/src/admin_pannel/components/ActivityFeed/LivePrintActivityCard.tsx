import React from 'react';
import { Store } from 'lucide-react';
import { LivePrintActivityItem } from '../../types/admin.types';

interface LivePrintActivityCardProps {
  activities: LivePrintActivityItem[];
  onViewAll?: () => void;
}

const getStatusColor = (status: LivePrintActivityItem['status']) => {
  switch (status) {
    case 'Printing':
      return {
        text: 'text-indigo-600',
        chipBg: 'bg-indigo-50',
        dot: 'bg-indigo-600',
        subText: 'text-indigo-600'
      };
    case 'Completed':
      return {
        text: 'text-emerald-600',
        chipBg: 'bg-emerald-50',
        dot: 'bg-emerald-600',
        subText: 'text-emerald-600'
      };
    case 'Processing':
      return {
        text: 'text-amber-600',
        chipBg: 'bg-amber-50',
        dot: 'bg-amber-500',
        subText: 'text-amber-600'
      };
    default:
      return {
        text: 'text-slate-600',
        chipBg: 'bg-slate-50',
        dot: 'bg-slate-500',
        subText: 'text-slate-600'
      };
  }
};

export const LivePrintActivityCard: React.FC<LivePrintActivityCardProps> = ({
  activities,
  onViewAll
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">Live Print Activity</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="flex flex-col divide-y divide-slate-100/80 mt-1">
        {activities.map((act) => {
          const colors = getStatusColor(act.status);

          return (
            <div
              key={act.id}
              className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60 rounded-xl px-1.5 transition-colors"
            >
              {/* Left: Store Icon + Store Name & Status */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100/90 text-slate-600 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {act.storeName}
                  </p>
                  <p className={`text-[11px] font-semibold ${colors.subText}`}>
                    {act.status}
                  </p>
                </div>
              </div>

              {/* Center: File Name */}
              <div className="text-center min-w-0 hidden sm:block">
                <span className="text-xs text-slate-600 font-medium truncate block max-w-[130px]">
                  {act.fileName}
                </span>
              </div>

              {/* Right: Progress & Status Chip */}
              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <span className="text-xs text-slate-500 font-medium">
                  {act.pageProgress}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.chipBg} ${colors.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  <span>{act.status}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
