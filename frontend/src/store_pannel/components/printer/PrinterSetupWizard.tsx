import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  X,
  Usb,
  Wifi,
  Network,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check
} from 'lucide-react';

import { usePrinterDetection } from '../../hooks/usePrinterDetection';
import { DetectedPrinter } from '../../types/printerSetup.types';
import { PrinterScanner } from './PrinterScanner';
import { PrinterSelection } from './PrinterSelection';
import { PrinterCalibration } from './PrinterCalibration';
import { PrinterConfiguration } from './PrinterConfiguration';
import { PrinterTestPage } from './PrinterTestPage';
import { PrinterErrorView } from './PrinterErrorView';
import { ManualPrinterSetup } from './ManualPrinterSetup';

interface PrinterSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPrinterConfigured?: (printer: DetectedPrinter) => void;
}

export const PrinterSetupWizard: React.FC<PrinterSetupWizardProps> = ({
  isOpen,
  onClose,
  onPrinterConfigured
}) => {
  const {
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
    dontShowAgain,
    startScanning,
    startCalibration,
    updateConfig,
    runTestPrint,
    finishSetup,
    handleToggleDontShowAgain,
    skipSetup
  } = usePrinterDetection({
    onComplete: (printer) => {
      if (onPrinterConfigured) onPrinterConfigured(printer);
    },
    onClose
  });

  if (!isOpen) return null;

  const supportedTypes = [
    { title: 'USB Printers', icon: Usb },
    { title: 'Wi-Fi Wireless', icon: Wifi },
    { title: 'Network / LAN', icon: Network },
    { title: 'Thermal Receipt', icon: Receipt }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={skipSetup}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Main Wizard Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 z-10 text-xs overflow-hidden"
      >
        {/* Top Header & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-xs">
                  Printer Setup Wizard
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                  AUTO-DETECTION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Step: {currentStep}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={skipSetup}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Wizard Body */}
        <div className="min-h-[360px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STEP 1: WELCOME SCREEN */}
            {currentStep === 'Welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-4 space-y-6 text-center"
              >
                {/* Visual Printer Graphic */}
                <div className="relative w-28 h-20 mx-auto flex items-center justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/30">
                    <Printer className="w-8 h-8 stroke-[1.75]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Let's connect your printer.
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Self Print automatically detects compatible printers connected to your computer via USB, Wi-Fi, or Network LAN. This setup only takes a minute.
                  </p>
                </div>

                {/* 4 Supported Hardware Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-md mx-auto">
                  {supportedTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col items-center gap-1 text-slate-700 font-bold text-[11px]"
                      >
                        <Icon className="w-4 h-4 text-purple-600" />
                        <span>{item.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Primary & Secondary Actions */}
                <div className="space-y-3 pt-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => startScanning()}
                    className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Start Hardware Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={skipSetup}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      Skip For Now
                    </button>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => handleToggleDontShowAgain(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>Don't show again on this device</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SCANNING SCREEN */}
            {currentStep === 'Scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PrinterScanner
                  progress={scanningProgress}
                  message={scanningMessage}
                />
              </motion.div>
            )}

            {/* STEP 3: SELECTION SCREEN */}
            {currentStep === 'Selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PrinterSelection
                  printers={detectedPrinters}
                  selectedPrinter={selectedPrinter}
                  onSelect={(p) => setSelectedPrinter(p)}
                  onContinue={() => startCalibration()}
                  onRescan={() => startScanning()}
                  onManualSetup={() => setCurrentStep('ManualSetup')}
                />
              </motion.div>
            )}

            {/* STEP 4: CALIBRATION SCREEN */}
            {currentStep === 'Calibration' && (
              <motion.div
                key="calibration"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <PrinterCalibration
                  progress={calibrationProgress}
                  currentStepIndex={calibrationStepIndex}
                  printerName={selectedPrinter?.name || 'Printer'}
                />
              </motion.div>
            )}

            {/* STEP 5: CONFIGURATION SCREEN */}
            {currentStep === 'Configuration' && selectedPrinter && (
              <motion.div
                key="configuration"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PrinterConfiguration
                  printer={selectedPrinter}
                  config={printerConfig}
                  onChange={updateConfig}
                  onProceed={() => setCurrentStep('TestPrint')}
                  onBack={() => setCurrentStep('Selection')}
                />
              </motion.div>
            )}

            {/* STEP 6: TEST PRINT SCREEN */}
            {currentStep === 'TestPrint' && selectedPrinter && (
              <motion.div
                key="testprint"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PrinterTestPage
                  printer={selectedPrinter}
                  config={printerConfig}
                  isTestPrinting={isTestPrinting}
                  testPrintSuccess={testPrintSuccess}
                  onPrintTestPage={runTestPrint}
                  onComplete={finishSetup}
                  onBack={() => setCurrentStep('Configuration')}
                />
              </motion.div>
            )}

            {/* STEP 7: SUCCESS SCREEN */}
            {currentStep === 'Success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 px-2 text-center space-y-6 max-w-md mx-auto"
              >
                {/* Animated Green Checkmark */}
                <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    🎉 Printer Ready!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your printer <strong className="text-slate-900 font-bold">{selectedPrinter?.name}</strong> is connected successfully and ready to receive customer print jobs automatically.
                  </p>
                </div>

                {/* 4 Feature Activation Cards */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">Printer Connected</p>
                      <p className="text-[9px] text-slate-400">{selectedPrinter?.connection || 'USB'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">Paper Ready</p>
                      <p className="text-[9px] text-slate-400">{printerConfig.defaultPaper}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">Active Spooler</p>
                      <p className="text-[9px] text-slate-400">Low Latency</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">Auto Printing</p>
                      <p className="text-[9px] text-slate-400">Enabled</p>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Go to Store Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ERROR SCREEN */}
            {currentStep === 'Error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PrinterErrorView
                  errorType={currentError}
                  onRetry={() => startScanning()}
                  onManualSetup={() => setCurrentStep('ManualSetup')}
                />
              </motion.div>
            )}

            {/* MANUAL SETUP SCREEN */}
            {currentStep === 'ManualSetup' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ManualPrinterSetup
                  onConnect={(manualPrinter) => {
                    setSelectedPrinter(manualPrinter);
                    startCalibration();
                  }}
                  onBack={() => setCurrentStep('Selection')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
