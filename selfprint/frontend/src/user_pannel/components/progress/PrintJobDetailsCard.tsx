import React from 'react';
import {
  FileText,
  Layers,
  Palette,
  Printer,
  CreditCard,
  Hash
} from 'lucide-react';


interface PrintJobDetailsCardProps {
  fileName: string;
  pages: number;
  copies: number;
  paperSize: string;
  colorMode: string;
  printerName: string;
  totalPaid: number;
  jobCode: string;
}

export const PrintJobDetailsCard: React.FC<PrintJobDetailsCardProps> = ({
  fileName,
  pages,
  copies,
  paperSize,
  colorMode,
  printerName,
  totalPaid,
  jobCode
}) => {
  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3.5 select-none text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 tracking-tight">
          Job Specifications
        </h3>
        <span className="font-mono text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {jobCode}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Document */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Document
          </span>
          <p className="font-bold text-slate-800 truncate">{fileName}</p>
        </div>

        {/* Copies & Pages */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Volume
          </span>
          <p className="font-bold text-slate-800">
            {copies} {copies === 1 ? 'copy' : 'copies'} ({pages * copies} pages)
          </p>
        </div>

        {/* Color & Size */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Palette className="w-3 h-3" /> Spec
          </span>
          <p className="font-bold text-slate-800">
            {colorMode} &bull; {paperSize}
          </p>
        </div>

        {/* Printer */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Printer className="w-3 h-3" /> Output Device
          </span>
          <p className="font-bold text-slate-800 truncate">{printerName}</p>
        </div>
      </div>

      {/* Payment Callout */}
      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-800 font-medium">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Amount Paid (UPI)</span>
        </div>
        <span className="font-bold text-emerald-700 font-mono text-sm">
          ₹{totalPaid.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
