import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AuditLogEvent } from '../types/audit.types';

import { SeverityBadge } from './SeverityBadge';

interface LiveEventsFeedProps {
  events: AuditLogEvent[];
  onEventClick: (event: AuditLogEvent) => void;
}

export const LiveEventsFeed: React.FC<LiveEventsFeedProps> = ({
  events,
  onEventClick
}) => {
  const latestEvents = events.slice(0, 5);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full space-y-3">
      {/* Header with Pulsing Live Indicator */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold text-slate-900">Live Activity Feed</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          REALTIME
        </span>
      </div>

      {/* Events List */}
      <div className="divide-y divide-slate-100 text-xs">
        {latestEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={() => onEventClick(evt)}
            className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl px-1.5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg ${evt.actorAvatarBg} text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {evt.actorAvatarText}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                  {evt.action}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {evt.actorName} • {evt.relativeTime}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <SeverityBadge severity={evt.severity} />
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
