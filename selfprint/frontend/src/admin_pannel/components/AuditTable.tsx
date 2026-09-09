import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Laptop,
  Smartphone,
  Server,
  ShieldCheck
} from 'lucide-react';
import { AuditLogEvent } from '../types/audit.types';
import { SeverityBadge } from './SeverityBadge';
import { AuditStatusBadge } from './AuditStatusBadge';
import { AuditActionBadge } from './AuditActionBadge';

interface AuditTableProps {
  logs: AuditLogEvent[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick: (event: AuditLogEvent) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  logs,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onRowClick
}) => {
  const startIdx = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  const getDeviceIcon = (dev?: AuditLogEvent['clientInfo']['device']) => {
    switch (dev) {
      case 'Mobile':
        return <Smartphone className="w-3 h-3 text-slate-400" />;
      case 'Server':
        return <Server className="w-3 h-3 text-slate-400" />;
      case 'Desktop':
      default:
        return <Laptop className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
              <th className="py-3.5 pl-4 sm:pl-5 pr-3 min-w-[150px]">Timestamp</th>
              <th className="py-3.5 px-3 min-w-[180px]">Actor / User</th>
              <th className="py-3.5 px-3 min-w-[150px]">Action</th>
              <th className="py-3.5 px-3 min-w-[100px]">Module</th>
              <th className="py-3.5 px-3 min-w-[170px] hidden md:table-cell">Target Resource</th>
              <th className="py-3.5 px-3 min-w-[150px] hidden lg:table-cell">IP & Location</th>
              <th className="py-3.5 px-3 min-w-[90px]">Severity</th>
              <th className="py-3.5 px-3 min-w-[100px]">Status</th>
              <th className="py-3.5 pr-4 sm:pr-5 pl-2 text-right min-w-[60px]">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`aud-row-skel-${idx}`} className="animate-pulse">
                  <td className="py-3.5 pl-4 sm:pl-5 pr-3">
                    <div className="w-20 h-3 bg-slate-200 rounded" />
                    <div className="w-12 h-2.5 bg-slate-100 rounded mt-1.5" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
                      <div>
                        <div className="w-20 h-3 bg-slate-200 rounded" />
                        <div className="w-16 h-2 bg-slate-100 rounded mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-14 h-5 bg-slate-100 rounded-md" />
                  </td>
                  <td className="py-3.5 px-3 hidden md:table-cell">
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3 hidden lg:table-cell">
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 pr-4 sm:pr-5 pl-2 text-right">
                    <div className="w-5 h-5 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldCheck className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No audit records found</p>
                    <p className="text-xs text-slate-400">Platform telemetry and actions will appear here in real-time.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => onRowClick(evt)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Timestamp */}
                  <td className="py-3 pl-4 sm:pl-5 pr-3">
                    <p className="font-mono font-bold text-slate-800 text-[11px]">
                      {evt.timestamp.split(',')[1] || evt.timestamp}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {evt.relativeTime}
                    </p>
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${evt.actorAvatarBg || 'bg-indigo-600'} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {evt.actorAvatarText || 'AD'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {evt.actorName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {evt.actorEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3">
                    <AuditActionBadge action={evt.action as any} />
                  </td>

                  {/* Module */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {evt.module}
                    </span>
                  </td>

                  {/* Target Resource */}
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="font-mono text-slate-700 text-xs truncate block max-w-[160px]" title={evt.targetResource}>
                      {evt.targetResource}
                    </span>
                  </td>

                  {/* IP & Location */}
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {getDeviceIcon(evt.clientInfo?.device)}
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-slate-800 text-[11px] block truncate">
                          {evt.ipAddress}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {evt.location?.city || 'Guwahati'}, {evt.location?.countryCode || 'IN'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-3">
                    <SeverityBadge severity={evt.severity} />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <AuditStatusBadge status={evt.status} />
                  </td>

                  {/* Inspect Button */}
                  <td className="py-3 pr-4 sm:pr-5 pl-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(evt);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Inspect Event"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-mono">{startIdx}</strong> to{' '}
            <strong className="text-slate-800 font-mono">{endIdx}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{totalCount}</strong> logs
          </span>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-slate-400 text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Navigators */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <span className="px-2 font-mono font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
