import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  FolderOpen,
  Download,
  Trash2,
  RefreshCw,
  Server,
  Radio,
  Sliders,
  Shield
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const SettingsPage: React.FC = () => {
  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);

  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');
  const [heartbeatInterval, setHeartbeatInterval] = useState(15);
  const [scanInterval, setScanInterval] = useState(30);
  const [logLevel, setLogLevel] = useState('INFO');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [launchOnStartup, setLaunchOnStartup] = useState(true);
  const [runAsService, setRunAsService] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings Saved', 'Connector settings updated successfully.', 'success');
      addActivity({
        type: 'WARNING',
        title: 'Settings Updated',
        description: `Backend URL set to ${backendUrl}, log level: ${logLevel}.`
      });
    }, 400);
  };

  const handleOpenLogs = () => {
    if ((window as any).electronAPI?.openPath) {
      (window as any).electronAPI.openPath('d:\\project\\SELFPRINT SYSTEM\\selfprint-connector\\logs');
    }
    showToast('Logs Folder', 'Opening logs directory in File Explorer.', 'info');
  };

  const handleClearCache = () => {
    showToast('Cache Cleared', 'Temporary spooler cache cleared.', 'info');
  };

  const handleResetDefaults = () => {
    setBackendUrl('http://localhost:5000');
    setHeartbeatInterval(15);
    setScanInterval(30);
    setLogLevel('INFO');
    setAutoUpdate(true);
    setLaunchOnStartup(true);
    setRunAsService(true);
    showToast('Defaults Restored', 'Settings reset to factory defaults.', 'warning');
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Connector Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure local hardware polling, cloud endpoint, and background startup behavior.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-3.5 h-3.5" />}
          loading={isSaving}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>

      {/* Cloud Backend Configuration */}
      <Card className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          Cloud Backend Endpoint
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">SelfPrint Backend URL</label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://api.selfprint.cloud"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-500">
            Target cloud server where print commands originate and telemetry is reported.
          </p>
        </div>
      </Card>

      {/* Polling & Intervals */}
      <Card className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          Hardware Polling & Telemetry Intervals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Heartbeat Beacon Interval (Seconds)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={heartbeatInterval}
              onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">Default: 15s</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Printer Scan Interval (Seconds)</label>
            <input
              type="number"
              min={10}
              max={300}
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">Default: 30s</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-medium text-slate-300">Daemon Log Verbosity</label>
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="DEBUG">DEBUG (All events, trace)</option>
            <option value="INFO">INFO (Standard production)</option>
            <option value="WARN">WARN (Warnings & Errors only)</option>
            <option value="ERROR">ERROR (Errors only)</option>
          </select>
        </div>
      </Card>

      {/* Windows Service & Startup Options */}
      <Card className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Windows System Integration
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
            <div>
              <div className="text-xs font-medium text-slate-200">Run on Windows Startup</div>
              <div className="text-[11px] text-slate-500">Automatically launches the connector when Windows boots</div>
            </div>
            <input
              type="checkbox"
              checked={launchOnStartup}
              onChange={(e) => setLaunchOnStartup(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
            <div>
              <div className="text-xs font-medium text-slate-200">Run As Background Windows Service</div>
              <div className="text-[11px] text-slate-500">Executes silently without console or terminal windows</div>
            </div>
            <input
              type="checkbox"
              checked={runAsService}
              onChange={(e) => setRunAsService(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
            <div>
              <div className="text-xs font-medium text-slate-200">Automatic Updates</div>
              <div className="text-[11px] text-slate-500">Check for and download minor version patches automatically</div>
            </div>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
            />
          </label>
        </div>
      </Card>

      {/* Maintenance Actions */}
      <Card className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" />
          Maintenance & Storage Tools
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FolderOpen className="w-3.5 h-3.5" />}
            onClick={handleOpenLogs}
          >
            Open Logs Directory
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleClearCache}
          >
            Clear Temp Cache
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDefaults}
          >
            Restore Default Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};
