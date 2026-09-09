import React from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  CheckCircle2,
  Usb,
  Wifi,
  Network,
  Bluetooth,
  Share2,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

import { DetectedPrinter } from '../../types/printerSetup.types';

interface PrinterSelectionProps {
  printers: DetectedPrinter[];
  selectedPrinter: DetectedPrinter | null;
  onSelect: (printer: DetectedPrinter) => void;
  onContinue: () => void;
  onRescan: () => void;
  onManualSetup: () => void;
}

export const PrinterSelection: React.FC<PrinterSelectionProps> = ({
  printers,
  selectedPrinter,
  onSelect,
  onContinue,
  onRescan,
  onManualSetup
}) => {
  const getConnectionIcon = (conn: string) => {
    switch (conn) {
      case 'USB':
        return <Usb className="w-3.5 h-3.5" />;
      case 'Wi-Fi':
        return <Wifi className="w-3.5 h-3.5" />;
      case 'Ethernet':
      case 'LAN':
      case 'Network':
        return <Network className="w-3.5 h-3.5" />;
      case 'Bluetooth':
        return <Bluetooth className="w-3.5 h-3.5" />;
      case 'Shared Printer':
        return <Share2 className="w-3.5 h-3.5" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready':
      case 'Online':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Ready'
        };
      case 'Printing':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Printing'
        };
      case 'Paused':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Paused'
        };
      case 'Offline':
      case 'Disconnected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: status
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          label: status || 'Unknown'
        };
    }
  };

  const isMultiple = printers.length > 1;

  return (
    <div className="py-4 px-2 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {printers.length} Physical {printers.length === 1 ? 'Printer' : 'Printers'} Detected
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {isMultiple
            ? 'Select Your Physical Printer'
            : 'Physical Printer Detected!'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isMultiple
            ? 'Select the hardware printer you want to connect for automatic customer print jobs.'
            : 'Select your hardware printer below to start calibration.'}
        </p>
      </div>

      {/* Printer List / Card */}
      <div className="space-y-3 max-w-xl mx-auto">
        {printers.map((printer) => {
          const isSelected = selectedPrinter?.id === printer.id;
          const statusBadge = getStatusBadge(printer.status);

          return (
            <motion.div
              key={printer.id}
              onClick={() => onSelect(printer)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'border-purple-600 bg-purple-50/40 shadow-md shadow-purple-600/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Brand / Model Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Printer className="w-6 h-6" />
                </div>

                {/* Details */}
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {printer.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {printer.brand}
                    </span>
                    {printer.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {printer.description || printer.model}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    {/* Connection Pill */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {getConnectionIcon(printer.connection)}
                      <span>{printer.connection}</span>
                      {printer.port && (
                        <span className="text-slate-400 font-mono">
                          ({printer.port})
                        </span>
                      )}
                    </span>

                    {/* Color / BW Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        printer.isColor
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/80'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {printer.isColor ? 'Color & B&W' : 'Monochrome (B&W)'}
                    </span>

                    {/* Real Status Pill */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-md ${statusBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      <span>{statusBadge.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className="sm:self-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRescan}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Again</span>
          </button>

          <button
            type="button"
            onClick={onManualSetup}
            className="px-3.5 py-2 rounded-xl text-purple-600 hover:bg-purple-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manual IP / Port Setup</span>
          </button>
        </div>

        <button
          type="button"
          disabled={!selectedPrinter}
          onClick={onContinue}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 disabled:opacity-50"
        >
          <span>Continue Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
