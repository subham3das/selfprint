import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { LoginLocationPoint } from '../types/audit.types';


interface LoginLocationMapProps {
  locations: LoginLocationPoint[];
}

export const LoginLocationMap: React.FC<LoginLocationMapProps> = ({ locations }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Regional Login & Session Telemetry
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographical origins of recent active administrator sessions
          </p>
        </div>
        <Globe className="w-4 h-4 text-indigo-600" />
      </div>

      {/* Locations List */}
      <div className="divide-y divide-slate-100 text-xs">
        {locations.map((loc) => {
          const hasThreats = loc.failedAttempts > 0;

          return (
            <div
              key={loc.id}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    hasThreats
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                    <span>{loc.city}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({loc.countryCode})
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {loc.state ? `${loc.state}, ` : ''}{loc.country}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-2 justify-end">
                  {loc.activeSessions > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {loc.activeSessions} Active
                    </span>
                  )}
                  {loc.failedAttempts > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {loc.failedAttempts} Blocked
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Last: {loc.lastActive}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
