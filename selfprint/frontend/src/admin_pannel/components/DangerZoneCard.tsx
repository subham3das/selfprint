import React from 'react';
import { Trash2, RotateCcw, AlertOctagon, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="pb-3 border-b border-rose-100 mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Destructive platform operations tracked in the security audit ledger.
            </p>
          </div>
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
                  Purge Application Cache
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Flush Redis caches, socket pools & temporary buffer files
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearCache}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
            >
              Clear Cache
            </button>
          </div>

          {/* Reset All Settings */}
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Reset Global Settings
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Restore all platform rules and thresholds to factory defaults
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetSettings}
              className="px-3 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
            >
              Reset All
            </button>
          </div>

          {/* Delete Platform Data */}
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-rose-900 text-xs truncate">
                  Purge Test & Demo Records
                </p>
                <p className="text-[10px] text-rose-500 truncate">
                  Clean mock store orders and test print telemetry
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDeleteData}
              className="px-3 py-1.5 border border-rose-300 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              Purge Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
