import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PrinterWizardStep,
  DetectedPrinter,
  PrinterSetupConfig,
  PrinterErrorType
} from '../types/printerSetup.types';
import {
  SCANNING_MESSAGES,
  CALIBRATION_STEPS
} from '../data/printer.mock';

import { printerService } from '../services/printer.service';
import { useStoreSession } from './useStoreSession';
import { useConnectorStore, ConnectorWizardState } from '../stores/useConnectorStore';
import { getSocket, joinStoreRoom } from '@/lib/socket';

export type { ConnectorWizardState };

export interface BackendConnectorData {
  paired: boolean;
  authenticated: boolean;
  socketConnected: boolean;
  hostRunning: boolean;
  deviceTokenValid: boolean;
  storeId: string | null;
  machineName: string | null;
  physicalPrinterCount: number;
  status: 'ONLINE' | 'OFFLINE';
  state: string;
}

export const usePrinterDetection = (options?: {
  initialPrinter?: DetectedPrinter | null;
  onComplete?: (printer: DetectedPrinter) => void;
  onClose?: () => void;
}) => {
  const storeInfo = useStoreSession();
  const storeId = storeInfo?.id;

  const [currentStep, setCurrentStep] = useState<PrinterWizardStep>('Welcome');

  // Consume Centralized Single Source of Truth from Zustand Store
  const {
    paired,
    isOnline,
    state: storeState,
    hostname,
    socketConnected,
    authenticated,
    hostRunning,
    physicalPrinterCount,
    lastHeartbeat: _lastHeartbeat,
    isCheckingStatus,
    pairingCode,
    pairingExpiresInSeconds,
    isGeneratingCode,
    hydrate,
    manualRefresh,
    generatePairingCode: storeGenPairingCode,
    handleSocketHeartbeat,
    handleSocketConnected,
    handleSocketDisconnected,
    handleSocketPaired,
    handleSocketUnpaired,
    handlePrintersUpdated,
    decrementCountdown
  } = useConnectorStore();

  const [localWizardState, setLocalWizardState] = useState<ConnectorWizardState | null>(null);

  // Derived connectorState
  const connectorState: ConnectorWizardState = (localWizardState || storeState) as ConnectorWizardState;
  const setConnectorState = (s: ConnectorWizardState) => setLocalWizardState(s);

  // Backend Connector Data Adapter
  const backendConnector: BackendConnectorData = {
    paired,
    authenticated,
    socketConnected,
    hostRunning,
    deviceTokenValid: paired,
    storeId: storeId || null,
    machineName: hostname,
    physicalPrinterCount,
    status: isOnline ? 'ONLINE' : 'OFFLINE',
    state: storeState
  };

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Printer Scanning & Setup State
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanningMessage, setScanningMessage] = useState(SCANNING_MESSAGES[0]);
  const [detectedPrinters, setDetectedPrinters] = useState<DetectedPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<DetectedPrinter | null>(
    options?.initialPrinter || null
  );
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationStepIndex, setCalibrationStepIndex] = useState(0);
  const [printerConfig, setPrinterConfig] = useState<PrinterSetupConfig>(
    printerService.getSavedConfig()
  );
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);
  const [currentError, setCurrentError] = useState<PrinterErrorType>(null);
  const [dontShowAgain, setDontShowAgain] = useState(
    printerService.isWizardSuppressed()
  );

  const scanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ──── Step 1: Initial Hydration on Mount (REST once) ─────
  useEffect(() => {
    hydrate(storeId);
  }, [storeId, hydrate]);

  // ──── Step 2: 10-Minute Pairing Code Countdown ────────────────────────────
  const generatePairingCode = useCallback(async () => {
    const code = await storeGenPairingCode(storeId);
    if (code) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        decrementCountdown();
      }, 1000);
    }
  }, [storeId, storeGenPairingCode, decrementCountdown]);

  const resetPairing = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    manualRefresh(storeId);
  }, [storeId, manualRefresh]);

  // ──── Step 3: Pure WebSocket In-Memory Event Handlers ───────────────────────
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
    const onUnpaired = () => {
      handleSocketUnpaired();
      setDetectedPrinters([]);
      setSelectedPrinter(null);
      setCurrentStep('Welcome');
    };
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

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, []);

  // ──── Step 4: Hardware Scanning ──────────────────────────────────────────
  const startScanning = async (simulateError?: PrinterErrorType) => {
    setCurrentError(null);

    if (simulateError) {
      setCurrentStep('Scanning');
      setTimeout(() => {
        setCurrentError(simulateError);
        setCurrentStep('Error');
      }, 500);
      return;
    }

    // Verify backend/store confirms connection before scanning
    if (!paired || !isOnline) {
      setCurrentError('HostServiceRequired');
      setCurrentStep('Error');
      return;
    }

    setLocalWizardState('SCANNING_PRINTERS');
    setCurrentStep('Scanning');
    setScanningProgress(0);
    setScanningMessage(SCANNING_MESSAGES[0]);

    let messageIdx = 0;
    messageTimerRef.current = setInterval(() => {
      messageIdx = (messageIdx + 1) % SCANNING_MESSAGES.length;
      setScanningMessage(SCANNING_MESSAGES[messageIdx]);
    }, 600);

    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress = Math.min(progress + 15, 90);
      setScanningProgress(progress);
    }, 150);

    try {
      const printers = await printerService.detectPrinters({ storeId });

      setScanningProgress(100);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);

      setDetectedPrinters(printers);
      if (printers.length > 0) {
        setLocalWizardState('READY');
        setSelectedPrinter(printers[0]);
        setCurrentStep('Selection');
      } else {
        setLocalWizardState('CONNECTED');
        setSelectedPrinter(null);
        setCurrentError('NoPrinterFound');
        setCurrentStep('Error');
      }
    } catch (err: any) {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
      setScanningProgress(100);

      const errType = (err.message === 'NoPhysicalPrinterDetected' || err.message === 'NoPrinterFound')
        ? 'NoPhysicalPrinterDetected'
        : 'HostServiceRequired';
      setDetectedPrinters([]);
      setSelectedPrinter(null);
      setCurrentError(errType);
      setCurrentStep('Error');
    }
  };

  const startCalibration = () => {
    setCurrentStep('Calibration');
    setCalibrationProgress(0);
    setCalibrationStepIndex(0);

    let step = 0;
    const calInterval = setInterval(() => {
      step += 1;
      setCalibrationStepIndex(step);
      setCalibrationProgress(Math.round((step / CALIBRATION_STEPS.length) * 100));

      if (step >= CALIBRATION_STEPS.length) {
        clearInterval(calInterval);
        setTimeout(() => {
          setCurrentStep('Configuration');
        }, 400);
      }
    }, 400);
  };

  const updateConfig = (updates: Partial<PrinterSetupConfig>) => {
    setPrinterConfig((prev) => ({ ...prev, ...updates }));
  };

  const runTestPrint = async () => {
    setIsTestPrinting(true);
    try {
      await printerService.sendTestPrint(selectedPrinter?.id || '', selectedPrinter?.name, storeId);
      setTestPrintSuccess(true);
    } catch {
      setTestPrintSuccess(false);
    } finally {
      setIsTestPrinting(false);
    }
  };

  const finishSetup = async () => {
    if (selectedPrinter) {
      await printerService.saveConfiguredPrinterToBackend(selectedPrinter, printerConfig);
      await printerService.completeFirstLogin(true);
      if (options?.onComplete) {
        options.onComplete(selectedPrinter);
      }
    }
    printerService.setWizardSuppressed(dontShowAgain);
    setCurrentStep('Success');
  };

  const handleToggleDontShowAgain = (checked: boolean) => {
    setDontShowAgain(checked);
    printerService.setWizardSuppressed(checked);
  };

  const skipSetup = () => {
    printerService.setWizardSuppressed(dontShowAgain);
    if (options?.onClose) {
      options.onClose();
    }
  };

  // Backward compatibility object for hostStatus
  const hostStatus = {
    isOnline: paired && isOnline,
    isChecking: isCheckingStatus,
    hostInfo: hostname ? { hostname } : null
  };

  return {
    currentStep,
    setCurrentStep,
    connectorState,
    setConnectorState,
    backendConnector,
    isCheckingStatus,
    pairingCode,
    expiresInSeconds: pairingExpiresInSeconds,
    isGeneratingCode,
    generatePairingCode,
    resetPairing,
    refreshConnectorStatus: () => manualRefresh(storeId),
    scanningProgress,
    scanningMessage,
    detectedPrinters,
    selectedPrinter,
    setSelectedPrinter,
    calibrationProgress,
    calibrationStepIndex,
    printerConfig,
    isTestPrinting,
    testPrintSuccess,
    currentError,
    setCurrentError,
    hostStatus,
    checkHost: () => manualRefresh(storeId),
    dontShowAgain,
    startScanning,
    startCalibration,
    updateConfig,
    runTestPrint,
    finishSetup,
    handleToggleDontShowAgain,
    skipSetup
  };
};
