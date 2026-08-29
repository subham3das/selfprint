import React, { useState } from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  History,
  QrCode,
  Settings,
  Pause,
  Play,
  Printer,
  ChevronDown,
  LogOut,
  Store,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreInfo, SummaryBreakdown } from '../types/dashboard.types';

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  storeInfo: StoreInfo;
  summary: SummaryBreakdown;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenQRModal: () => void;
  onOpenSettingsModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavChange,
  storeInfo,
  summary,
  isPaused,
  onTogglePause,
  onOpenQRModal,
  onOpenSettingsModal,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Queue', icon: ListOrdered },
    { id: 'history', label: 'History', icon: History },
    { id: 'qr', label: 'QR Generation', icon: QrCode },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    onNavChange(item.id);
    if (onCloseMobile) {

      onCloseMobile();
    }
  };


  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A0F1D] text-slate-200 w-64 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              Self Print
            </h1>
            <p className="text-xs text-slate-400 font-medium">Store Panel</p>
          </div>
        </div>
        {isOpenMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1 scrollbar-none">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* PRINTER STATUS Mini Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#111726] border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              PRINTER STATUS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isPaused ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span
              className={`text-xs font-semibold ${
                isPaused ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {isPaused ? 'Paused' : 'Online'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-100 mt-1 truncate">
            HP LaserJet 1020
          </p>

          <button
            onClick={onTogglePause}
            className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 ${
              isPaused
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Printer</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Printer</span>
              </>
            )}
          </button>
        </div>

        {/* TODAY'S SUMMARY Mini Card */}
        <div className="mt-3 p-3.5 rounded-xl bg-[#111726] border border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TODAY'S SUMMARY
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Jobs</span>
              <span className="text-white font-bold">{summary.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed</span>
              <span className="text-emerald-400 font-bold">{summary.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pending</span>
              <span className="text-indigo-400 font-bold">{summary.waiting}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Failed</span>
              <span className="text-rose-400 font-bold">{summary.failed}</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Revenue</span>
            <span className="text-white font-bold">{summary.totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
              {storeInfo.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {storeInfo.location}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Store ID: SP-1001
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              showProfileMenu ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Dedicated Logout Button at bottom */}
        <button
          onClick={() => alert('Logging out from Store Panel...')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        {/* Profile Popover Menu */}
        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-24 left-3 right-3 bg-[#111726] border border-slate-700/80 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-0.5"
            >
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenSettingsModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Store Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenQRModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Store QR Standee</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
