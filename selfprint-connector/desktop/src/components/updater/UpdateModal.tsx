import React from 'react';
import { Sparkles, RefreshCw, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const UpdateModal: React.FC = () => {
  const isUpdateModalOpen = useAppStore((s) => s.isUpdateModalOpen);
  const setUpdateModalOpen = useAppStore((s) => s.setUpdateModalOpen);
  const updateStatus = useAppStore((s) => s.updateStatus);

  if (!isUpdateModalOpen || updateStatus.state !== 'DOWNLOADED') {
    return null;
  }

  const handleRestartNow = () => {
    if ((window as any).electronAPI?.restartAndInstall) {
      (window as any).electronAPI.restartAndInstall();
    }
  };

  const handleLater = () => {
    setUpdateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-2xl shadow-blue-500/10 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 leading-none">
                New version downloaded
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Version v{updateStatus.latestVersion || 'latest'} is ready to install.
              </p>
            </div>
          </div>
          <button
            onClick={handleLater}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Installed Version:</span>
            <span className="text-slate-200">v{updateStatus.currentVersion}</span>
          </div>
          <div className="flex items-center justify-between text-blue-400 font-mono font-semibold">
            <span>Target Version:</span>
            <span>v{updateStatus.latestVersion}</span>
          </div>
          {updateStatus.releaseNotes && (
            <div className="pt-2 border-t border-slate-800/80 mt-2 max-h-32 overflow-y-auto text-[11px] text-slate-400 whitespace-pre-line">
              {updateStatus.releaseNotes}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Restarting will briefly close the connector, apply the update, and restore your active print bridge automatically.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleLater}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleRestartNow}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restart now
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
