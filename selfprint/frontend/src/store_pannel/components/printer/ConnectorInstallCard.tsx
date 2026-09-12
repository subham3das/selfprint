import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  ServerOff,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { printerService } from '../../services/printer.service';

interface ConnectorInstallCardProps {
  onRefresh: () => Promise<boolean | void>;
  isChecking?: boolean;
  compact?: boolean;
  isDetected?: boolean;
}

export const ConnectorInstallCard: React.FC<ConnectorInstallCardProps> = ({
  onRefresh,
  isChecking = false,
  compact = false,
  isDetected = false
}) => {
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [checkingLocal, setCheckingLocal] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchPairingCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await printerService.generatePairingCode();
      if (res?.pairingCode) {
        setPairingCode(res.pairingCode);
      }
    } catch (err) {
      console.warn('Could not generate pairing code:', err);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    fetchPairingCode();
  }, []);

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRefresh = async () => {
    setCheckingLocal(true);
    try {
      await onRefresh();
    } finally {
      setCheckingLocal(false);
    }
  };

  const handleDownload = () => {
    const downloadUrl = printerService.getInstallerDownloadUrl();
    window.location.href = downloadUrl;
  };

  const handleLaunchProtocol = () => {
    window.location.href = 'selfprint://connector';
  };

  const isLoading = isChecking || checkingLocal;

  // State 3: When Connector Starts / Detected
  if (isDetected) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 shadow-sm ${
          compact ? 'p-5' : 'p-6 sm:p-8'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>✓ Connector Detected</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Authenticating... Connecting to SelfPrint Cloud.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: If installed but Host Service is NOT running / closed
  if (alreadyInstalled) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-slate-50 shadow-sm ${
          compact ? 'p-5' : 'p-6 sm:p-8'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-100">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Connector Installed
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-200">
                  Waiting for Connector...
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Please open SelfPrint Connector.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
        </div>

        {/* Pairing Code Section */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Desktop Pairing Code</span>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-sm font-black font-mono tracking-widest text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                  {isGeneratingCode ? 'GENERATING...' : pairingCode || 'SP-PAIR01'}
                </code>
                <span className="text-[10px] text-amber-700">(Valid 10 mins)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!pairingCode}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={fetchPairingCode}
              disabled={isGeneratingCode}
              className="p-1.5 rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-100/50 cursor-pointer"
              title="Generate new code"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCode ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleLaunchProtocol}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>[Open Connector]</span>
          </button>

          <button
            type="button"
            onClick={() => setAlreadyInstalled(false)}
            className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Need to download again?
          </button>
        </div>

        {/* Auto polling footer */}
        <div className="mt-5 pt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Checking automatically...</span>
          </div>
          <span>Refresh automatically every 3 seconds.</span>
        </div>
      </div>
    );
  }

  // State 1: If Desktop Connector is NOT installed
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/70 via-white to-slate-50 shadow-sm ${
        compact ? 'p-5' : 'p-6 sm:p-8'
      }`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rose-100">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
            <ServerOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                SelfPrint Connector Required
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-100 text-rose-800 border border-rose-200">
                Connector Offline
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              This computer cannot communicate with physical printers until the SelfPrint Connector is installed.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50 hover:border-slate-400 active:scale-98 transition-all disabled:opacity-60 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Checking...' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Pairing Code Section */}
      <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/15 text-purple-700 flex items-center justify-center shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">Desktop Pairing Code</span>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="text-sm font-black font-mono tracking-widest text-slate-900 bg-white px-2 py-0.5 rounded border border-purple-300">
                {isGeneratingCode ? 'GENERATING...' : pairingCode || 'SP-PAIR01'}
              </code>
              <span className="text-[10px] text-purple-600 font-medium">(Valid 10 mins)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyCode}
            disabled={!pairingCode}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-300 hover:bg-purple-100/50 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            type="button"
            onClick={fetchPairingCode}
            disabled={isGeneratingCode}
            className="p-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100/50 cursor-pointer"
            title="Generate new code"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCode ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Buttons: Download Connector & I already installed it */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>[Download Connector]</span>
        </button>

        <button
          type="button"
          onClick={() => setAlreadyInstalled(true)}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <span>[I already installed it]</span>
        </button>
      </div>

      {/* Footer Notice */}
      <div className="mt-5 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Refresh automatically every 3 seconds.</span>
        </div>
        <span>Browser cannot communicate with Windows printers directly.</span>
      </div>
    </div>
  );
};
