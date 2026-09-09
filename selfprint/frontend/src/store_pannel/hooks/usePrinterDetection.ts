import { useState, useEffect, useRef } from 'react';
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

export const usePrinterDetection = (options?: {
  initialPrinter?: DetectedPrinter | null;
  onComplete?: (printer: DetectedPrinter) => void;
  onClose?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState<PrinterWizardStep>('Welcome');
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

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, []);

  /**
   * Starts real hardware scanning via local Desktop Host Service
   */
  const startScanning = async (simulateError?: PrinterErrorType) => {
    setCurrentStep('Scanning');
    setScanningProgress(0);
    setScanningMessage(SCANNING_MESSAGES[0]);
    setCurrentError(null);

    let messageIdx = 0;

    // Message rotation
    messageTimerRef.current = setInterval(() => {
      messageIdx = (messageIdx + 1) % SCANNING_MESSAGES.length;
      setScanningMessage(SCANNING_MESSAGES[messageIdx]);
    }, 600);

    // Progress animation
    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress = Math.min(progress + 15, 90);
      setScanningProgress(progress);
    }, 150);

    try {
      if (simulateError) {
        throw new Error(simulateError);
      }

      // Query real installed system printers from local host bridge
      const printers = await printerService.detectPrinters();
      
      setScanningProgress(100);
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);

      setDetectedPrinters(printers);
      if (printers.length > 0) {
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

  /**
   * Starts printer hardware diagnostics and calibration
   */
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

  /**
   * Updates configuration settings
   */
  const updateConfig = (updates: Partial<PrinterSetupConfig>) => {
    setPrinterConfig((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Sends test print page
   */
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

  /**
   * Finalizes setup and saves state to MongoDB backend
   */
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

  /**
   * Handles "Don't show again" preference toggle
   */
  const handleToggleDontShowAgain = (checked: boolean) => {
    setDontShowAgain(checked);
    printerService.setWizardSuppressed(checked);
  };

  /**
   * Skips wizard setup
   */
  const skipSetup = () => {
    printerService.setWizardSuppressed(dontShowAgain);
    if (options?.onClose) {
      options.onClose();
    }
  };

  return {
    currentStep,
    setCurrentStep,
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
