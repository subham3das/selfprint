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
import { getSocket } from '@/lib/socket';

export type ConnectorWizardState =
  | 'NOT_INSTALLED'
  | 'INSTALLED_NOT_RUNNING'
  | 'RUNNING_UNPAIRED'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'SCANNING_PRINTERS'
  | 'READY';

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
  const [connectorState, setConnectorState] = useState<ConnectorWizardState>('RUNNING_UNPAIRED');
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Backend Single Source of Truth
  const [backendConnector, setBackendConnector] = useState<BackendConnectorData>({
    paired: false,
    authenticated: false,
    socketConnected: false,
    hostRunning: false,
    deviceTokenValid: false,
    storeId: null,
    machineName: null,
    physicalPrinterCount: 0,
    status: 'OFFLINE',
    state: 'NOT_PAIRED'
  });

  // Pairing Code State
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresInSeconds, setExpiresInSeconds] = useState(600);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
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

  // ─── Step 1: Check Backend Ownership Status (Single Source of Truth) ─────
  const refreshConnectorStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const backendRes = await printerService.getConnectorStatus(storeId);
      const isHostAlive = (await printerService.checkHostService()).isRunning;

      setBackendConnector({
        paired: backendRes.paired,
        authenticated: backendRes.authenticated,
        socketConnected: backendRes.socketConnected,
        hostRunning: backendRes.hostRunning,
        deviceTokenValid: backendRes.deviceTokenValid,
        storeId: backendRes.storeId,
        machineName: backendRes.paired && backendRes.isOnline ? backendRes.machineName : null,
        physicalPrinterCount: backendRes.physicalPrinterCount,
        status: backendRes.isOnline ? 'ONLINE' : 'OFFLINE',
        state: backendRes.state
      });

      // Strict State Machine Determination
      setConnectorState((prevState) => {
        // If pairing is explicitly in progress in the UI, keep PAIRING state unless backend confirms paired
        if (prevState === 'PAIRING' && !backendRes.paired) {
          return 'PAIRING';
        }
        if (prevState === 'AUTHENTICATING' && !backendRes.paired) {
          return 'AUTHENTICATING';
        }

        // 1. Confirmed paired & online by backend
        if (backendRes.paired && backendRes.isOnline) {
          if (prevState === 'SCANNING_PRINTERS') return 'SCANNING_PRINTERS';
          if (backendRes.physicalPrinterCount > 0) return 'READY';
          return 'CONNECTED';
        }

        // 2. Paired in database, but host or socket is offline
        if (backendRes.paired && !backendRes.isOnline) {
          return 'INSTALLED_NOT_RUNNING';
        }

        // 3. Unpaired: Check if local desktop software is running on :4500
        if (isHostAlive) {
          return 'RUNNING_UNPAIRED';
        }

        // 4. Desktop software is not installed / not running
        return 'NOT_INSTALLED';
      });
    } catch (err) {
      console.warn('Failed to refresh connector status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [storeId]);

  // ─── Step 2: Generate 10-Minute Pairing Code from Backend ────────────────
  const generatePairingCode = useCallback(async () => {
    setIsGeneratingCode(true);
    setConnectorState('PAIRING');
    try {
      const res = await printerService.generatePairingCode(storeId);
      const code = res.code || res.pairingCode;
      const seconds = res.expiresInSeconds || 600;

      setPairingCode(code);
      setExpiresInSeconds(seconds);

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
    } catch (err) {
      console.error('Failed to generate pairing code:', err);
      setConnectorState('RUNNING_UNPAIRED');
    } finally {
      setIsGeneratingCode(false);
    }
  }, [storeId]);

  const resetPairing = useCallback(() => {
    setPairingCode(null);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    refreshConnectorStatus();
  }, [refreshConnectorStatus]);

  // ─── Step 3: Realtime Socket.IO Listeners ─────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (storeId) {
      socket.emit('join_store', storeId);
    }

    const handleConnected = () => refreshConnectorStatus();
    const handleDisconnected = () => refreshConnectorStatus();
    const handleHeartbeat = () => refreshConnectorStatus();

    const handlePaired = () => {
      setConnectorState('CONNECTED');
      setPairingCode(null);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      refreshConnectorStatus();
    };

    // CRITICAL: Unpair wipe
    const handleUnpaired = () => {
      // Immediately wipe cached connector information
      setBackendConnector({
        paired: false,
        authenticated: false,
        socketConnected: false,
        hostRunning: false,
        deviceTokenValid: false,
        storeId: null,
        machineName: null,
        physicalPrinterCount: 0,
        status: 'OFFLINE',
        state: 'NOT_PAIRED'
      });
      setDetectedPrinters([]);
      setSelectedPrinter(null);
      setCurrentStep('Welcome');
      setConnectorState('RUNNING_UNPAIRED');
      refreshConnectorStatus();
    };

    const handlePrintersUpdated = (data: any) => {
      if (Array.isArray(data?.printers)) {
        setDetectedPrinters(data.printers);
        if (data.printers.length > 0) {
          setConnectorState('READY');
        }
      }
      refreshConnectorStatus();
    };

    socket.on('connector_connected', handleConnected);
    socket.on('connector_disconnected', handleDisconnected);
    socket.on('connector_authenticated', handleConnected);
    socket.on('connector_paired', handlePaired);
    socket.on('connector_unpaired', handleUnpaired);
    socket.on('printers_updated', handlePrintersUpdated);
    socket.on('heartbeat', handleHeartbeat);

    return () => {
      socket.off('connector_connected', handleConnected);
      socket.off('connector_disconnected', handleDisconnected);
      socket.off('connector_authenticated', handleConnected);
      socket.off('connector_paired', handlePaired);
      socket.off('connector_unpaired', handleUnpaired);
      socket.off('printers_updated', handlePrintersUpdated);
      socket.off('heartbeat', handleHeartbeat);
    };
  }, [storeId, refreshConnectorStatus]);

  // Initial load and periodic status polling
  useEffect(() => {
    refreshConnectorStatus();
    const interval = setInterval(refreshConnectorStatus, 6000);
    return () => {
      clearInterval(interval);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [refreshConnectorStatus]);

  // ─── Step 4: Hardware Scanning ───────────────────────────────────────────
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

    // Verify backend confirms connection before scanning
    if (!backendConnector.paired || !backendConnector.socketConnected) {
      setCurrentError('HostServiceRequired');
      setCurrentStep('Error');
      return;
    }

    setConnectorState('SCANNING_PRINTERS');
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
      const printers = await printerService.detectPrinters();

      setScanningProgress(100);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);

      setDetectedPrinters(printers);
      if (printers.length > 0) {
        setConnectorState('READY');
        setSelectedPrinter(printers[0]);
        setCurrentStep('Selection');
      } else {
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
      setCurrentError(errType);
      setCurrentStep('Error');
    }
  };

  const startCalibration = () => {
    setCurrentStep('Calibration');
    setCalibrationProgress(0);
    setCalibrationStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCalibrationStepIndex(step);
      setCalibrationProgress(Math.round((step / CALIBRATION_STEPS.length) * 100));

      if (step >= CALIBRATION_STEPS.length) {
        clearInterval(interval);
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
      await printerService.sendTestPrint(selectedPrinter?.id || '', selectedPrinter?.name);
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
    isOnline: backendConnector.paired && backendConnector.status === 'ONLINE',
    isChecking: isCheckingStatus,
    hostInfo: backendConnector.machineName ? { hostname: backendConnector.machineName } : null
  };

  return {
    currentStep,
    setCurrentStep,
    connectorState,
    setConnectorState,
    backendConnector,
    isCheckingStatus,
    pairingCode,
    expiresInSeconds,
    isGeneratingCode,
    generatePairingCode,
    resetPairing,
    refreshConnectorStatus,
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
    checkHost: refreshConnectorStatus,
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
