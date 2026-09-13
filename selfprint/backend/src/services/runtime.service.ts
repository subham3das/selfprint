import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils';

export interface StoreRuntimePrinter {
  id: string;
  name: string;
  model?: string;
  brand?: string;
  status: string;
  isOnline: boolean;
  isDefault?: boolean;
  isVirtual?: boolean;
  connectionType?: string;
  paperLevel?: number;
  tonerLevel?: number;
  capabilities?: any;
}

export interface StoreRuntime {
  storeId: string;
  connectorConnected: boolean;
  connectorId?: string;
  connectorVersion: string;
  connectorHeartbeat: Date | null;
  printerState: 'READY' | 'OFFLINE';
  printerCount: number;
  printers: StoreRuntimePrinter[];
  activePrinter: string;
  activePrinterDetails?: StoreRuntimePrinter | null;
  testMode: boolean;
  hardwareStatus: string;
  printingJob?: string;
  lastUpdated: string;
}

export class RuntimeService {
  private static instance: RuntimeService;
  private runtimeMap: Map<string, StoreRuntime> = new Map();
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): RuntimeService {
    if (!RuntimeService.instance) {
      RuntimeService.instance = new RuntimeService();
    }
    return RuntimeService.instance;
  }

  public setSocketServer(io: SocketIOServer): void {
    this.io = io;
  }

  public getRuntime(storeId: string): StoreRuntime {
    const existing = this.runtimeMap.get(storeId);
    if (existing) {
      return existing;
    }

    const defaultRuntime: StoreRuntime = {
      storeId,
      connectorConnected: false,
      connectorId: undefined,
      connectorVersion: '1.0.0',
      connectorHeartbeat: null,
      printerState: 'OFFLINE',
      printerCount: 0,
      printers: [],
      activePrinter: '',
      activePrinterDetails: null,
      testMode: false,
      hardwareStatus: 'Desktop Connector Offline',
      printingJob: undefined,
      lastUpdated: new Date().toISOString()
    };

    this.runtimeMap.set(storeId, defaultRuntime);
    return defaultRuntime;
  }

  private calculatePrinterState(runtime: StoreRuntime): {
    printerState: 'READY' | 'OFFLINE';
    hardwareStatus: string;
    activePrinterDetails: StoreRuntimePrinter | null;
  } {
    if (!runtime.connectorConnected) {
      return {
        printerState: 'OFFLINE',
        hardwareStatus: 'Desktop Connector Offline',
        activePrinterDetails: null
      };
    }

    // In Test Mode, having an active virtual printer or testMode=true means the store is ready
    if (runtime.testMode) {
      const virtualPrinter: StoreRuntimePrinter = runtime.printers.find(
        (p) => p.isVirtual || p.name?.toLowerCase().includes('virtual') || p.name?.toLowerCase().includes('print to pdf')
      ) || {
        id: 'virtual_selfprint_pdf_printer',
        name: 'SelfPrint Virtual Printer',
        model: 'Virtual PDF Printer',
        brand: 'SelfPrint',
        status: 'ONLINE',
        isOnline: true,
        isDefault: true,
        isVirtual: true,
        connectionType: 'VIRTUAL',
        paperLevel: 100,
        tonerLevel: 100
      };

      return {
        printerState: 'READY',
        hardwareStatus: 'Test Mode Active (Virtual Printer Ready)',
        activePrinterDetails: virtualPrinter
      };
    }

    // Physical mode: filter out virtual printers
    const physicalPrinters = runtime.printers.filter(
      (p) => !p.isVirtual && !p.name?.toLowerCase().includes('virtual') && !p.name?.toLowerCase().includes('print to pdf')
    );

    const onlinePrinter = physicalPrinters.find((p) => p.isOnline || p.status === 'ONLINE' || p.status === 'Ready');

    if (onlinePrinter) {
      return {
        printerState: 'READY',
        hardwareStatus: `Online (${onlinePrinter.name})`,
        activePrinterDetails: onlinePrinter
      };
    }

    if (physicalPrinters.length > 0) {
      return {
        printerState: 'OFFLINE',
        hardwareStatus: 'Physical Printer Disconnected',
        activePrinterDetails: physicalPrinters[0]
      };
    }

    return {
      printerState: 'OFFLINE',
      hardwareStatus: 'No Physical Printer Connected',
      activePrinterDetails: null
    };
  }

  public broadcastRuntime(storeId: string): void {
    if (!this.io || !storeId) return;

    const runtime = this.getRuntime(storeId);
    logger.info(`[RuntimeService] 📡 Broadcasting runtime_updated for store:${storeId} (State: ${runtime.printerState}, TestMode: ${runtime.testMode}, Printers: ${runtime.printerCount})`);

    this.io.to(`store:${storeId}`).emit('runtime_updated', runtime);
    this.io.to('admin').emit('runtime_updated', runtime);

    // Backward compatibility events for existing components
    this.io.to(`store:${storeId}`).emit('connector_status', {
      storeId,
      status: runtime.connectorConnected ? 'ONLINE' : 'OFFLINE',
      state: runtime.connectorConnected ? 'CONNECTED' : 'OFFLINE',
      printerState: runtime.printerState,
      testMode: runtime.testMode,
      printers: runtime.printers,
      activePrinter: runtime.activePrinter
    });
  }

  public handleConnectorOnline(storeId: string, data: {
    connectorId?: string;
    version?: string;
    hostname?: string;
    printers?: any[];
    testMode?: boolean;
  }): void {
    const runtime = this.getRuntime(storeId);
    runtime.connectorConnected = true;
    if (data.connectorId) runtime.connectorId = data.connectorId;
    if (data.version) runtime.connectorVersion = data.version;
    runtime.connectorHeartbeat = new Date();

    if (data.testMode !== undefined) {
      runtime.testMode = Boolean(data.testMode);
    }

    if (Array.isArray(data.printers)) {
      this.updatePrintersInternal(runtime, data.printers);
    }

    const evaluated = this.calculatePrinterState(runtime);
    runtime.printerState = evaluated.printerState;
    runtime.hardwareStatus = evaluated.hardwareStatus;
    runtime.activePrinterDetails = evaluated.activePrinterDetails;
    runtime.activePrinter = evaluated.activePrinterDetails?.name || '';
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handleConnectorOffline(storeId: string, _data?: any): void {
    const runtime = this.getRuntime(storeId);
    runtime.connectorConnected = false;
    runtime.printerState = 'OFFLINE';
    runtime.hardwareStatus = 'Desktop Connector Offline';
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handleHeartbeat(storeId: string, data: {
    connectorId?: string;
    timestamp?: string;
    testMode?: boolean;
    printers?: any[];
  }): void {
    const runtime = this.getRuntime(storeId);
    runtime.connectorConnected = true;
    runtime.connectorHeartbeat = new Date(data.timestamp || Date.now());

    if (data.connectorId) runtime.connectorId = data.connectorId;
    if (data.testMode !== undefined) runtime.testMode = Boolean(data.testMode);

    if (Array.isArray(data.printers)) {
      this.updatePrintersInternal(runtime, data.printers);
    }

    const evaluated = this.calculatePrinterState(runtime);
    runtime.printerState = evaluated.printerState;
    runtime.hardwareStatus = evaluated.hardwareStatus;
    runtime.activePrinterDetails = evaluated.activePrinterDetails;
    runtime.activePrinter = evaluated.activePrinterDetails?.name || '';
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handlePrintersUpdated(storeId: string, rawPrinters: any[]): void {
    const runtime = this.getRuntime(storeId);
    this.updatePrintersInternal(runtime, rawPrinters);

    const evaluated = this.calculatePrinterState(runtime);
    runtime.printerState = evaluated.printerState;
    runtime.hardwareStatus = evaluated.hardwareStatus;
    runtime.activePrinterDetails = evaluated.activePrinterDetails;
    runtime.activePrinter = evaluated.activePrinterDetails?.name || '';
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handleTestModeChanged(storeId: string, testMode: boolean): void {
    const runtime = this.getRuntime(storeId);
    runtime.testMode = Boolean(testMode);

    const evaluated = this.calculatePrinterState(runtime);
    runtime.printerState = evaluated.printerState;
    runtime.hardwareStatus = evaluated.hardwareStatus;
    runtime.activePrinterDetails = evaluated.activePrinterDetails;
    runtime.activePrinter = evaluated.activePrinterDetails?.name || '';
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handleJobStarted(storeId: string, data: { jobId?: string; jobNumber?: string }): void {
    const runtime = this.getRuntime(storeId);
    runtime.printingJob = data.jobNumber || data.jobId;
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  public handleJobCompleted(storeId: string, _data: { jobId?: string; jobNumber?: string }): void {
    const runtime = this.getRuntime(storeId);
    runtime.printingJob = undefined;
    runtime.lastUpdated = new Date().toISOString();

    this.broadcastRuntime(storeId);
  }

  private updatePrintersInternal(runtime: StoreRuntime, rawPrinters: any[]): void {
    if (!Array.isArray(rawPrinters)) return;

    runtime.printers = rawPrinters.map((p: any) => ({
      id: p.id || p.deviceId || p.name,
      name: p.name || p.printerName || 'Printer',
      model: p.model || p.name || 'Generic Model',
      brand: p.brand || p.manufacturer || 'Generic',
      status: p.status || (p.isOnline ? 'ONLINE' : 'OFFLINE'),
      isOnline: Boolean(p.isOnline ?? (p.status === 'ONLINE' || p.status === 'Ready')),
      isDefault: Boolean(p.isDefault),
      isVirtual: Boolean(p.isVirtual || p.testMode || p.connectionType === 'VIRTUAL'),
      connectionType: p.connectionType || 'USB',
      paperLevel: p.paperLevel ?? 90,
      tonerLevel: p.tonerLevel ?? 85,
      capabilities: p.capabilities
    }));

    // Calculate physical count
    const physical = runtime.printers.filter(
      (p) => !p.isVirtual && !p.name.toLowerCase().includes('virtual') && !p.name.toLowerCase().includes('print to pdf')
    );
    runtime.printerCount = physical.length;
  }
}

export const runtimeService = RuntimeService.getInstance();
