import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

interface QueueActionsCardProps {
  onClearCompleted: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const QueueActionsCard: React.FC<QueueActionsCardProps> = ({
  onClearCompleted,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm space-y-3">
      {/* Header */}
      <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
        Queue Actions
      </h2>

      {/* Clear Completed Jobs */}
      <button
        onClick={onClearCompleted}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 hover:text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
      >
        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
        <span>Clear Completed Jobs</span>
      </button>

      {/* Refresh Queue */}
      <button
        onClick={onRefresh}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
      >
        <RefreshCw
          className={`w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors ${
            isRefreshing ? 'animate-spin text-indigo-600' : ''
          }`}
        />
        <span>Refresh Queue</span>
      </button>
    </div>
  );
};
