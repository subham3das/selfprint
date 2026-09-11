import React from 'react';
import { Minus, Square, X, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const TitleBar: React.FC = () => {
  const isLocalConnected = useAppStore((s) => s.isLocalConnected);
  const isBackendConnected = useAppStore((s) => s.isBackendConnected);

  const handleMinimize = () => {
    (window as any).electronAPI?.minimize();
  };

  const handleMaximize = () => {
    (window as any).electronAPI?.maximize();
  };

  const handleClose = () => {
    (window as any).electronAPI?.close();
  };

  return (
    <header className="h-10 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between px-3 select-none app-drag-region z-50">
      {/* Brand & Connection State */}
      <div className="flex items-center gap-2.5 app-no-drag">
        <img
          src="/logoapp.png"
          alt="SelfPrint Logo"
          className="w-5 h-5 object-contain rounded-md drop-shadow-md"
        />
        <span className="font-semibold text-xs tracking-wide text-slate-200">
          SelfPrint <span className="text-blue-400 font-normal">Connector</span>
        </span>

        {/* Live Status Beacon */}
        <div className="flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              isLocalConnected
                ? isBackendConnected
                  ? 'bg-emerald-400 shadow-glow-emerald'
                  : 'bg-amber-400'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {isLocalConnected
              ? isBackendConnected
                ? 'Backend Connected'
                : 'Host Service Running'
              : 'Host Service Offline'}
          </span>
        </div>
      </div>

      {/* Center Subtitle */}
      <div className="text-[11px] text-slate-500 font-mono hidden md:flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-slate-400" />
        Hardware Bridge Daemon
      </div>

      {/* Windows Controls */}
      <div className="flex items-center app-no-drag">
        <button
          onClick={handleMinimize}
          title="Minimize"
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-850 rounded-lg transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          title="Maximize"
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-850 rounded-lg transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          title="Close (Minimize to Tray)"
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
