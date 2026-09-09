import React from 'react';
import {
  FileText,
  Sliders,
  Palette,
  Copy,
  Scissors,
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import {
  PrinterSetupConfig,
  PaperSize,
  PrintQuality,
  PrintColorMode,
  DetectedPrinter
} from '../../types/printerSetup.types';

interface PrinterConfigurationProps {
  printer: DetectedPrinter;
  config: PrinterSetupConfig;
  onChange: (updates: Partial<PrinterSetupConfig>) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const PrinterConfiguration: React.FC<PrinterConfigurationProps> = ({
  printer,
  config,
  onChange,
  onProceed,
  onBack
}) => {
  const paperSizes: PaperSize[] = ['A4', 'Letter', 'Legal'];
  const qualities: PrintQuality[] = ['Draft', 'Standard', 'High'];
  const colorModes: PrintColorMode[] = printer.isColor
    ? ['Black & White', 'Color']
    : ['Black & White'];

  return (
    <div className="py-4 px-2 space-y-6 max-w-xl mx-auto text-left text-xs">
      {/* Header */}
      <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Step 4: Default Print Configuration
        </h3>
        <p className="text-xs text-slate-500">
          Configure how customer jobs are automatically formatted on <strong className="text-slate-800">{printer.name}</strong>.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* 1. Default Paper Size */}
        <div className="space-y-1.5">
          <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Default Paper Size</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {paperSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ defaultPaper: size })}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  config.defaultPaper === size
                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-600/10'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {size} {size === 'A4' && ' (Standard)'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Print Quality & Color Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Quality */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Default Print Quality</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {qualities.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onChange({ defaultQuality: q })}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                    config.defaultQuality === q
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Color Output Mode</span>
            </label>
            <div className={`grid ${colorModes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
              {colorModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChange({ defaultColorMode: mode })}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                    config.defaultColorMode === mode
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Toggles: Duplex, Auto Cut, Auto Spool */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
          {/* Duplex (Two-Sided) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                <Copy className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Duplex (Two-Sided Printing)</p>
                <p className="text-[11px] text-slate-400">
                  {printer.isDuplexSupported
                    ? 'Automatically print on both sides of each sheet'
                    : 'Not supported on this hardware (Manual flip only)'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!printer.isDuplexSupported}
              onClick={() => onChange({ duplex: !config.duplex })}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                config.duplex && printer.isDuplexSupported
                  ? 'bg-purple-600'
                  : 'bg-slate-300'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  config.duplex && printer.isDuplexSupported
                    ? 'right-1'
                    : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Auto-Cut (Thermal) */}
          {printer.isAutoCutSupported && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Automatic Paper Cutter</p>
                  <p className="text-[11px] text-slate-400">
                    Cut receipt paper automatically after each order
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onChange({ autoCut: !config.autoCut })}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.autoCut ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    config.autoCut ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Auto Spooling */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Instant Cloud Spooling</p>
                <p className="text-[11px] text-slate-400">
                  Send incoming customer QR jobs straight to hardware spooler
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onChange({ autoSpool: !config.autoSpool })}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                config.autoSpool ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  config.autoSpool ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>Continue to Test Print</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
