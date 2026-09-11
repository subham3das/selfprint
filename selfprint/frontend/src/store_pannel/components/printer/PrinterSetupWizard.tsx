import React, { useState } from 'react';
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
  Check,
  Download,
  Key,
  Copy,
  RefreshCw,
  Clock,
  ShieldCheck
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
    connectorState,
    backendConnector,
    isCheckingStatus,
    pairingCode,
    expiresInSeconds,
    isGeneratingCode,
    generatePairingCode,
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

  const [isCopied, setIsCopied] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isReadyToProceed = connectorState === 'CONNECTED' || connectorState === 'READY';

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

                {/* 8-STATE BACKEND-DRIVEN CONNECTOR STATUS CARD */}
                {connectorState === 'NOT_INSTALLED' && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl border bg-slate-50 border-slate-200/80 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="font-bold text-[11px] text-slate-900">Desktop Connector Not Detected</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded">Offline</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      SelfPrint Desktop Connector is required to link physical printers to this store.
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="/downloads/selfprint-connector.exe"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Connector</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => refreshConnectorStatus()}
                        disabled={isCheckingStatus}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-purple-600 transition-colors"
                      >
                        <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        <span>{isCheckingStatus ? 'Checking...' : 'Check Again'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {connectorState === 'INSTALLED_NOT_RUNNING' && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl border bg-amber-50/70 border-amber-200/80 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-bold text-[11px] text-amber-900">Connector App Closed / Offline</span>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-200/80 text-amber-800 text-[9px] font-bold rounded">Action Required</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                      This store is paired, but the SelfPrint Desktop Connector is offline or closed. Please launch the desktop application.
                    </p>
                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => refreshConnectorStatus()}
                        disabled={isCheckingStatus}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        <span>{isCheckingStatus ? 'Checking...' : 'Check Connection'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {connectorState === 'RUNNING_UNPAIRED' && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl border bg-slate-50 border-slate-200/90 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-bold text-[11px] text-slate-900">Desktop Connector Running</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded">Not Connected</span>
                    </div>
                    
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
                      <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        This computer is not linked to this store yet. Generate a secure pairing code to authenticate.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[10px] text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                      <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-100">Setup Steps:</div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px]">1</span>
                        <span>Click "Generate Pairing Code" below</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px]">2</span>
                        <span>Open Desktop Connector on this computer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px]">3</span>
                        <span>Enter the 6-character code and click Connect</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[9px]">4</span>
                        <span>Wait for real-time authentication</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => generatePairingCode()}
                        disabled={isGeneratingCode}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-60"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{isGeneratingCode ? 'Generating Code...' : 'Generate Pairing Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => refreshConnectorStatus()}
                        disabled={isCheckingStatus}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-[10px] font-bold cursor-pointer"
                        title="Refresh Status"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {connectorState === 'PAIRING' && (
                  <div className="max-w-md mx-auto p-4 rounded-2xl border bg-purple-50/50 border-purple-200/80 text-left space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
                        <span className="font-bold text-[11px] text-purple-900">Pairing in Progress</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>Valid for {formatTimer(expiresInSeconds)}</span>
                      </div>
                    </div>

                    <div className="text-center py-2 bg-white rounded-xl border border-purple-100 shadow-sm space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pairing Code</span>
                      <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-purple-700 select-all">
                        {pairingCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => generatePairingCode()}
                        disabled={isGeneratingCode}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Generate New Code"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                        <span>New</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-center text-slate-500 font-medium">
                      Open Desktop Connector on your computer, enter this code, and click Connect.
                    </p>
                  </div>
                )}

                {connectorState === 'AUTHENTICATING' && (
                  <div className="max-w-md mx-auto p-5 rounded-2xl border bg-indigo-50/60 border-indigo-200/80 text-center space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-indigo-900">Authenticating Desktop Connector...</div>
                      <p className="text-[10px] text-indigo-600/90 font-medium mt-1">
                        Validating device token and establishing realtime socket connection.
                      </p>
                    </div>
                  </div>
                )}

                {(connectorState === 'CONNECTED' || connectorState === 'READY' || connectorState === 'SCANNING_PRINTERS') && (
                  <div className="max-w-md mx-auto p-3.5 rounded-2xl border text-left bg-emerald-50/50 border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        <span className="font-bold text-[11px] text-slate-900">Desktop Connector Active</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">
                        Connected & Owned
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-600 bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <div>
                        <span className="font-semibold text-slate-700">Machine: </span>
                        <span className="font-mono font-bold text-slate-900">{backendConnector.machineName || 'Host Machine'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Authenticated</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-purple-700">
                          {backendConnector.physicalPrinterCount} {backendConnector.physicalPrinterCount === 1 ? 'Printer' : 'Printers'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary & Secondary Actions */}
                <div className="space-y-3 pt-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => startScanning()}
                    disabled={!isReadyToProceed}
                    className={`w-full py-3 px-6 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isReadyToProceed
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/25 hover:-translate-y-0.5'
                        : 'bg-slate-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>
                      {isReadyToProceed
                        ? 'Start Hardware Setup'
                        : connectorState === 'PAIRING'
                        ? 'Waiting for Connector Pairing...'
                        : connectorState === 'AUTHENTICATING'
                        ? 'Authenticating Connector...'
                        : 'Pair Desktop Connector to Proceed'}
                    </span>
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
