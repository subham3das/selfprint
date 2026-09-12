import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Laptop,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Clock
} from 'lucide-react';
import { printerService } from '../../services/printer.service';
import { getSocket } from '@/lib/socket';
import { useStoreSession } from '../../hooks/useStoreSession';

interface ConnectorTelemetry {
  paired: boolean;
  status: 'ONLINE' | 'OFFLINE';
  state: string;
  storeName: string;
  hostname: string;
  machineId?: string;
  socketConnected: boolean;
  authenticated: boolean;
  hostRunning: boolean;
  physicalPrinters: number;
  lastHeartbeat?: string;
  diffSeconds?: number;
}

export const PrinterConnectorSettingsCard: React.FC = () => {
  const storeInfo = useStoreSession();
  const storeId = storeInfo?.id;

  // Live connector state
  const [telemetry, setTelemetry] = useState<ConnectorTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pairing code state
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>(600);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [installerInfo, setInstallerInfo] = useState<{ version: string; sizeMB: string; fileName: string } | null>(null);
  const [isUnpairing, setIsUnpairing] = useState(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Fetch live status strictly from backend (never localhost) ───────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await printerService.getConnectorStatus(storeId);
      if (res) {
        const raw = res.connector;
        const diffMs = res.lastHeartbeat ? Date.now() - new Date(res.lastHeartbeat).getTime() : 999999;
        const diffSec = Math.max(0, Math.round(diffMs / 1000));

        setTelemetry({
          paired: res.paired,
          status: res.isOnline ? 'ONLINE' : 'OFFLINE',
          state: res.state,
          storeName: raw?.storeName || storeInfo?.name || 'SelfPrint Store',
          hostname: raw?.hostname || 'DESKTOP-ASUS',
          machineId: raw?.machineId,
          socketConnected: res.socketConnected,
          authenticated: res.authenticated,
          hostRunning: Boolean(raw?.hostRunning),
          physicalPrinters: res.printerCount || 0,
          lastHeartbeat: res.lastHeartbeat,
          diffSeconds: diffSec
        });
      }
    } catch (err) {
      console.warn('Failed to fetch connector status from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, storeInfo?.name]);

  // ─── Generate 10-minute pairing code strictly from backend ───────────────
  const handleGenerateCode = useCallback(async () => {
    setIsGeneratingCode(true);
    setCodeError(null);
    try {
      const res = await printerService.generatePairingCode(storeId);
      const code = res.code || res.pairingCode;
      const seconds = res.expiresInSeconds || 600;

      setPairingCode(code);
      setExpiresInSeconds(seconds);

      // Start countdown
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setExpiresInSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setCodeError(err?.message || 'Failed to generate connector code');
    } finally {
      setIsGeneratingCode(false);
    }
  }, [storeId]);

  // ─── Unpair / Revoke Connector ───────────────────────────────────────────
  const handleUnpair = useCallback(async () => {
    if (!window.confirm('Are you sure you want to disconnect this Desktop Connector? You will need to pair it again with a new code.')) {
      return;
    }
    setIsUnpairing(true);
    try {
      await printerService.unpairConnector(storeId);
      await fetchStatus();
      handleGenerateCode();
    } catch (err) {
      console.error('Failed to unpair:', err);
    } finally {
      setIsUnpairing(false);
    }
  }, [storeId, fetchStatus, handleGenerateCode]);

  // Initial load
  useEffect(() => {
    fetchStatus();
    handleGenerateCode();
    printerService.getInstallerInfo().then((info) => {
      if (info) setInstallerInfo(info);
    }).catch(() => {});

    const interval = setInterval(fetchStatus, 5000);
    return () => {
      clearInterval(interval);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [fetchStatus, handleGenerateCode]);

  // ─── Real-time Socket.IO Listeners ───────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnected = () => fetchStatus();
    const handleDisconnected = () => fetchStatus();
    const handleHeartbeat = () => fetchStatus();
    const handlePrintersUpdated = () => fetchStatus();
    const handlePaired = () => fetchStatus();

    socket.on('connector_connected', handleConnected);
    socket.on('connector_disconnected', handleDisconnected);
    socket.on('connector_authenticated', handleConnected);
    socket.on('heartbeat', handleHeartbeat);
    socket.on('printers_updated', handlePrintersUpdated);
    socket.on('connector_paired', handlePaired);

    return () => {
      socket.off('connector_connected', handleConnected);
      socket.off('connector_disconnected', handleDisconnected);
      socket.off('connector_authenticated', handleConnected);
      socket.off('heartbeat', handleHeartbeat);
      socket.off('printers_updated', handlePrintersUpdated);
      socket.off('connector_paired', handlePaired);
    };
  }, [fetchStatus]);

  const copyToClipboard = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTimeAgo = (seconds?: number) => {
    if (seconds === undefined) return '—';
    if (seconds < 5) return '2 seconds ago';
    if (seconds < 60) return `${seconds} seconds ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  };

  const isConnected = Boolean(
    telemetry?.paired &&
    telemetry?.status === 'ONLINE' &&
    (telemetry?.diffSeconds !== undefined && telemetry.diffSeconds < 15)
  );

  return (
    <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Desktop Connector</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production hardware bridge linking local print spoolers to the cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {telemetry?.paired && (
            <button
              onClick={handleUnpair}
              disabled={isUnpairing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50"
            >
              <span>{isUnpairing ? 'Unpairing...' : 'Unpair Connector'}</span>
            </button>
          )}
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {isConnected ? (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-emerald-900">Connected</h3>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              Desktop Connector is online and synchronizing hardware printers in real-time.
            </p>
          </div>
        </div>
      ) : telemetry?.paired && !telemetry?.hostRunning ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-900">Host Service Offline</h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Printers unavailable. Please launch the SelfPrint Connector application on your Windows machine.
            </p>
          </div>
        </div>
      ) : telemetry?.paired ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-900">Connector Offline</h3>
            <p className="text-xs text-rose-700 mt-0.5">
              No heartbeat received in &gt;15s. Last seen: {formatTimeAgo(telemetry.diffSeconds)}.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Not Connected</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This computer has not been linked yet. Use the code below to pair your desktop connector.
            </p>
          </div>
        </div>
      )}

      {/* ── Two-Column: Telemetry or Pairing Code ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Column 1: Live Hardware Telemetry */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Connection Telemetry
          </h4>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
            <div className="py-2.5 flex items-center justify-between first:pt-0">
              <span className="text-slate-500">Status</span>
              <span className={`font-bold flex items-center gap-1.5 ${isConnected ? 'text-emerald-600' : 'text-slate-700'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {isConnected ? 'Connected' : telemetry?.paired ? 'Offline' : 'Not Connected'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Store</span>
              <span className="font-semibold text-slate-900">{telemetry?.storeName || storeInfo?.name || '—'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Machine</span>
              <span className="font-mono font-semibold text-slate-800">{telemetry?.hostname || '—'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Socket</span>
              <span className={`font-semibold ${telemetry?.socketConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                {telemetry?.socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Backend</span>
              <span className={`font-semibold ${telemetry?.authenticated ? 'text-emerald-600' : 'text-amber-600'}`}>
                {telemetry?.authenticated ? 'Authenticated' : 'Pending'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Host Service</span>
              <span className={`font-semibold ${telemetry?.hostRunning ? 'text-emerald-600' : 'text-rose-600'}`}>
                {telemetry?.hostRunning ? 'Running' : 'Stopped'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Physical Printers</span>
              <span className="font-bold text-slate-900">{telemetry?.physicalPrinters || 0}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between last:pb-0">
              <span className="text-slate-500">Last Heartbeat</span>
              <span className="font-medium text-slate-600">{formatTimeAgo(telemetry?.diffSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Pairing Code & Link Action */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Connector Code
          </h4>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/5 via-slate-50 to-slate-100 border border-slate-200/90 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Single-Use Pairing Code
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="px-5 py-3 rounded-xl bg-white border border-slate-300 font-mono text-2xl font-black tracking-widest text-slate-900 shadow-inner select-all">
                  {pairingCode || '••••••'}
                </div>
                <button
                  onClick={copyToClipboard}
                  disabled={!pairingCode}
                  className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Timer and Regenerate */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Valid for: <strong className="text-slate-800">{formatTimer(expiresInSeconds)}</strong>
                </span>
              </div>

              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                <span>Generate New Code</span>
              </button>
            </div>

            {codeError && (
              <p className="text-xs text-rose-600 font-medium">{codeError}</p>
            )}

            {/* Download Link */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">SelfPrint Desktop Connector</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      v{installerInfo?.version || '1.0.0'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {installerInfo?.sizeMB || '85 MB'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Windows 10 / 11 (64-bit) installer with auto-restarting background spooler.
                  </p>
                </div>
                <a
                  href={printerService.getInstallerDownloadUrl()}
                  download="SelfPrint-Connector-Setup.exe"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-medium text-xs shadow-sm hover:shadow transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Setup.exe</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterConnectorSettingsCard;
