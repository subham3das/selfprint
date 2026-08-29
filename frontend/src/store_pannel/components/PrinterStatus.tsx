import React from 'react';
import { Wifi, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { PrinterStatusInfo } from '../types/dashboard.types';

interface PrinterStatusProps {
  printer: PrinterStatusInfo;
  isPaused: boolean;
  onOpenSettings: () => void;
}

export const PrinterStatus: React.FC<PrinterStatusProps> = ({
  printer,
  isPaused,
  onOpenSettings
}) => {
  const currentStatus = isPaused ? 'Paused' : printer.printerStatus;
  const isOnline = printer.isOnline && !isPaused;

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Printer Status
          </h2>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                : 'bg-amber-50 text-amber-600 border-amber-200/60'
            }`}
          >
            {isOnline ? 'Online' : 'Paused'}
          </span>
        </div>

        {/* Printer Graphic & Model Name */}
        <div className="flex flex-col items-center justify-center py-4">
          {/* Detailed SVG Illustration of HP LaserJet 1020 */}
          <div className="w-36 h-28 relative flex items-center justify-center">
            <svg
              viewBox="0 0 200 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-md"
            >
              {/* Printer Body Shadow */}
              <ellipse cx="100" cy="138" rx="80" ry="10" fill="#E2E8F0" />

              {/* Main Lower Body Base */}
              <rect
                x="25"
                y="65"
                width="150"
                height="65"
                rx="14"
                fill="#1E293B"
              />
              <rect
                x="28"
                y="68"
                width="144"
                height="58"
                rx="11"
                fill="#0F172A"
              />

              {/* Paper Output Slot / Tray Cavity */}
              <path
                d="M 45 80 L 155 80 L 150 108 L 50 108 Z"
                fill="#020617"
              />

              {/* Printed Paper coming out */}
              <rect
                x="60"
                y="86"
                width="80"
                height="28"
                rx="3"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <line x1="70" y1="94" x2="115" y2="94" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="70" y1="100" x2="130" y2="100" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              <line x1="70" y1="106" x2="100" y2="106" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

              {/* Top Cover / Feeder */}
              <rect
                x="40"
                y="35"
                width="120"
                height="38"
                rx="10"
                fill="#334155"
              />
              <rect
                x="43"
                y="38"
                width="114"
                height="32"
                rx="7"
                fill="#1E293B"
              />

              {/* Top Paper In-Tray / Sheet */}
              <rect
                x="65"
                y="15"
                width="70"
                height="30"
                rx="4"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <line x1="75" y1="23" x2="125" y2="23" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="75" y1="28" x2="110" y2="28" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Front Control Panel & HP Logo Emblem */}
              <circle cx="150" cy="54" r="5" fill="#475569" />
              <circle
                cx="150"
                cy="54"
                r="2.5"
                fill={isOnline ? '#10B981' : '#F59E0B'}
                className={isOnline ? 'animate-pulse' : ''}
              />
              <rect x="48" y="52" width="12" height="4" rx="1" fill="#64748B" />

              {/* Front Lower Paper Tray Front */}
              <rect
                x="50"
                y="114"
                width="100"
                height="12"
                rx="3"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="1"
              />
              <rect x="90" y="118" width="20" height="4" rx="2" fill="#475569" />
            </svg>
          </div>

          <h3 className="font-bold text-slate-900 text-sm mt-1 text-center">
            {printer.name}
          </h3>
        </div>

        {/* Specs List */}
        <div className="space-y-3 pt-2 text-xs">
          {/* Connection */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Connection</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span>{printer.connectionStatus}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Status</span>
            <span
              className={`font-semibold ${
                isOnline ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {currentStatus}
            </span>
          </div>

          {/* Paper */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Paper</span>
            <span className="font-bold text-slate-800">{printer.paperSize}</span>
          </div>

          {/* Toner Bar */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 font-medium">Toner</span>
            <div className="flex items-center gap-2.5 flex-1 max-w-[130px]">
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${printer.tonerPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-[#4F46E5] rounded-full"
                />
              </div>
              <span className="font-bold text-slate-700 text-xs shrink-0">
                {printer.tonerPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Printer Settings Button */}
      <button
        onClick={onOpenSettings}
        className="w-full mt-5 py-2.5 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 shadow-sm group"
      >
        <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:rotate-45 transition-transform duration-300" />
        <span>Printer Settings</span>
      </button>
    </div>
  );
};
