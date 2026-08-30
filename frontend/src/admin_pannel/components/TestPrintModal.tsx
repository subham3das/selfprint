import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { AdminPrinterItem, TestPrintOptions } from '../types/printer.types';

interface TestPrintModalProps {
  printer: AdminPrinterItem | null;
  onClose: () => void;
  onConfirm: (options: TestPrintOptions) => void;
}

export const TestPrintModal: React.FC<TestPrintModalProps> = ({
  printer,
  onClose,
  onConfirm
}) => {
  const [testType, setTestType] = useState<'Page' | 'Color' | 'Alignment' | 'Nozzle'>('Page');
  const [copies, setCopies] = useState(1);

  if (!printer) return null;

  const testOptions: { id: 'Page' | 'Color' | 'Alignment' | 'Nozzle'; title: string; desc: string }[] = [
    {
      id: 'Page',
      title: 'Standard Test Page',
      desc: 'Verify connectivity, paper feed mechanism, margins, and text clarity.'
    },
    {
      id: 'Color',
      title: 'CMYK Color Calibration',
      desc: 'Print full gamut color gradient swatches to inspect color density.'
    },
    {
      id: 'Alignment',
      title: 'Printhead Alignment Grid',
      desc: 'Diagnose vertical and horizontal bidirectional line alignment.'
    },
    {
      id: 'Nozzle',
      title: 'Nozzle Check Pattern',
      desc: 'Verify if any printhead micro-nozzles are clogged or dry.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Run Hardware Test Print
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {printer.name} ({printer.printerId})
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-2">
              Select Diagnostic Test Pattern
            </label>
            <div className="space-y-2">
              {testOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTestType(opt.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    testType === opt.id
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold text-xs ${
                        testType === opt.id ? 'text-indigo-900' : 'text-slate-800'
                      }`}
                    >
                      {opt.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                  {testType === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Copies */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700">Test Copies:</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCopies(n)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    copies === n
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm({
                printerId: printer.printerId,
                testType,
                copies
              })
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Send Test Job</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
