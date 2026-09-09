import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Printer,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Star,
  CheckCircle2,
  AlertTriangle,
  Usb,
  Wifi,
  Share2,
  HardDrive,
  Layers,
  Sparkles
} from 'lucide-react';
import { localApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { PrinterDevice } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';

export const PrintersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterDevice | null>(null);

  // 1. Fetch Printers
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['printers'],
    queryFn: () => localApi.getPrinters(),
    refetchInterval: 10000
  });

  // 2. Test Print Mutation
  const testPrintMutation = useMutation({
    mutationFn: (printerName: string) => localApi.triggerTestPrint(printerName),
    onSuccess: (_, printerName) => {
      showToast('Test Print Sent', `Dispatched test page to ${printerName}.`, 'success');
      addActivity({
        type: 'PRINT_STARTED',
        title: 'Test Page Dispatched',
        description: `Local test print page sent to ${printerName}.`
      });
    },
    onError: () => {
      showToast('Test Print Failed', 'Could not queue test print.', 'error');
    }
  });

  // 3. Control Printer Mutation (Pause / Resume / Restart)
  const controlMutation = useMutation({
    mutationFn: ({ action, printerName }: { action: 'pause' | 'resume' | 'restart'; printerName: string }) =>
      localApi.controlPrinter(action, printerName),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      showToast('Command Executed', res.message || `Printer ${vars.action} executed.`, 'info');
      addActivity({
        type: vars.action === 'restart' ? 'RESTARTED' : 'WARNING',
        title: `Printer ${vars.action.toUpperCase()}`,
        description: `Command ${vars.action} sent to ${vars.printerName}.`
      });
    }
  });

  const printers = data?.data || [];

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'USB':
        return <Usb className="w-3.5 h-3.5 text-blue-400" />;
      case 'NETWORK':
      case 'WIRELESS':
        return <Wifi className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SHARED':
        return <Share2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <HardDrive className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (printer: PrinterDevice) => {
    if (!printer.isOnline || printer.status === 'OFFLINE') {
      return <Badge variant="danger" dot>Offline</Badge>;
    }
    if (printer.status === 'PAUSED') {
      return <Badge variant="warning" dot>Paused</Badge>;
    }
    if (printer.status === 'PAPER_JAM') {
      return <Badge variant="danger" dot>Paper Jam</Badge>;
    }
    if (printer.status === 'OUT_OF_PAPER') {
      return <Badge variant="danger" dot>Out of Paper</Badge>;
    }
    if (printer.status === 'LOW_TONER') {
      return <Badge variant="warning" dot>Low Toner</Badge>;
    }
    return <Badge variant="success" dot>Ready</Badge>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header with Title & Rescan Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            Installed Printers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical and local print devices detected on this Windows computer.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />}
          loading={isRefetching}
          onClick={() => refetch()}
        >
          Rescan Hardware
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && printers.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Printers Detected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ensure your printer is plugged in via USB or connected to the local Wi-Fi/LAN network, then click Rescan.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => refetch()}
          >
            Scan for Hardware
          </Button>
        </Card>
      )}

      {/* Grid of Printer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map((printer) => (
          <Card
            key={printer.id}
            hover
            className="flex flex-col justify-between cursor-pointer group border-slate-800 hover:border-slate-700"
            onClick={() => setSelectedPrinter(printer)}
          >
            <div>
              {/* Header: Name & Status Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                      {printer.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
                    {printer.driverName || 'Generic Driver'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(printer)}
                  {printer.isDefault && (
                    <Badge variant="purple" size="sm">
                      <Star className="w-2.5 h-2.5 mr-0.5 fill-purple-400" />
                      Default
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info Badges */}
              <div className="grid grid-cols-2 gap-2 my-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  {getConnectionIcon(printer.connectionType)}
                  <span className="truncate">{printer.connectionType || 'USB'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Queue: {printer.jobsWaiting || 0} job(s)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{printer.colorSupport ? 'Color & Mono' : 'Monochrome'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Port: {printer.portName || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[11px] py-1.5"
                icon={<FileText className="w-3 h-3" />}
                onClick={() => testPrintMutation.mutate(printer.name)}
                loading={testPrintMutation.isPending}
              >
                Test Page
              </Button>

              {printer.status === 'PAUSED' ? (
                <Button
                  variant="success"
                  size="sm"
                  title="Resume Printer"
                  icon={<Play className="w-3 h-3" />}
                  onClick={() => controlMutation.mutate({ action: 'resume', printerName: printer.name })}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  title="Pause Printer"
                  icon={<Pause className="w-3 h-3" />}
                  onClick={() => controlMutation.mutate({ action: 'pause', printerName: printer.name })}
                >
                  Pause
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                title="Restart Queue"
                icon={<RotateCcw className="w-3 h-3" />}
                onClick={() => controlMutation.mutate({ action: 'restart', printerName: printer.name })}
              >
                Reset
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Printer Details Drawer/Modal */}
      {selectedPrinter && (
        <Modal
          isOpen={Boolean(selectedPrinter)}
          onClose={() => setSelectedPrinter(null)}
          title={selectedPrinter.name}
          subtitle={`Detailed Hardware & Capabilities Overview • Port: ${selectedPrinter.portName || 'N/A'}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(selectedPrinter)}
              {selectedPrinter.isDefault && <Badge variant="purple">Default Windows Printer</Badge>}
              <Badge variant="outline">{selectedPrinter.connectionType}</Badge>
              <Badge variant="outline">{selectedPrinter.resolution || '600x600 DPI'}</Badge>
            </div>

            {/* Properties Table */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/80 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-400">Driver Name:</span>
                <span className="text-slate-200 font-mono">{selectedPrinter.driverName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400">Port Name:</span>
                <span className="text-slate-200 font-mono">{selectedPrinter.portName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400">Color Support:</span>
                <span className="text-slate-200">{selectedPrinter.colorSupport ? 'Yes (Full RGB/CMYK)' : 'No (Black & White)'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400">Duplex Support:</span>
                <span className="text-slate-200">{selectedPrinter.duplexSupport ? 'Yes (Automatic 2-Sided)' : 'No'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-400">Print Jobs in Queue:</span>
                <span className="text-slate-200 font-bold">{selectedPrinter.jobsWaiting || 0}</span>
              </div>
            </div>

            {/* Paper Sizes */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Supported Paper Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedPrinter.paperSizes && selectedPrinter.paperSizes.length > 0 ? (
                  selectedPrinter.paperSizes.map((size) => (
                    <span key={size} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/60">
                      {size}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Standard formats: A4, Letter, Legal</span>
                )}
              </div>
            </div>

            {/* Capabilities */}
            {selectedPrinter.capabilities && selectedPrinter.capabilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Hardware Capabilities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPrinter.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[11px] border border-blue-500/20">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <Button
                variant="primary"
                size="sm"
                icon={<FileText className="w-3.5 h-3.5" />}
                onClick={() => {
                  testPrintMutation.mutate(selectedPrinter.name);
                  setSelectedPrinter(null);
                }}
              >
                Send Test Page
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
