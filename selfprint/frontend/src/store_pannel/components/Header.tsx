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
import { StoreInfo, NotificationItem } from '../types/dashboard.types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  storeInfo: StoreInfo;
  isPrinterOnline: boolean;
  isPrinterConfigured?: boolean;
  isPaused: boolean;
  notificationsList?: NotificationItem[];
  unreadCount?: number;
  onOpenMobileSidebar?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenQRModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Dashboard',
  subtitle = 'Overview of your print store',
  storeInfo,
  isPrinterOnline,
  isPrinterConfigured,
  isPaused,
  notificationsList,
  unreadCount = 0,
  onOpenMobileSidebar,
  onOpenSettingsModal,
  onOpenQRModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  const activeNotifications = notificationsList || [];

  const isConfigured =
    isPrinterConfigured !== undefined
      ? isPrinterConfigured
      : storeInfo?.printerConfigured !== undefined
      ? storeInfo.printerConfigured
      : isPrinterOnline;

  const getNotifIconAndStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50' };
      default:
        return { icon: Clock, color: 'text-blue-500 bg-blue-50' };
    }
  };

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
        {!isConfigured ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Printer: Not Configured</span>
          </div>
        ) : !isPrinterOnline ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span>Printer: Offline</span>
          </div>
        ) : isPaused ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Printer: Paused</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Printer: Online</span>
          </div>
        )}

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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
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
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-semibold text-xs">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {activeNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No notifications today
                    </div>
                  ) : (
                    activeNotifications.map((n) => {
                      const { icon: Icon, color } = getNotifIconAndStyle(n.type || 'info');
                      return (
                        <div
                          key={n.id}
                          className="py-3 flex items-start gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${color}`}>
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
                    })
                  )}
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

export default Header;
