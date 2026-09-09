import React from 'react';
import { InkLevelDetails, PrinterType } from '../types/printer.types';

interface PrinterInkLevelProps {
  type: PrinterType;
  inkLevels: InkLevelDetails;
}

export const PrinterInkLevel: React.FC<PrinterInkLevelProps> = ({ type, inkLevels }) => {
  const isColor = type === 'Inkjet' && inkLevels.cyan !== undefined;

  if (!isColor) {
    const black = inkLevels.black;
    const barColor = black >= 50 ? 'bg-slate-800' : black >= 20 ? 'bg-amber-500' : 'bg-rose-500';

    return (
      <div className="flex flex-col gap-1 w-full max-w-[120px]">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-500">Toner</span>
          <span className="font-bold font-mono text-slate-900">{black}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`${barColor} h-full rounded-full transition-all duration-300`}
            style={{ width: `${black}%` }}
          />
        </div>
      </div>
    );
  }

  // Color CMYK
  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-500">CMYK Ink</span>
        <span className="font-bold font-mono text-slate-900">{inkLevels.black}%</span>
      </div>
      <div className="grid grid-cols-4 gap-1 w-full h-1.5">
        <div className="bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-slate-900 h-full rounded-full" style={{ width: `${inkLevels.black}%` }} />
        </div>
        <div className="bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${inkLevels.cyan ?? 0}%` }} />
        </div>
        <div className="bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-pink-500 h-full rounded-full" style={{ width: `${inkLevels.magenta ?? 0}%` }} />
        </div>
        <div className="bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${inkLevels.yellow ?? 0}%` }} />
        </div>
      </div>
    </div>
  );
};
