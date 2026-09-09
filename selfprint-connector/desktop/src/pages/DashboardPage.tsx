import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  RefreshCw,
  RotateCcw,
  FolderOpen,
  Wifi,
  Server,
  Printer,
  Bell,
  Cpu,
  HardDrive,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { localApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);
  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus);
  const notifications = useAppStore((s) => s.notifications);
  const activities = useAppStore((s) => s.activities);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  // 1. Fetch Health Data
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const data = await localApi.getHealth();
      setConnectionStatus(true, data.status === 'ONLINE');
      return data;
    },
    refetchInterval: 5000,
    retry: 2
  });

  // 2. Fetch Printers List
  const { data: printersData, isLoading: isPrintersLoading } = useQuery({
    queryKey: ['printers'],
    queryFn: () => localApi.getPrinters(),
    refetchInterval: 10000
  });

  // Rescan Mutation
  const rescanMutation = useMutation({
    mutationFn: () => localApi.triggerRescan(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      showToast('Printers Refreshed', `Found ${res.count || 0} installed printers.`, 'success');
      addActivity({
        type: 'WARNING',
        title: 'Printers Rescanned',
        description: `Manual scan detected ${res.count || 0} printers.`
      });
    },
    onError: () => {
      showToast('Scan Error', 'Failed to communicate with local print spooler.', 'error');
    }
  });

  const handleOpenLogs = () => {
    if ((window as any).electronAPI?.openPath) {
      (window as any).electronAPI.openPath('d:\\project\\SELFPRINT SYSTEM\\selfprint-connector\\logs');
      showToast('Opening Logs', 'Opened logs folder in File Explorer.', 'info');
    } else {
      showToast('Logs Folder', 'Located at /logs/ directory.', 'info');
    }
  };

  const handleReconnect = () => {
    refetchHealth();
    showToast('Reconnecting', 'Triggered reconnect sequence with backend.', 'info');
  };

  const handleRestartConnector = () => {
    showToast('Restarting', 'Restarting background hardware bridge...', 'warning');
    addActivity({
      type: 'RESTARTED',
      title: 'Connector Restart Requested',
      description: 'Restart command issued via Desktop UI dashboard.'
    });
  };

  const printers = printersData?.data || [];
  const onlinePrinters = printers.filter((p) => p.isOnline && p.status === 'ONLINE');
  const latestNotification = notifications[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner: Quick Summary & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/80 to-slate-900/80 border border-blue-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">
              {health?.hostname || 'Windows Host'}
            </h1>
            <Badge variant={health?.status === 'ONLINE' ? 'success' : 'warning'} dot>
              {health?.status || 'Connecting...'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Machine ID: <code className="text-slate-300">{health?.machineId || 'mach_...'}</code></span>
            <span>•</span>
            <span>v{health?.connectorVersion || '0.2.0'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />}
            loading={rescanMutation.isPending}
            onClick={() => rescanMutation.mutate()}
          >
            Refresh Printers
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Wifi className="w-3.5 h-3.5" />}
            onClick={handleReconnect}
          >
            Reconnect
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FolderOpen className="w-3.5 h-3.5" />}
            onClick={handleOpenLogs}
          >
            Open Logs
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleRestartConnector}
          >
            Restart
          </Button>
        </div>
      </div>

      {/* Grid of Key Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cloud Connection */}
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cloud Connection</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {health?.isRegistered ? 'Authenticated' : 'Pending Auth'}
              {health?.isRegistered ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {health?.backendUrl || 'http://localhost:3000'}
            </p>
          </div>
        </Card>

        {/* Card 2: Active Printers */}
        <Card hover onClick={() => setActiveTab('printers')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Printers Ready</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100">
              {isPrintersLoading ? <Skeleton className="h-6 w-16" /> : `${onlinePrinters.length} / ${printers.length}`}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {onlinePrinters.length} online, {printers.length - onlinePrinters.length} offline
            </p>
          </div>
        </Card>

        {/* Card 3: Spooler & CPU */}
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Spooler & CPU</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100">
              {health?.telemetry?.printSpoolerStatus || 'Running'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CPU: {health?.telemetry?.cpuUsagePercent || 0}% • RSS: {health?.telemetry?.memory?.processRssMB || 48} MB
            </p>
          </div>
        </Card>

        {/* Card 4: Uptime & Heartbeat */}
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Connector Uptime</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100">
              {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s` : '0m 0s'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Heartbeat: Every 15s
            </p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Recent Activity & Latest Notification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Recent Activity Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Recent Hardware Activity
            </h2>
            <button
              onClick={() => setActiveTab('activity')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View all
            </button>
          </div>

          <Card className="p-0 overflow-hidden divide-y divide-slate-800/60">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-800/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate">{act.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{act.description}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Column: Latest Notification & Quick Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Latest Alert
            </h2>
            <button
              onClick={() => setActiveTab('notifications')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              All alerts
            </button>
          </div>

          <Card className="border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/20">
            {latestNotification ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={latestNotification.severity === 'error' ? 'danger' : 'warning'} size="sm">
                    {latestNotification.severity.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-500">
                    {new Date(latestNotification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">{latestNotification.title}</h4>
                <p className="text-xs text-slate-400">{latestNotification.message}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No active alerts.</p>
            )}
          </Card>

          {/* Device Credentials Box */}
          <Card className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hardware Identity
            </h3>
            <div className="text-[11px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Connector ID:</span>
                <span className="text-slate-200 font-mono truncate max-w-[140px]">
                  {health?.connectorId || 'cntr_...'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Windows User:</span>
                <span className="text-slate-200">{health?.windowsUser || 'SYSTEM'}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Port:</span>
                <span className="text-slate-200 font-mono">4500</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
