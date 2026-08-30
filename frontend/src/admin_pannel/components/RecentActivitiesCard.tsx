import React from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  Heart
} from 'lucide-react';
import { RecentActivityItem } from '../types/support.types';

interface RecentActivitiesCardProps {
  activities: RecentActivityItem[];
}

export const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ activities }) => {
  const getIconMeta = (type: RecentActivityItem['iconType']) => {
    switch (type) {
      case 'receipt':
        return { icon: FileText, bg: 'bg-emerald-50 text-emerald-600' };
      case 'user':
        return { icon: UserCheck, bg: 'bg-amber-50 text-amber-600' };
      case 'check':
        return { icon: CheckCircle2, bg: 'bg-purple-50 text-purple-600' };
      case 'clock':
        return { icon: Clock, bg: 'bg-sky-50 text-sky-600' };
      case 'heart':
      default:
        return { icon: Heart, bg: 'bg-rose-50 text-rose-500' };
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
        <button
          type="button"
          onClick={() => alert('Viewing all activity audit logs')}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 mt-2">
        {activities.map((act) => {
          const { icon: Icon, bg } = getIconMeta(act.iconType);

          return (
            <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-snug">
                    {act.description}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap pt-0.5">
                {act.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
