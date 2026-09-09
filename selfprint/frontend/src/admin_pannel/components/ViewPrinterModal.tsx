import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Printer,
  RotateCw,
  Edit2
} from 'lucide-react';
import { AdminPrinterItem } from '../types/printer.types';
import { PrinterStatusBadge } from './PrinterStatusBadge';
import { PrinterPaperLevel } from './PrinterPaperLevel';
import { PrinterInkLevel } from './PrinterInkLevel';

interface ViewPrinterModalProps {
  printer: AdminPrinterItem | null;
  onClose: () => void;
  onEdit: (printer: AdminPrinterItem) => void;
  onRestart: (id: string) => void;
  onTestPrint: (printer: AdminPrinterItem) => void;
}

export const ViewPrinterModal: React.FC<ViewPrinterModalProps> = ({
  printer,
  onClose,
  onEdit,
  onRestart,
  onTestPrint
}) => {
  if (!printer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {printer.name}
                </h3>
                <PrinterStatusBadge status={printer.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {printer.printerId} • SN: {printer.serialNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section 1: Store & Hardware Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Assigned Store
              </span>
              <p className="font-bold text-slate-900 mt-1 truncate">
                {printer.storeName}
              </p>
              <p className="text-[11px] text-slate-500">
                {printer.city}, {printer.state}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Location Area
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {printer.locationArea}
              </p>
              <p className="text-[11px] text-slate-500">{printer.locationFloor}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Brand &amp; Model
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {printer.brand}
              </p>
              <p className="text-[11px] text-slate-500">{printer.model}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Connectivity
              </span>
              <p className="font-bold text-slate-900 mt-1">
                {printer.connection}
              </p>
              <p className="text-[10px] font-mono text-slate-500">{printer.ipAddress}</p>
            </div>
          </div>

          {/* Section 2: Consumables (Paper & Ink Levels) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Paper Tray Level
              </span>
              <PrinterPaperLevel
                percent={printer.paperLevelPercent}
                capacity={printer.paperTrayCapacity}
                showCapacity={true}
              />
              <p className="text-[11px] text-slate-400">
                Sizes: {printer.supportedPaperSizes.join(', ')}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Ink / Toner Supply
              </span>
              <PrinterInkLevel
                type={printer.type}
                inkLevels={printer.inkLevels}
              />
              <p className="text-[11px] text-slate-400">
                Device Type: {printer.type} Engine
              </p>
            </div>
          </div>

          {/* Section 3: Telemetry & Lifetime Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Health Score
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                {printer.healthPercent}%
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Today&apos;s Prints
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                {printer.printsToday} pages
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                This Month
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                {printer.printsThisMonth} pages
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Lifetime Prints
              </span>
              <p className="text-base font-black text-slate-900 mt-0.5 font-mono">
                {printer.lifetimePrints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRestart(printer.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-500" />
              <span>Restart Device</span>
            </button>

            <button
              type="button"
              onClick={() => onTestPrint(printer)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Test Print</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(printer);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Configuration</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
