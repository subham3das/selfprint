import React from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { AuditLogEvent } from '../types/audit.types';

import { SeverityBadge } from './SeverityBadge';
import { AuditActionBadge } from './AuditActionBadge';

interface AuditTimelineProps {
  timelineGroups: { title: string; events: AuditLogEvent[] }[];
  onEventClick: (event: AuditLogEvent) => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  timelineGroups,
  onEventClick
}) => {
  return (
    <div className="space-y-6">
      {timelineGroups.map((group) => (
        <div
          key={group.title}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs"
        >
          {/* Group Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {group.events.length} events
            </span>
          </div>

          {/* Timeline Feed */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {group.events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onEventClick(evt)}
                className="relative flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer group"
              >
                {/* Node Dot */}
                <div
                  className={`absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-white shadow-2xs ${
                    evt.severity === 'Critical' || evt.severity === 'Security'
                      ? 'bg-rose-500 ring-2 ring-rose-200'
                      : evt.severity === 'Warning'
                      ? 'bg-amber-500 ring-2 ring-amber-200'
                      : 'bg-indigo-600 ring-2 ring-indigo-200'
                  }`}
                />

                {/* Left Content */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl ${evt.actorAvatarBg} text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
                  >
                    {evt.actorAvatarText}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">
                        {evt.actorName}
                      </span>
                      <AuditActionBadge action={evt.action} />
                      <SeverityBadge severity={evt.severity} />
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {evt.details}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.timestamp}
                      </span>
                      <span>• IP: {evt.ipAddress}</span>
                      <span>• {evt.location.city}, {evt.location.countryCode}</span>
                    </div>
                  </div>
                </div>

                {/* Right Inspect Trigger */}
                <div className="shrink-0 flex items-center text-slate-400 group-hover:text-indigo-600 transition-colors pt-2">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
