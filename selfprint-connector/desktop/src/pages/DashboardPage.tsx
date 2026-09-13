import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  RefreshCw,
  RotateCcw,
  FolderOpen,
  Wifi,
  WifiOff,
  Server,
  Printer,
  Bell,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Key,
  Store
} from 'lucide-react';
import { localApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { HealthData, PrinterDevice } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { PairConnectorModal } from '../components/pairing/PairConnectorModal';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);
  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus);
  const notifications = useAppStore((s) => s.notifications);
  const activities = useAppStore((s) => s.activities);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const isSocketReconnecting = useAppStore((s) => s.isSocketReconnecting);
  const isBackendConnected = useAppStore((s) => s.isBackendConnected);

  const [isPairModalOpen, setIsPairModalOpen] = useState(
    () => !localStorage.getItem('selfprint_device_token')
  );
  const [pairedStoreName, setPairedStoreName] = useState<string>(
    () => localStorage.getItem('selfprint_paired_store_name') || ''
  );
  const [storeId, setStoreId] = useState<string>(
    () => localStorage.getItem('selfprint_store_id') || ''
  );
  const [storeCode, setStoreCode] = useState<string>(
    () => localStorage.getItem('selfprint_store_code') || ''
  );
  const [ownerName, setOwnerName] = useState<string>(
    () => localStorage.getItem('selfprint_owner_name') || ''
  );
  const [cloudOffline, setCloudOffline] = useState(false);

  // ─── Verify existing device token on startup ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('selfprint_device_token');
    if (!token) return;

    let isMounted = true;
    (async () => {
      try {
        const result = await localApi.verifyToken(token);
        if (!isMounted) return;

        if (result.valid && result.data) {
          setPairedStoreName(result.data.storeName);
          setStoreId(result.data.storeId);
          setStoreCode(result.data.storeCode || '');
          setOwnerName(result.data.ownerName || '');
          localStorage.setItem('selfprint_paired_store_name', result.data.storeName);
          if (result.data.storeCode) localStorage.setItem('selfprint_store_code', result.data.storeCode);
          if (result.data.ownerName) localStorage.setItem('selfprint_owner_name', result.data.ownerName);
          setCloudOffline(false);
        } else if (result.valid === false) {
          // Token is rejected/revoked by backend
          localStorage.removeItem('selfprint_device_token');
          localStorage.removeItem('selfprint_paired_store_name');
          localStorage.removeItem('selfprint_store_id');
          localStorage.removeItem('selfprint_store_code');
          localStorage.removeItem('selfprint_owner_name');
          setPairedStoreName('');
          setIsPairModalOpen(true);
          showToast('Device Unpaired', 'This connector was revoked or unpaired from the Store.', 'warning');
        }
      } catch (err) {
        // Backend offline or unreachable — keep token, do not unpair!
        if (isMounted) setCloudOffline(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Step 1: Health Check (every 10 s) ───────────────────────────────────
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
    dataUpdatedAt: healthUpdatedAt
  } = useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthData> => {
      const data = await localApi.getHealth();          // throws if offline
      setConnectionStatus(true);
      return data;
    },
    refetchInterval: 10_000,
    retry: 1
  });

  // Side-effect: mark disconnected when health probe fails
  useEffect(() => {
    if (isHealthError) setConnectionStatus(false);
  }, [isHealthError, setConnectionStatus]);

  // ─── Step 2: Printers — ONLY fetched when host is confirmed online ────────
  const hostOnline = !isHealthError && !isHealthLoading && !!health;

  // Actions blocked when host is offline OR socket is in reconnect cycle
  const actionsDisabled = !hostOnline || isSocketReconnecting;

  const {
    data: printersData,
    isLoading: isPrintersLoading,
    isError: isPrintersError
  } = useQuery({
    queryKey: ['printers'],
    queryFn: () => localApi.getPrinters(),              // throws if offline
    refetchInterval: 10_000,
    enabled: hostOnline,                                // gated — never runs if host is offline
    retry: 0
  });

  // ─── Rescan Mutation ──────────────────────────────────────────────────────
  const rescanMutation = useMutation({
    mutationFn: () => localApi.triggerRescan(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      showToast('Printers Refreshed', `Host Service detected ${res.count || 0} printers.`, 'success');
      addActivity({
        type: 'WARNING',
        title: 'Printers Rescanned',
        description: `Host Service rescan: ${res.count || 0} printers found.`
      });
    },
    onError: () => {
      showToast('Scan Failed', 'Host Service is unreachable. Ensure the SelfPrint Connector is running.', 'error');
    }
  });

  const handleOpenLogs = () => {
    if ((window as any).electronAPI?.openPath) {
      (window as any).electronAPI.openPath('logs');
      showToast('Opening Logs', 'Opened logs folder in File Explorer.', 'info');
    } else {
      showToast('Logs Folder', 'Located at /logs/ directory.', 'info');
    }
  };

  const handleReconnect = () => {
    refetchHealth();
    showToast('Reconnecting', 'Checking Host Service on localhost:4500...', 'info');
  };

  const handleRestartConnector = () => {
    showToast('Restarting', 'Requesting background service restart...', 'warning');
    addActivity({
      type: 'RESTARTED',
      title: 'Connector Restart Requested',
      description: 'Restart command issued via Desktop UI dashboard.'
    });
  };

  // ─── Derived printer data ─────────────────────────────────────────────────
  // When host is offline, show ZERO printers — never show cached or fake data.
  const printers: PrinterDevice[] = hostOnline && Array.isArray(printersData?.data)
    ? printersData!.data
    : [];

  const onlinePrinters = printers.filter((p) => p?.isOnline && p.status === 'ONLINE');
  const latestNotification = notifications[0];
  const lastCheckTime = healthUpdatedAt
    ? new Date(healthUpdatedAt).toLocaleTimeString()
    : '—';

  // Helper to format last sync
  const formatLastSync = () => {
    if (!healthUpdatedAt) return 'Just now';
    const diffSec = Math.round((Date.now() - healthUpdatedAt) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    return `${Math.floor(diffSec / 60)} minutes ago`;
  };

  // Four independent connection states:
  // 1. Host Service (localhost:4500)
  const hostServiceRunning = hostOnline;
  // 2. Store Pairing
  const isPaired = Boolean((pairedStoreName && pairedStoreName.trim().length > 0 && pairedStoreName !== '—') || health?.storeId);
  // 3. Backend Authentication
  const isAuthenticated = Boolean(health?.isRegistered || localStorage.getItem('selfprint_device_token'));
  // 4. Socket Connection (Socket.IO)
  const isSocketConnected = Boolean(isBackendConnected || health?.socketConnected);
  // 5. Physical Printers Synchronized (or scan confirmed)
  const isPrintersSynced = !isPrintersLoading && (printersData !== undefined || printers.length > 0);
  // Strict READY condition:
  // Host Service is running, paired, backend authenticated, socket connected, and physical printers synced.
  const isReady = hostServiceRunning && isPaired && isAuthenticated && isSocketConnected && isPrintersSynced;

  // Determine production connection state
  const getCloudConnectionStatus = () => {
    if (isHealthLoading) {
      return {
        badge: 'Starting Connector...',
        subtext: 'Probing localhost:4500...',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/20',
        bgGlow: 'bg-amber-500/10',
        icon: <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />,
        isReady: false
      };
    }

    if (!hostServiceRunning) {
      return {
        badge: 'Host Service Offline • Restart Required',
        subtext: 'localhost:4500 unreachable. Start the host service.',
        color: 'text-red-400',
        borderColor: 'border-red-500/30',
        bgGlow: 'bg-red-500/10',
        icon: <AlertCircle className="w-4 h-4 text-red-400" />,
        isReady: false
      };
    }

    if (cloudOffline) {
      return {
        badge: 'Cloud Offline • Retrying...',
        subtext: 'Attempting to reconnect with SelfPrint Cloud...',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgGlow: 'bg-amber-500/10',
        icon: <WifiOff className="w-4 h-4 text-amber-400" />,
        isReady: false
      };
    }

    if (!isPaired) {
      return {
        badge: 'Connector Unpaired',
        subtext: 'Pair with Store Dashboard to connect',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgGlow: 'bg-amber-500/10',
        icon: <Key className="w-4 h-4 text-amber-400" />,
        isReady: false
      };
    }

    if (!isAuthenticated) {
      return {
        badge: 'Authentication Required',
        subtext: 'Device token missing or unverified',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgGlow: 'bg-blue-500/10',
        icon: <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />,
        isReady: false
      };
    }

    if (!isSocketConnected) {
      return {
        badge: isSocketReconnecting ? 'Reconnecting Socket...' : 'Socket Disconnected',
        subtext: 'Connecting to Cloud Realtime Gateway...',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgGlow: 'bg-amber-500/10',
        icon: <WifiOff className="w-4 h-4 text-amber-400" />,
        isReady: false
      };
    }

    if (!isPrintersSynced) {
      return {
        badge: 'Scanning Printers...',
        subtext: 'Querying print spooler...',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgGlow: 'bg-blue-500/10',
        icon: <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />,
        isReady: false
      };
    }

    return {
      badge: 'READY',
      subtext: 'Hardware Bridge Online & Synchronized',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      isReady: true
    };
  };

  const cloudStatus = getCloudConnectionStatus();

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Host Offline Banner ── */}
      {(isHealthError || (!isHealthLoading && !health)) && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300">
          <WifiOff className="w-5 h-5 shrink-0 text-red-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Host Service Offline</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Host Service is offline. Please start the SelfPrint Connector to manage physical printers. Last check: {lastCheckTime}.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleReconnect}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Top Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/80 to-slate-900/80 border border-blue-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">
              {isHealthLoading ? 'Connecting...' : health?.hostname || 'Host Service'}
            </h1>
            {isHealthLoading && (
              <Badge variant="warning" dot>Checking...</Badge>
            )}
            {!isHealthLoading && isReady && (
              <Badge variant="success" dot>READY</Badge>
            )}
            {!isHealthLoading && !isReady && hostOnline && (
              <Badge variant="warning" dot>Host Service Running</Badge>
            )}
            {!isHealthLoading && !hostOnline && (
              <Badge variant="danger" dot>Host Service Offline</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Machine ID: <code className="text-slate-300">{health?.machineId || '—'}</code></span>
            <span>•</span>
            <span>v{health?.connectorVersion || '—'}</span>
            <span>•</span>
            <span>Last check: {lastCheckTime}</span>
          </p>
        </div>

        {/* Action Buttons — disabled when host is offline */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Key className="w-3.5 h-3.5" />}
            onClick={() => setIsPairModalOpen(true)}
          >
            Pair Connector
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />}
            loading={rescanMutation.isPending}
            onClick={() => rescanMutation.mutate()}
            disabled={actionsDisabled}
            title={actionsDisabled ? 'Host Service must be running to scan printers' : undefined}
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

      {/* ── Connected Store Details Banner ── */}
      {isPaired && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-blue-950/30 to-slate-900/95 border border-blue-500/20 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Connected Store</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-100 mt-0.5">{pairedStoreName || 'Your Store'}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div>
                <span className="text-slate-500 block text-[11px]">Store ID</span>
                <span className="font-mono font-semibold text-slate-200 truncate block">
                  {storeCode || storeId || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Owner</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {ownerName || 'Store Manager'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Last Sync</span>
                <span className="font-medium text-emerald-400 truncate block">
                  {formatLastSync()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Telemetry Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Cloud Connection Telemetry */}
        <Card hover className={`border ${cloudStatus.borderColor} transition-colors`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Connection Architecture</span>
            <div className={`w-8 h-8 rounded-xl ${cloudStatus.bgGlow} flex items-center justify-center`}>
              {cloudStatus.icon}
            </div>
          </div>
          <div className="mt-2.5 space-y-2">
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Overall State</div>
              <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <span className={cloudStatus.color}>{cloudStatus.badge}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{cloudStatus.subtext}</p>
            </div>

            {/* Separately display the 6 connection states */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
              <div>
                <span className="text-slate-500 block">Host Service</span>
                <span className={`font-semibold flex items-center gap-1 ${hostServiceRunning ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hostServiceRunning ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {hostServiceRunning ? 'Running (:4500)' : 'Stopped'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Store Pairing</span>
                <span className={`font-semibold truncate block flex items-center gap-1 ${isPaired ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaired ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isPaired ? (pairedStoreName || 'Paired') : 'Unpaired'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Backend Auth</span>
                <span className={`font-semibold flex items-center gap-1 ${isAuthenticated ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isAuthenticated ? 'Authenticated' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Socket Connection</span>
                <span className={`font-semibold flex items-center gap-1 ${isSocketConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {isSocketConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Physical Printers</span>
                <span className={`font-semibold flex items-center gap-1 ${printers.length > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPrintersSynced ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  {printers.length} Physical
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Last Heartbeat</span>
                <span className="text-slate-300 font-medium truncate block">
                  {lastCheckTime} (10s)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Printers Ready — shows 0 / 0 when offline */}
        <Card hover onClick={() => setActiveTab('printers')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Printers Ready</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100">
              {isPrintersLoading
                ? <Skeleton className="h-6 w-16" />
                : !hostOnline
                  ? <span className="text-red-400 text-sm">Offline</span>
                  : `${onlinePrinters.length} / ${printers.length}`
              }
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {hostOnline
                ? `${onlinePrinters.length} online, ${printers.length - onlinePrinters.length} offline`
                : 'Host Service not running'
              }
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
              {hostOnline ? (health?.telemetry?.printSpoolerStatus || 'Running') : '—'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CPU: {hostOnline ? `${health?.telemetry?.cpuUsagePercent || 0}%` : '—'} •
              RSS: {hostOnline ? `${health?.telemetry?.memory?.processRssMB || 48} MB` : '—'}
            </p>
          </div>
        </Card>

        {/* Card 4: Uptime */}
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Connector Uptime</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-100">
              {hostOnline && health?.uptimeSeconds
                ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s`
                : '—'
              }
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Heartbeat: Every 10s</p>
          </div>
        </Card>
      </div>

      {/* ── Two-Column: Activity & Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Recent Activity */}
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

        {/* Right: Latest Alert & Hardware Identity */}
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

          <Card className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hardware Identity
            </h3>
            <div className="text-[11px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Connector ID:</span>
                <span className="text-slate-200 font-mono truncate max-w-[140px]">
                  {health?.connectorId || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Windows User:</span>
                <span className="text-slate-200">{health?.windowsUser || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Port:</span>
                <span className="text-slate-200 font-mono">4500</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Pair Connector Modal ── */}
      <PairConnectorModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        connectorId={health?.connectorId || 'local-connector'}
        machineId={health?.machineId || 'local-machine'}
        hostname={health?.hostname || 'DESKTOP-PRINT'}
        version={health?.connectorVersion || '1.0.1'}
        currentStoreName={pairedStoreName}
        onPairSuccess={(info) => {
          setPairedStoreName(info.storeName);
          if (info.storeId) setStoreId(info.storeId);
          if (info.storeCode) setStoreCode(info.storeCode);
          if (info.ownerName) setOwnerName(info.ownerName);
          showToast('Connector Paired', `Successfully linked to ${info.storeName}!`, 'success');
        }}
      />
    </div>
  );
};
