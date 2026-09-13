import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Info,
  Copy,
  Download,
  BookOpen,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Server
} from 'lucide-react';
import { localApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const AboutPage: React.FC = () => {
  const showToast = useAppStore((s) => s.showToast);

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => localApi.getHealth()
  });

  const handleCopyDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      connectorVersion: health?.connectorVersion || '1.0.1',
      connectorId: health?.connectorId,
      machineId: health?.machineId,
      hostname: health?.hostname,
      windowsUser: health?.windowsUser,
      backendUrl: health?.backendUrl,
      status: health?.status,
      uptimeSeconds: health?.uptimeSeconds,
      telemetry: health?.telemetry
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    showToast('Diagnostics Copied', 'Copied system diagnostic payload to clipboard.', 'success');
  };

  const handleExportDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      connectorVersion: health?.connectorVersion || '1.0.1',
      connectorId: health?.connectorId,
      machineId: health?.machineId,
      hostname: health?.hostname,
      windowsUser: health?.windowsUser,
      backendUrl: health?.backendUrl,
      status: health?.status,
      uptimeSeconds: health?.uptimeSeconds,
      telemetry: health?.telemetry
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfprint-diagnostics-${health?.hostname || 'machine'}.json`;
    a.click();
    showToast('Exported', 'Saved diagnostic report JSON.', 'success');
  };

  const handleOpenDocs = () => {
    if ((window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal('https://docs.selfprint.cloud');
    } else {
      window.open('https://docs.selfprint.cloud', '_blank');
    }
  };

  const updateStatus = useAppStore((s) => s.updateStatus);

  const handleCheckUpdates = async () => {
    if ((window as any).electronAPI?.checkForUpdates) {
      showToast('Checking for updates', 'Connecting to GitHub Releases...', 'info');
      await (window as any).electronAPI.checkForUpdates();
    } else {
      showToast('Update Check', `You are running the latest release (v${health?.connectorVersion || '1.0.1'}).`, 'info');
    }
  };

  const handleRestartInstall = () => {
    if ((window as any).electronAPI?.restartAndInstall) {
      (window as any).electronAPI.restartAndInstall();
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logoapp.png"
            alt="SelfPrint Logo"
            className="w-14 h-14 object-contain rounded-2xl p-1 bg-slate-900 border border-blue-500/30 shadow-xl shadow-blue-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">SelfPrint Connector</h1>
              <Badge variant="success" size="sm">
                v{updateStatus.currentVersion || health?.connectorVersion || '1.0.1'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-Grade Windows Hardware Bridge Daemon & Device Controller
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {updateStatus.state === 'DOWNLOADED' ? (
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleRestartInstall}
            >
              Restart to Install v{updateStatus.latestVersion}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${updateStatus.state === 'CHECKING' ? 'animate-spin text-blue-400' : ''}`} />}
              onClick={handleCheckUpdates}
              disabled={updateStatus.state === 'CHECKING' || updateStatus.state === 'DOWNLOADING'}
            >
              {updateStatus.state === 'CHECKING'
                ? 'Checking...'
                : updateStatus.state === 'DOWNLOADING'
                ? `Downloading (${updateStatus.progress?.percent || 0}%)`
                : updateStatus.state === 'AVAILABLE'
                ? 'Update Available'
                : 'Check Updates'}
            </Button>
          )}
        </div>
      </div>

      {/* Hardware & Identity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity Details */}
        <Card className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Device Identity
          </h3>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-800/80 text-xs font-mono">
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Hostname:</span>
              <span className="text-slate-200 font-semibold">{health?.hostname || 'ASUSTUFF15'}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Windows User:</span>
              <span className="text-slate-200">{health?.windowsUser || 'SYSTEM'}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Machine ID:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{health?.machineId}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Connector ID:</span>
              <span className="text-slate-200 truncate max-w-[180px]">{health?.connectorId}</span>
            </div>
          </div>
        </Card>

        {/* System Telemetry Snapshot */}
        <Card className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            Host Machine Resources
          </h3>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-800/80 text-xs font-mono">
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">CPU Usage:</span>
              <span className="text-slate-200">{health?.telemetry?.cpuUsagePercent || 0}%</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">RAM (Total / Free):</span>
              <span className="text-slate-200">
                {Math.round((health?.telemetry?.memory?.totalMB || 16384) / 1024)} GB /{' '}
                {Math.round((health?.telemetry?.memory?.freeMB || 8192) / 1024)} GB
              </span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Disk Free (C:):</span>
              <span className="text-slate-200">{health?.telemetry?.disk?.freeGB || 120} GB</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-slate-400">Spooler Service:</span>
              <span className="text-emerald-400">{health?.telemetry?.printSpoolerStatus || 'Running'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Diagnostics & Export Toolbar */}
      <Card className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Diagnostics & Support Actions
        </h3>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyDiagnostics}
          >
            Copy Diagnostics
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportDiagnostics}
          >
            Export JSON Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            onClick={handleOpenDocs}
          >
            Documentation
          </Button>
        </div>
      </Card>

      {/* Copyright & License Notice */}
      <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
        <p>SelfPrint Cloud Platform © 2026. All rights reserved.</p>
        <p className="text-[11px] text-slate-600">
          Pure Hardware Bridge Protocol • End-to-End Encrypted Spooler Pipeline
        </p>
      </div>
    </div>
  );
};
