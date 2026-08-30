import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Shield,
  Globe,
  Code,
  Download
} from 'lucide-react';
import { AuditLogEvent } from '../types/audit.types';

import { SeverityBadge } from './SeverityBadge';
import { AuditStatusBadge } from './AuditStatusBadge';
import { AuditActionBadge } from './AuditActionBadge';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditLogEvent | null;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatJSON = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  {event.id}
                </span>
                <SeverityBadge severity={event.severity} />
                <AuditStatusBadge status={event.status} />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-1">
                Audit Event Details
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Event Summary Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <AuditActionBadge action={event.action} />
                <span className="font-mono text-[11px] text-slate-500 font-semibold">
                  {event.executionTimeMs}ms execution
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {event.details}
              </p>
            </div>

            {/* Actor Profile Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Initiating Actor</span>
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${event.actorAvatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {event.actorAvatarText}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {event.actorName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {event.actorEmail}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {event.actorRole}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Session: {event.sessionId}
                  </p>
                </div>
              </div>
            </div>

            {/* Network & Telemetry Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Network & Client Telemetry</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* IP Address */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    IP Address
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {event.ipAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(event.ipAddress, 'ip')}
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      title="Copy IP"
                    >
                      {copiedKey === 'ip' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Geolocation */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Geolocation
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-1 truncate">
                    {event.location.city}, {event.location.country} ({event.location.countryCode})
                  </p>
                </div>

                {/* Client Device & OS */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Device & OS
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-1 truncate">
                    {event.clientInfo.device} • {event.clientInfo.os}
                  </p>
                </div>

                {/* Browser Client */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Browser
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-1 truncate">
                    {event.clientInfo.browser}
                  </p>
                </div>
              </div>
            </div>

            {/* State Change Diff (if old/new value exists) */}
            {(event.oldValue || event.newValue) && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-600" />
                  <span>State Modification (Diff)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto">
                  {/* Before */}
                  <div>
                    <span className="text-rose-400 font-bold block mb-1 text-[10px]">
                      - Previous Value:
                    </span>
                    <pre className="text-slate-300">
                      {formatJSON(event.oldValue || 'None')}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="border-l border-slate-700 pl-3">
                    <span className="text-emerald-400 font-bold block mb-1 text-[10px]">
                      + New Value:
                    </span>
                    <pre className="text-slate-100">
                      {formatJSON(event.newValue || 'None')}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Request Payload */}
            {event.requestPayload && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Raw Request Payload</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(formatJSON(event.requestPayload), 'payload')
                    }
                    className="text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedKey === 'payload' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto">
                  <pre>{formatJSON(event.requestPayload)}</pre>
                </div>
              </div>
            )}

            {/* Response Summary */}
            {event.responseSummary && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Response Telemetry
                </span>
                <p className="font-mono text-slate-800 font-semibold text-xs">
                  {event.responseSummary}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Timestamp: <strong className="text-slate-700">{event.timestamp}</strong>
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(event, null, 2), 'event')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedKey === 'event' ? 'Copied JSON!' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
