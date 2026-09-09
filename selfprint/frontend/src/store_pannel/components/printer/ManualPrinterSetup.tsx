import React, { useState } from 'react';
import {
  Usb,
  Wifi,
  Network,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

import {
  DetectedPrinter,
  PrinterConnection
} from '../../types/printerSetup.types';

interface ManualPrinterSetupProps {
  onConnect: (printer: DetectedPrinter) => void;
  onBack: () => void;
}

export const ManualPrinterSetup: React.FC<ManualPrinterSetupProps> = ({
  onConnect,
  onBack
}) => {
  const [connectionType, setConnectionType] = useState<PrinterConnection>('USB');
  const [printerName, setPrinterName] = useState('');
  const [brand, setBrand] = useState<'HP' | 'Epson' | 'Canon' | 'Brother' | 'TVS'>('HP');
  const [port, setPort] = useState('USB001');
  const [ipAddress, setIpAddress] = useState('192.168.1.108');
  const [networkPort, setNetworkPort] = useState('9100');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestAndConnect = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate connection ping
    await new Promise((resolve) => setTimeout(resolve, 800));

    const manualPrinter: DetectedPrinter = {
      id: `prn-manual-${Date.now()}`,
      name: printerName,
      brand: brand,
      model: `${printerName} (Manual Config)`,
      type: 'LaserJet',
      connection: connectionType,
      port: connectionType === 'USB' ? port : undefined,
      ipAddress: connectionType === 'WiFi' || connectionType === 'LAN' ? ipAddress : undefined,
      isColor: brand === 'Epson',
      isDuplexSupported: false,
      isAutoCutSupported: brand === 'TVS',
      isDriverInstalled: true,
      paperLevel: 90,
      inkLevels: { black: 85 },
      status: 'Online',
      firmwareVersion: 'vManual-1.0',
      serialNumber: `SN-MANUAL-${Date.now().toString().slice(-4)}`,
      description: 'Manually configured local printer.'
    };

    setIsTesting(false);
    setTestResult('success');

    setTimeout(() => {
      onConnect(manualPrinter);
    }, 400);
  };

  return (
    <div className="py-4 px-2 space-y-6 max-w-lg mx-auto text-left text-xs">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-slate-100 text-center sm:text-left">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Manual Printer Configuration
        </h3>
        <p className="text-xs text-slate-500">
          Enter port address or local static IP if auto-discovery did not find your device.
        </p>
      </div>

      {/* Connection Type Tabs */}
      <div className="space-y-1.5">
        <label className="font-extrabold text-slate-900 block">
          Interface Connection Protocol
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setConnectionType('USB')}
            className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              connectionType === 'USB'
                ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-600/10'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>USB Port</span>
          </button>

          <button
            type="button"
            onClick={() => setConnectionType('WiFi')}
            className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              connectionType === 'WiFi'
                ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-600/10'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi / LAN IP</span>
          </button>

          <button
            type="button"
            onClick={() => setConnectionType('LAN')}
            className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              connectionType === 'LAN'
                ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-600/10'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>LAN Network</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Printer Name & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Printer Name / Model
            </label>
            <input
              type="text"
              value={printerName}
              onChange={(e) => setPrinterName(e.target.value)}
              placeholder="e.g. HP LaserJet 1020"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Manufacturer Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none cursor-pointer"
            >
              <option value="HP">HP (Hewlett-Packard)</option>
              <option value="Epson">Epson</option>
              <option value="Canon">Canon</option>
              <option value="Brother">Brother</option>
              <option value="TVS">TVS Electronics</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields based on Connection */}
        {connectionType === 'USB' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Local USB Port
            </label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono cursor-pointer"
            >
              <option value="USB001">USB001 (Virtual printer port for USB)</option>
              <option value="USB002">USB002 (Virtual printer port for USB)</option>
              <option value="DOT4_001">DOT4_001 (HP Print Device)</option>
              <option value="LPT1">LPT1 (Printer Port)</option>
              <option value="COM1">COM1 (Serial Port)</option>
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Static IP Address
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Raw Port
              </label>
              <input
                type="text"
                value={networkPort}
                onChange={(e) => setNetworkPort(e.target.value)}
                placeholder="9100"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Result feedback */}
      {testResult === 'success' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Connection verified! Initializing device profile...</span>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auto-Scan</span>
        </button>

        <button
          type="button"
          disabled={isTesting || !printerName}
          onClick={handleTestAndConnect}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Testing Port Ping...</span>
            </>
          ) : (
            <>
              <span>Verify & Connect</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
