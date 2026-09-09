import React from 'react';
import { Activity } from 'lucide-react';
import { PlatformEventItem } from '../types/analytics.types';

interface RecentEventsCardProps {
  events: PlatformEventItem[];
}

export const RecentEventsCard: React.FC<RecentEventsCardProps> = ({ events }) => {
  const rawEvents = events || [];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Platform Events
        </h3>
      </div>

      {/* Events Timeline List or Empty State */}
      {rawEvents.length === 0 ? (
        <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-1 my-auto">
          <Activity className="w-6 h-6 text-slate-300" />
          <p className="text-[11px] font-semibold">No recent events logged</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {rawEvents.map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${evt.colorClass}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 leading-snug truncate">
                    {typeof evt.title === 'string' ? evt.title : JSON.stringify(evt.title)}
                  </p>
                  {evt.description && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {typeof evt.description === 'string'
                        ? evt.description
                        : typeof evt.description === 'object'
                        ? JSON.stringify(evt.description)
                        : String(evt.description)}
                    </p>
                  )}
                </div>
              </div>


              <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap pt-0.5">
                {evt.timestamp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
