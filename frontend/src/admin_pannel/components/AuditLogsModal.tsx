import React, { useState } from 'react';
import { X, History, Search, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AccessAuditLog } from '../types/access.types';


interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AccessAuditLog[];
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.actorName.toLowerCase().includes(q) ||
      l.actorEmail.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.targetEmail.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.ipAddress.includes(q)
    );
  });

  const getStatusIcon = (status: AccessAuditLog['status']) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'Failed':
      default:
        return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Access & Security Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Realtime ledger of admin logins, role changes, privilege updates, and account actions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit logs by actor, action, target email or IP..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 border-b border-slate-200">
                <th className="py-2.5 pl-6 pr-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Admin</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Account</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 pr-6 pl-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-6 pr-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{log.actorName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(log.status)}
                      <span className="font-bold text-slate-800 text-[11px]">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                    {log.targetEmail}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 pr-6 pl-3 text-right font-mono text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredLogs.length} audit entries recorded</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
