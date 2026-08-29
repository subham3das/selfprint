import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Menu,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreInfo } from '../types/dashboard.types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  storeInfo: StoreInfo;
  isPrinterOnline: boolean;
  isPaused: boolean;
  onOpenMobileSidebar?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenQRModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  subtitle = 'Overview of your print store',
  storeInfo,
  isPrinterOnline,
  isPaused,
  onOpenMobileSidebar,
  onOpenSettingsModal,
  onOpenQRModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Job #102 started printing',
      desc: 'notes.pdf (12 pages, B&W)',
      time: '2 mins ago',
      icon: Clock,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      desc: 'Color Ink cartridge is down to 15%',
      time: '15 mins ago',
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-50'
    },
    {
      id: 3,
      title: 'Payment Received',
      desc: '₹160.00 received for Job #103',
      time: '25 mins ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50'
    }
  ];

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      {/* Title and Subtitle */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {subtitle}
          </p>
        </div>

      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            !isPrinterOnline
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isPaused
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                !isPrinterOnline
                  ? 'bg-rose-400'
                  : isPaused
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                !isPrinterOnline
                  ? 'bg-rose-500'
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </span>
          <span>
            Printer: {!isPrinterOnline ? 'Offline' : isPaused ? 'Paused' : 'Online'}
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowStoreDropdown(false);
            }}
            className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-xs">
                      3 new
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer">
                        <div className={`p-2 rounded-xl shrink-0 ${n.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Store Profile Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStoreDropdown(!showStoreDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span className="text-slate-900 font-medium">{storeInfo.name}</span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                showStoreDropdown ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </button>

          {/* Store Switcher Dropdown */}
          <AnimatePresence>
            {showStoreDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-2 text-xs"
              >
                <div className="p-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Current Store
                  </p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {storeInfo.name}
                  </p>
                  <p className="text-slate-500 text-xs">{storeInfo.location}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowStoreDropdown(false);
                      onOpenQRModal?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    <span>Store QR Code</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setShowStoreDropdown(false);
                      onOpenSettingsModal?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  >
                    <span>Printer Settings</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
