import React from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  CheckCircle2,
  Usb,
  Wifi,
  Network,
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
    if (conn === 'USB') return <Usb className="w-3.5 h-3.5" />;
    if (conn === 'WiFi') return <Wifi className="w-3.5 h-3.5" />;
    return <Network className="w-3.5 h-3.5" />;
  };

  const isMultiple = printers.length > 1;

  return (
    <div className="py-4 px-2 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {printers.length} Compatible {printers.length === 1 ? 'Printer' : 'Printers'} Found
          </span>
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {isMultiple
            ? 'Select Your Default Printing Device'
            : 'Printer Successfully Detected!'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isMultiple
            ? 'Choose the printer you want to use for automatic customer print orders.'
            : 'We verified communication with your printer. Confirm below to proceed to calibration.'}
        </p>
      </div>

      {/* Printer List / Card */}
      <div className="space-y-3 max-w-xl mx-auto">
        {printers.map((printer) => {
          const isSelected = selectedPrinter?.id === printer.id;

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
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {printer.isColor ? 'Color & B&W' : 'Monochrome (B&W)'}
                    </span>

                    {/* Status Pill */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Ready</span>
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
