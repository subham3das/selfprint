import React from 'react';

interface PrinterPaperLevelProps {
  percent: number;
  capacity?: string;
  showCapacity?: boolean;
}

export const PrinterPaperLevel: React.FC<PrinterPaperLevelProps> = ({
  percent,
  capacity,
  showCapacity = false
}) => {
  const getColor = () => {
    if (percent >= 60) return 'bg-emerald-500 text-emerald-700';
    if (percent >= 25) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  const colorClass = getColor();
  const barColor = colorClass.split(' ')[0];
  const textColor = colorClass.split(' ')[1];

  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-500">Paper</span>
        <span className={`font-bold font-mono ${textColor}`}>{percent}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showCapacity && capacity && (
        <span className="text-[10px] text-slate-400 font-mono truncate">{capacity}</span>
      )}
    </div>
  );
};
