import React from 'react';
import { Trash2, RotateCcw, AlertOctagon } from 'lucide-react';

interface DangerZoneCardProps {
  onClearCache: () => void;
  onResetSettings: () => void;
  onDeleteData: () => void;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  onClearCache,
  onResetSettings,
  onDeleteData
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-sm font-bold text-slate-900">Danger Zone</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Irreversible and destructive actions.
        </p>
      </div>

      {/* Actions List */}
      <div className="divide-y divide-slate-100 text-xs">
        {/* Clear Cache */}
        <div className="py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">
                Clear Cache
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Clear system cache and temporary data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearCache}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Clear
          </button>
        </div>

        {/* Reset All Settings */}
        <div className="py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">
                Reset All Settings
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Reset all settings to default values
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetSettings}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Reset
          </button>
        </div>

        {/* Delete Platform Data */}
        <div className="py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">
                Delete Platform Data
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDeleteData}
            className="px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
