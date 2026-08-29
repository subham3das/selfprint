import React from 'react';
import { Check, Printer, Clock, ArrowRight } from 'lucide-react';
import { ActivityItem } from '../types/dashboard.types';

interface ActivityCardProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activities,
  onViewAll
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'info':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4 stroke-[2]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Today's Activity
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-4 mt-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {getActivityIcon(act.type)}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    <span className="font-bold">{act.jobCode}</span> {act.action}
                  </p>
                  <p className="text-xs text-slate-400 font-normal mt-0.5 truncate">
                    {act.fileName}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0 font-normal">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
