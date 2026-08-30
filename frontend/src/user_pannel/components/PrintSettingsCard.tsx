import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Palette,
  File,
  FileStack,
  Minus,
  Plus,
  ChevronRight
} from 'lucide-react';
import {
  UserPrintJobConfig,
  PrintColorMode,
  UploadedFileInfo
} from '../types/userPrint.types';

interface PrintSettingsCardProps {
  file: UploadedFileInfo | null;
  config: UserPrintJobConfig;
  onChangeConfig: (updated: Partial<UserPrintJobConfig>) => void;
  onOpenPagesModal: () => void;
  onOpenPaperModal: () => void;
  pagesSummaryLabel?: string;
}

export const PrintSettingsCard: React.FC<PrintSettingsCardProps> = ({
  config,
  onChangeConfig,
  onOpenPagesModal,
  onOpenPaperModal,
  pagesSummaryLabel
}) => {
  const handleCopiesChange = (delta: number) => {
    const next = Math.max(1, Math.min(99, config.copies + delta));
    onChangeConfig({ copies: next });
  };

  return (
    <div className="w-full pt-2 space-y-2.5 select-none">
      <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
        Print Settings
      </h2>

      <div className="space-y-2 text-xs">
        {/* Row 1: Copies */}
        <div className="w-full rounded-2xl bg-white border border-slate-200/80 p-3 sm:p-3.5 flex items-center justify-between shadow-xs gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-800 font-medium min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="truncate text-xs">Copies</span>
          </div>

          {/* Stepper Control */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 p-0.5 shadow-xs shrink-0">
            <button
              onClick={() => handleCopiesChange(-1)}
              disabled={config.copies <= 1}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs"
              aria-label="Decrease copies"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <span className="w-8 sm:w-10 text-center font-bold text-slate-900 text-xs font-mono">
              {config.copies}
            </span>

            <button
              onClick={() => handleCopiesChange(1)}
              disabled={config.copies >= 99}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-100 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs"
              aria-label="Increase copies"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Color - Modern Segmented Control */}
        <div className="w-full rounded-2xl bg-white border border-slate-200/80 p-3 sm:p-3.5 flex items-center justify-between shadow-xs gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-800 font-medium min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="truncate text-xs">Color Mode</span>
          </div>

          {/* Animated Segmented Pill Container */}
          <div className="relative flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
            {(['Black & White', 'Color'] as PrintColorMode[]).map((mode) => {
              const isActive = config.colorMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onChangeConfig({ colorMode: mode })}
                  className={`relative z-10 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode}
                  {isActive && (
                    <motion.div
                      layoutId="colorModeIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-xs border border-indigo-100 -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Pages Selector (Tap to Open Full PDF Preview) */}
        <button
          onClick={onOpenPagesModal}
          className="w-full rounded-2xl bg-white border border-slate-200/80 p-3 sm:p-3.5 flex items-center justify-between shadow-xs hover:border-indigo-300 transition-colors text-left gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-800 font-medium min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileStack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="truncate text-xs">Pages</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600 font-medium shrink-0 text-xs">
            <span className="font-semibold text-indigo-600">
              {pagesSummaryLabel || `${config.selectedPagesCount} Pages`}
            </span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </div>
        </button>

        {/* Row 4: Paper Size */}
        <button
          onClick={onOpenPaperModal}
          className="w-full rounded-2xl bg-white border border-slate-200/80 p-3 sm:p-3.5 flex items-center justify-between shadow-xs hover:border-indigo-300 transition-colors text-left gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 text-slate-800 font-medium min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <File className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="truncate text-xs">Paper Size</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-slate-600 font-medium shrink-0 text-xs">
            <span className="font-semibold">{config.paperSize}</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </div>
        </button>
      </div>
    </div>
  );
};
