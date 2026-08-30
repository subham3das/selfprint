import { useState, useEffect, useRef } from 'react';
import {
  PrinterWizardStep,
  DetectedPrinter,
  PrinterSetupConfig,
  PrinterErrorType
} from '../types/printerSetup.types';
import {
  MOCK_DETECTED_PRINTERS,
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
   * Starts the realistic hardware scanning sequence
   */
  const startScanning = (simulateError?: PrinterErrorType) => {
    setCurrentStep('Scanning');
    setScanningProgress(0);
    setScanningMessage(SCANNING_MESSAGES[0]);
    setCurrentError(null);

    let progress = 0;
    let messageIdx = 0;

    // Message rotation
    messageTimerRef.current = setInterval(() => {
      messageIdx = (messageIdx + 1) % SCANNING_MESSAGES.length;
      setScanningMessage(SCANNING_MESSAGES[messageIdx]);
    }, 700);

    // Progress increments
    scanTimerRef.current = setInterval(() => {
      progress += 10;
      setScanningProgress(Math.min(progress, 100));

      if (progress >= 100) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);
        if (messageTimerRef.current) clearInterval(messageTimerRef.current);

        if (simulateError) {
          setCurrentError(simulateError);
          setCurrentStep('Error');
          return;
        }

        const printers = MOCK_DETECTED_PRINTERS;
        setDetectedPrinters(printers);

        if (printers.length === 0) {
          setCurrentError('NoPrinterFound');
          setCurrentStep('Error');
        } else if (printers.length === 1) {
          setSelectedPrinter(printers[0]);
          setCurrentStep('Selection');
        } else {
          setSelectedPrinter(printers[0]);
          setCurrentStep('Selection');
        }
      }
    }, 200);
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
        }, 500);
      }
    }, 450);
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
      await printerService.sendTestPrint(selectedPrinter?.id || 'prn-hp-1020');
      setTestPrintSuccess(true);
    } catch {
      setTestPrintSuccess(false);
    } finally {
      setIsTestPrinting(false);
    }
  };

  /**
   * Finalizes setup and saves state
   */
  const finishSetup = () => {
    if (selectedPrinter) {
      printerService.saveConfiguredPrinter(selectedPrinter, printerConfig);
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
