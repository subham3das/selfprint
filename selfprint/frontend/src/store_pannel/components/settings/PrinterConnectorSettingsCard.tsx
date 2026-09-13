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
import { useStoreSession } from '../../hooks/useStoreSession';
import { useConnectorStore } from '../../stores/useConnectorStore';
import { getSocket, joinStoreRoom } from '@/lib/socket';

export const PrinterConnectorSettingsCard: React.FC = () => {
  const storeInfo = useStoreSession();
  const storeId = storeInfo?.id;

  // Single Source of Truth from Zustand Store
  const {
    paired,
    isOnline,
    storeName,
    hostname,
    socketConnected,
    authenticated,
    hostRunning,
    physicalPrinterCount,
    diffSeconds,
    isCheckingStatus,
    pairingCode,
    pairingExpiresInSeconds,
    isGeneratingCode,
    codeError,
    hydrate,
    manualRefresh,
    generatePairingCode: storeGenPairingCode,
    unpairConnector,
    handleSocketHeartbeat,
    handleSocketConnected,
    handleSocketDisconnected,
    handleSocketPaired,
    handleSocketUnpaired,
    handlePrintersUpdated,
    decrementCountdown
  } = useConnectorStore();

  const [isCopied, setIsCopied] = useState(false);
  const [installerInfo, setInstallerInfo] = useState<{ version: string; sizeMB: string; fileName: string } | null>(null);
  const [isUnpairing, setIsUnpairing] = useState(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Load (REST once)
  useEffect(() => {
    hydrate(storeId);
    printerService.getInstallerInfo().then((info) => {
      if (info) setInstallerInfo(info);
    }).catch(() => {});
  }, [storeId, hydrate]);

  // Generate pairing code
  const handleGenerateCode = useCallback(async () => {
    const code = await storeGenPairingCode(storeId);
    if (code) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        decrementCountdown();
      }, 1000);
    }
  }, [storeId, storeGenPairingCode, decrementCountdown]);

  // Unpair / Revoke Connector
  const handleUnpair = useCallback(async () => {
    if (!window.confirm('Are you sure you want to disconnect this Desktop Connector? You will need to pair it again with a new code.')) {
      return;
    }
    setIsUnpairing(true);
    try {
      await unpairConnector(storeId);
      handleGenerateCode();
    } catch (err) {
      console.error('Failed to unpair:', err);
    } finally {
      setIsUnpairing(false);
    }
  }, [storeId, unpairConnector, handleGenerateCode]);

  // Pure WebSocket In-Memory Event Handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (storeId) {
      joinStoreRoom(storeId);
    }

    const onHeartbeat = (d: any) => handleSocketHeartbeat(d);
    const onConnected = (d: any) => handleSocketConnected(d);
    const onDisconnected = (d: any) => handleSocketDisconnected(d);
    const onPaired = (d: any) => {
      handleSocketPaired(d);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
    const onUnpaired = () => handleSocketUnpaired();
    const onPrinters = (data: any) => {
      const raw = Array.isArray(data?.printers) ? data.printers : (Array.isArray(data) ? data : []);
      handlePrintersUpdated(raw);
    };

    socket.on('connector:heartbeat', onHeartbeat);
    socket.on('connector:connected', onConnected);
    socket.on('connector:disconnected', onDisconnected);
    socket.on('connector:updated', onConnected);
    socket.on('connector:paired', onPaired);
    socket.on('connector:unpaired', onUnpaired);
    socket.on('printer:updated', onPrinters);

    // Fallbacks
    socket.on('heartbeat', onHeartbeat);
    socket.on('connector_connected', onConnected);
    socket.on('connector_disconnected', onDisconnected);
    socket.on('connector_paired', onPaired);
    socket.on('connector_unpaired', onUnpaired);
    socket.on('printers_updated', onPrinters);

    return () => {
      socket.off('connector:heartbeat', onHeartbeat);
      socket.off('connector:connected', onConnected);
      socket.off('connector:disconnected', onDisconnected);
      socket.off('connector:updated', onConnected);
      socket.off('connector:paired', onPaired);
      socket.off('connector:unpaired', onUnpaired);
      socket.off('printer:updated', onPrinters);

      socket.off('heartbeat', onHeartbeat);
      socket.off('connector_connected', onConnected);
      socket.off('connector_disconnected', onDisconnected);
      socket.off('connector_paired', onPaired);
      socket.off('connector_unpaired', onUnpaired);
      socket.off('printers_updated', onPrinters);
    };
  }, [
    storeId,
    handleSocketHeartbeat,
    handleSocketConnected,
    handleSocketDisconnected,
    handleSocketPaired,
    handleSocketUnpaired,
    handlePrintersUpdated
  ]);

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

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
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const mins = Math.floor(seconds / 60);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  };

  const isConnected = paired && isOnline;
  const isOffline = paired && !isOnline;
  const isUnpaired = !paired;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Desktop Connector</span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Online
                </span>
              )}
              {isOffline && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
              {isUnpaired && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3 h-3" /> Not Paired
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Persistent local Windows agent linking your physical USB / Network printers to the cloud.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => manualRefresh(storeId)}
            disabled={isCheckingStatus}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            title="Perform manual diagnostic check"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {paired && (
            <button
              onClick={handleUnpair}
              disabled={isUnpairing}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isUnpairing ? 'Disconnecting...' : 'Disconnect Machine'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Banner ── */}
      {isConnected ? (
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-emerald-900">
              Desktop Connector is Active & Ready
            </h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Host <strong className="font-mono">{hostname || 'Local Machine'}</strong> is actively transmitting telemetry. Cloud print jobs will execute immediately.
            </p>
          </div>
        </div>
      ) : isOffline ? (
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-rose-900">
              Desktop Connector is Offline
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Machine is paired, but no heartbeat was received recently ({formatTimeAgo(diffSeconds)}). Make sure the SelfPrint Connector app or background service is running on <strong className="font-mono">{hostname || 'your computer'}</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
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
                {isConnected ? 'Connected' : paired ? 'Offline' : 'Not Connected'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Store</span>
              <span className="font-semibold text-slate-900">{storeName || storeInfo?.name || '—'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Machine</span>
              <span className="font-mono font-semibold text-slate-800">{hostname || '—'}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Socket</span>
              <span className={`font-semibold ${socketConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Backend</span>
              <span className={`font-semibold ${authenticated ? 'text-emerald-600' : 'text-amber-600'}`}>
                {authenticated ? 'Authenticated' : 'Pending'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Host Service</span>
              <span className={`font-semibold ${hostRunning ? 'text-emerald-600' : 'text-rose-600'}`}>
                {hostRunning ? 'Running' : 'Stopped'}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Physical Printers</span>
              <span className="font-bold text-slate-900">{physicalPrinterCount || 0}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between last:pb-0">
              <span className="text-slate-500">Last Heartbeat</span>
              <span className="font-medium text-slate-600">{formatTimeAgo(diffSeconds)}</span>
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
                  Valid for: <strong className="text-slate-800">{formatTimer(pairingExpiresInSeconds)}</strong>
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
