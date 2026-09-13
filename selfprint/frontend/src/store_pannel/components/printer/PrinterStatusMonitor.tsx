import React, { useState } from 'react';
import {
  Printer,
  Pause,
  Play,
  Settings,
  FileText,
  Droplet,
  Sliders,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

import {
  DetectedPrinter,
  PrinterNotificationItem
} from '../../types/printerSetup.types';
import { PrinterStatusInfo } from '../../types/dashboard.types';
import { PrinterSettingsModal } from '../PrinterSettingsModal';

interface PrinterStatusMonitorProps {
  printer: DetectedPrinter | PrinterStatusInfo;
  isConfigured?: boolean;
  isPaused: boolean;
  isTestMode?: boolean;
  isConnectorOnline?: boolean;
  connectionState?: string;
  onRefreshConnector?: () => Promise<boolean | void>;
  onTogglePause: () => void;
  onRunTestPrint: () => Promise<void>;
  onSoftRestart?: () => Promise<void>;
  onRestartSpooler?: () => Promise<void>;
  onTriggerEvent?: (eventType: any) => void;
  onOpenWizard: () => void;
  onPushNotification?: (
    notification: Omit<PrinterNotificationItem, 'id' | 'timestamp'>
  ) => void;
}

export const PrinterStatusMonitor: React.FC<PrinterStatusMonitorProps> = ({
  printer,
  isConfigured,
  isPaused,
  isTestMode = false,
  isConnectorOnline,
  connectionState: _connectionState,
  onRefreshConnector,
  onTogglePause,
  onRunTestPrint: _onRunTestPrint,
  onSoftRestart: _onSoftRestart,
  onRestartSpooler: _onRestartSpooler,
  onTriggerEvent: _onTriggerEvent,
  onOpenWizard
}) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [_isTesting, _setIsTesting] = useState(false);
  const [_testPrintSuccess, _setTestPrintSuccess] = useState(false);

  const getStatusColor = () => {
    if (isPaused) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Paused'
      };
    }

    const rawStatus = ((printer as any).status || (printer as any).printerStatus || '').toLowerCase();

    if (rawStatus.includes('online') || rawStatus === 'ready') {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Ready & Online'
      };
    }

    if (rawStatus.includes('printing')) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Printing'
      };
    }

    if (rawStatus.includes('error') || rawStatus.includes('jam')) {
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Hardware Error'
      };
    }

    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      label: 'Disconnected'
    };
  };

  const status = getStatusColor();

  const isPrinterVirtual = Boolean(
    (printer as any).isVirtual ||
    (printer as any).testMode ||
    printer.name?.toLowerCase().includes('virtual') ||
    printer.name?.toLowerCase().includes('print to pdf') ||
    (printer as any).model?.toLowerCase().includes('virtual')
  );

  const isPrinterConnected =
    isConfigured !== false &&
    Boolean(
      printer &&
      printer.id &&
      printer.id !== 'offline-placeholder' &&
      printer.name &&
      printer.name !== 'No printer connected' &&
      printer.name !== 'No printer configured' &&
      (printer as any).status !== 'Not Configured' &&
      (printer as any).printerStatus !== 'Not Configured'
    );

  // 0. Connector Offline State (Backend indicates no heartbeat received within 15s)
  if (isConnectorOnline === false) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-h-[280px]">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">Desktop Connector Offline</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              No Heartbeat
            </span>
          </div>

          <div className="py-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs border border-rose-100">
              <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">
              Connector Offline
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px] mx-auto">
              No active heartbeat received from Desktop Connector within 15 seconds. Physical printers cannot be reached until the app is open.
            </p>
          </div>

          <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-[9px]">1</span>
              <span>Download & install SelfPrint Connector</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[9px]">2</span>
              <span>Start Desktop application in Windows</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[9px]">3</span>
              <span>Hardware automatically syncs live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={onOpenWizard}
            className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Setup Connector</span>
          </button>
          {onRefreshConnector && (
            <button
              type="button"
              onClick={() => onRefreshConnector()}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Refresh Connector Status"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 1. Unconfigured State
  if (!isPrinterConnected) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[280px] group hover:border-purple-300 transition-all">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3.5 shadow-xs">
          <Printer className="w-7 h-7 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          No Physical Printer Connected
        </h3>
        <p className="text-xs text-slate-500 max-w-[240px] mb-5 leading-relaxed">
          No physical printer has been configured for this store yet. Connect your printer to start accepting print jobs.
        </p>
        <button
          type="button"
          onClick={onOpenWizard}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
        >
          <Sliders className="w-4 h-4" />
          <span>Setup Printer</span>
        </button>
      </div>
    );
  }

  // 2. Disconnected Later State
  if (status.label === 'Disconnected' || status.label === 'Offline') {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[280px] group transition-all">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 shadow-xs border border-rose-100">
          <AlertTriangle className="w-7 h-7 stroke-[1.8]" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Printer Disconnected
        </h3>
        <p className="text-xs text-slate-500 max-w-[260px] mb-5 leading-relaxed">
          {printer.name} is currently unreachable. Check your USB cable or wireless connection.
        </p>
        <button
          type="button"
          onClick={onOpenWizard}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reconnect Printer</span>
        </button>
      </div>
    );
  }

  const rawPaper = (printer as any).paperLevel ?? (printer as any).paperPercentage ?? null;
  const rawToner = (printer as any).inkLevels?.black ?? (printer as any).tonerPercentage ?? null;
  const hasTelemetry = rawPaper !== null || rawToner !== null;
  const paperLevel = rawPaper ?? 0;
  const tonerLevel = rawToner ?? 0;

  const port = (printer as any).port || (printer as any).ipAddress || 'USB';
  const connection = (printer as any).connection || (printer as any).connectionStatus || 'USB';

  return (
    <>
      {/* Dashboard Status Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full group hover:border-purple-300 transition-all">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    {isTestMode && isPrinterVirtual ? 'Virtual Printer' : 'Hardware Status'}
                  </h3>
                  {Boolean((printer as any).isVirtual || printer.name?.toLowerCase().includes('virtual') || printer.name?.toLowerCase().includes('print to pdf')) && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                      🧪 Test Mode
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {port}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform hover:scale-105 cursor-pointer ${status.bg} ${status.text} ${status.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${status.dot}`} />
              <span>{status.label}</span>
            </button>
          </div>

          {/* Center Graphic & Telemetry */}
          <div className="py-4 flex flex-col items-center justify-center text-center">
            {/* SVG Printer Graphic */}
            <div className="w-28 h-20 relative flex items-center justify-center mb-2">
              <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <ellipse cx="80" cy="110" rx="65" ry="8" fill="#E2E8F0" />
                <rect x="20" y="50" width="120" height="55" rx="12" fill="#1E293B" />
                <rect x="35" y="15" width="90" height="40" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
                <rect x="42" y="70" width="76" height="8" rx="4" fill="#0EA5E9" />
                <circle cx="125" cy="65" r="4" fill={status.label.includes('Online') || status.label.includes('Ready') ? '#10B981' : '#EF4444'} />
                <rect x="38" y="90" width="84" height="22" rx="4" fill="#F1F5F9" />
              </svg>
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm">
              {printer.name}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {printer.model} • {connection}
            </p>
          </div>

          {/* Paper & Ink Gauges or Driver Status */}
          {hasTelemetry ? (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* Paper Level */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-600" />
                    Paper
                  </span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {paperLevel}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      paperLevel > 30 ? 'bg-purple-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${paperLevel}%` }}
                  />
                </div>
              </div>

              {/* Ink / Toner Level */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-cyan-600" />
                    Toner
                  </span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {tonerLevel}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tonerLevel > 25 ? 'bg-cyan-600' : 'bg-rose-500'
                    }`}
                    style={{ width: `${tonerLevel}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-center pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 font-medium">
                Hardware Spooler Connected • Ready for Cloud Jobs
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              isPaused
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-emerald-700" /> : <Pause className="w-3.5 h-3.5 fill-slate-700" />}
            <span>{isPaused ? 'Resume Spooler' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDetailsModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors cursor-pointer"
            title="Printer Settings & Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Production Diagnostics & Settings Modal */}
      <PrinterSettingsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        printer={{
          name: printer.name,
          model: printer.model,
          isOnline: status.label.includes('Online') || status.label.includes('Ready'),
          connectionStatus: status.label.includes('Online') || status.label.includes('Ready') ? 'Connected' : 'Disconnected',
          printerStatus: status.label.includes('Online') || status.label.includes('Ready') ? 'Ready' : 'Offline',
          paperSize: 'A4',
          tonerPercentage: tonerLevel,
          paperPercentage: paperLevel,
          ipAddress: port
        }}
        isPaused={isPaused}
        onTogglePause={onTogglePause}
      />
    </>
  );
};
