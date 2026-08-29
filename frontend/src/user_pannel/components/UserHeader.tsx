import React from 'react';
import { ChevronLeft, FileText, Printer } from 'lucide-react';
import { StoreKioskInfo } from '../types/userPrint.types';

interface UserHeaderProps {
  store: StoreKioskInfo;
  onBack?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ store, onBack }) => {
  return (
    <header className="w-full pt-1 sm:pt-2 pb-1 select-none">
      {/* Top Bar with Back Button & Store Badge */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-xs transition-all active:scale-95 shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
        </button>

        {/* Store & Online Telemetry Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100/90 border border-slate-200/60 text-[11px] sm:text-xs font-semibold text-slate-700 min-w-0">
          <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
          <span className="truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
            {store.storeName}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 pl-1 border-l border-slate-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Main Title & Document Icon */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Purple Document Icon Frame */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs mb-2 sm:mb-2.5">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Upload Document
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
          Select and upload your file to print
        </p>
      </div>
    </header>
  );
};
