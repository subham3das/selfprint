import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  Calendar,
  Check,
  Printer,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  showWelcome?: boolean;
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
}

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Low Paper Alert',
    desc: 'Print Hub Dibrugarh reported low paper in Tray 2.',
    time: '2 mins ago',
    icon: AlertTriangle,
    color: 'text-amber-500 bg-amber-50'
  },
  {
    id: 'n2',
    title: 'New Store Approval Request',
    desc: 'Fast Copy Silchar submitted KYC verification documents.',
    time: '15 mins ago',
    icon: Printer,
    color: 'text-indigo-500 bg-indigo-50'
  },
  {
    id: 'n3',
    title: 'High Volume Completed',
    desc: 'Print Zone Guwahati processed 450 pages batch.',
    time: '32 mins ago',
    icon: CreditCard,
    color: 'text-emerald-500 bg-emerald-50'
  }
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  showWelcome = true,
  title,
  breadcrumb
}) => {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const dateOptions = [
    '29 May 2025',
    'Today (Live)',
    'Yesterday',
    'This Week',
    'This Month',
    'Last 30 Days'
  ];

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-1.5">
      {/* LEFT: Welcome Section OR Page Title with Breadcrumb */}
      <div>
        {showWelcome ? (
          <>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Welcome back, Super Admin!</span>
              <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Here's what's happening on your platform today.
            </p>
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {title || 'Stores'}
            </h1>
            {breadcrumb && (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                {breadcrumb.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-400">&gt;</span>}
                    {item.path ? (
                      <button
                        type="button"
                        onClick={() => navigate(item.path!)}
                        className="hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className="text-slate-700 font-bold">{item.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Search Bar, Notifications, Date Filter, Admin Profile */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search anything..."
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
          />
          <span className="absolute right-3 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200/80 rounded px-1.5 py-0.5">
            ⌘K
          </span>
        </div>

        {/* Notification Bell with Badge & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-9 h-9 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              12
            </span>
          </button>

          {/* Notifications Popover */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3"
              >
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    Notifications (12)
                  </span>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
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

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-indigo-300 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          <AnimatePresence>
            {isDateMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5"
              >
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onDateChange(opt);
                      setIsDateMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors"
                  >
                    <span>{opt}</span>
                    {selectedDate === opt && (
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Super Admin"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 leading-tight truncate">
              Super Admin
            </h2>
            <p className="text-[11px] text-slate-400 font-medium leading-tight truncate">
              admin@selfprint.com
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">
                Last updated: 10:30:45 AM
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
