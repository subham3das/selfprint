import React from 'react';
import { Download, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const UpdateBanner: React.FC = () => {
  const updateStatus = useAppStore((s) => s.updateStatus);
  const setUpdateModalOpen = useAppStore((s) => s.setUpdateModalOpen);

  const { state, latestVersion, progress } = updateStatus;

  if (state === 'IDLE' || state === 'UP_TO_DATE' || state === 'ERROR') {
    return null;
  }

  const handleRestart = () => {
    if ((window as any).electronAPI?.restartAndInstall) {
      (window as any).electronAPI.restartAndInstall();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-slate-900/90 border-b border-blue-500/30 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-200 z-40 animate-fade-in shadow-md">
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {state === 'CHECKING' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="text-slate-300 font-medium">Checking for updates...</span>
          </>
        )}

        {state === 'AVAILABLE' && (
          <>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200 font-medium">
              Update Available: <span className="text-amber-300 font-semibold">v{latestVersion}</span>. Preparing download...
            </span>
          </>
        )}

        {state === 'DOWNLOADING' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Download className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">
                Downloading v{latestVersion || 'update'}:
              </span>
              <span className="font-mono text-blue-400 font-semibold">
                {progress?.percent || 0}%
              </span>
            </div>
            {/* Mini progress bar */}
            <div className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>
          </div>
        )}

        {state === 'DOWNLOADED' && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">
              Update v{latestVersion} ready to install.
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {state === 'DOWNLOADED' && (
          <>
            <button
              onClick={() => setUpdateModalOpen(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            >
              Details
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              Restart now
            </button>
          </>
        )}
      </div>
    </div>
  );
};
