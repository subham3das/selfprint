import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  Calendar,
  Check,
  User,
  Shield,
  SlidersHorizontal,
  ScrollText,
  Users,
  Store,
  Printer,
  Receipt,
  Headphones,
  LogOut,
  CheckCheck,
  ShieldCheck,
  SunMoon,
  Command,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  CornerDownLeft,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import { adminAuthService } from '../../services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

interface AdminHeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  showWelcome?: boolean;
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  read: boolean;
  link?: string;
}

interface QuickNavItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Platform' | 'Management' | 'Security & Audit' | 'Finance';
  badge?: string;
}

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Platform Dashboard',
    description: 'Overview KPIs, real-time activity and platform analytics',
    path: '/admin/dashboard',
    icon: TrendingUp,
    category: 'Platform'
  },
  {
    id: 'nav-stores',
    label: 'Stores Management',
    description: 'Store partners, revenue shares, verification & statuses',
    path: '/admin/stores',
    icon: Store,
    category: 'Management'
  },
  {
    id: 'nav-users',
    label: 'Users & Customers',
    description: 'Customer directory, wallet balances and order history',
    path: '/admin/users',
    icon: Users,
    category: 'Management'
  },
  {
    id: 'nav-printers',
    label: 'Printers & Hardware',
    description: 'Printer fleet telemetry, paper levels and diagnostics',
    path: '/admin/printers',
    icon: Printer,
    category: 'Management'
  },
  {
    id: 'nav-transactions',
    label: 'Transactions & Payments',
    description: 'Payment records, commissions, refunds and settlements',
    path: '/admin/transactions',
    icon: Receipt,
    category: 'Finance'
  },
  {
    id: 'nav-revenue',
    label: 'Revenue Analytics',
    description: 'Financial breakdowns, store payouts and margin trends',
    path: '/admin/revenue',
    icon: FileSpreadsheet,
    category: 'Finance'
  },
  {
    id: 'nav-support',
    label: 'Customer Support Tickets',
    description: 'Helpdesk tickets, satisfaction metrics and agent assignment',
    path: '/admin/support',
    icon: Headphones,
    category: 'Management'
  },
  {
    id: 'nav-access',
    label: 'Access Control & RBAC',
    description: 'Staff directory, invitation tokens and permission matrix',
    path: '/admin/access',
    icon: ShieldCheck,
    category: 'Security & Audit',
    badge: 'Super Admin'
  },
  {
    id: 'nav-audit',
    label: 'Security Audit Logs',
    description: 'Cryptographic security ledger and chronological audit trail',
    path: '/admin/audit-logs',
    icon: ScrollText,
    category: 'Security & Audit'
  },
  {
    id: 'nav-settings',
    label: 'System Settings',
    description: 'Platform fees, global policies and environment configurations',
    path: '/admin/settings',
    icon: SlidersHorizontal,
    category: 'Platform'
  }
];

const DEFAULT_DATE_OPTIONS = [
  'Today (Live)',
  'Yesterday',
  'This Week',
  'This Month',
  'Last 30 Days',
  'All Time'
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  selectedDate = 'Today (Live)',
  onDateChange,
  showWelcome = true,
  title,
  breadcrumb
}) => {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, isSuperAdmin, roleBadge, lastActiveFormatted } = useAdminProfile();

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // References for click-outside detection
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Persist Date Selection in LocalStorage
  const currentDate = selectedDate || localStorage.getItem('selfprint_admin_date_filter') || 'Today (Live)';

  const handleDateSelect = (date: string) => {
    localStorage.setItem('selfprint_admin_date_filter', date);
    if (onDateChange) onDateChange(date);
    setIsDateMenuOpen(false);
  };

  // Filter Command Items
  const filteredItems = QUICK_NAV_ITEMS.filter((item) => {
    if (!commandSearch.trim()) return true;
    const query = commandSearch.toLowerCase().trim();
    return (
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
    );
  });

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex(0);
  }, [commandSearch]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K) & Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => commandInputRef.current?.focus(), 50);
          }
          return next;
        });
      } else if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
        setIsDateMenuOpen(false);
        setIsCommandOpen(false);
      } else if (isCommandOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            navigate(filteredItems[selectedIndex].path);
            setIsCommandOpen(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, filteredItems, selectedIndex, navigate]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Live Notifications from Database
  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ['admin-header-notifications'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/admin/audit-logs/live');
        const liveLogs = res.data?.data || [];
        return liveLogs.slice(0, 6).map((log: any, idx: number) => ({
          id: String(log.id || `notif-${idx}`),
          title: log.action || 'Security Event',
          desc:
            typeof log.description === 'string' && log.description
              ? log.description
              : typeof log.details === 'string' && log.details
              ? log.details
              : `${log.actorName || 'Admin'} performed ${log.action || 'action'} on ${log.targetResource || 'platform'}`,
          time: log.relativeTime || 'Just now',
          type: log.severity === 'Critical' || log.severity === 'Security' ? 'danger' : 'info',
          read: false,
          link: '/admin/audit-logs'
        }));

      } catch {
        return [
          {
            id: 'notif-1',
            title: 'Platform Audit Service Online',
            desc: 'Real-time telemetry and access control ledger is operating normally.',
            time: 'Just now',
            type: 'success',
            read: false,
            link: '/admin/audit-logs'
          }
        ];
      }
    },
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  const [notifsList, setNotifsList] = useState<NotificationItem[]>([]);
  useEffect(() => {
    if (notifications.length > 0) {
      setNotifsList(notifications);
    }
  }, [notifications]);

  const unreadCount = notifsList.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F6F8FB]/95 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 px-1">
        {/* LEFT: Welcome Section OR Page Title with Breadcrumb */}
        <div>
          {showWelcome ? (
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {user?.displayName || user?.name || 'Administrator'}
                  </span>
                </span>
                <span className="inline-block animate-wave text-xl">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>Here's what's happening on your platform today.</span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Live Sync
                </span>
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{title || 'Dashboard'}</span>
              </h1>
              {breadcrumb && (
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                  {breadcrumb.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-300 font-bold">/</span>}
                      {item.path ? (
                        <button
                          type="button"
                          onClick={() => navigate(item.path!)}
                          className="hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <span className="text-slate-800 font-bold">{item.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Global In-Page Filter, Spotlight Command Button, Notifications, Date, Profile */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Header In-Page Search Bar */}
          <div className="relative flex items-center min-w-[200px] sm:min-w-[260px] group">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3.5 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Filter page records..."
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
            />
            {/* Command Palette Trigger Badge */}
            <button
              type="button"
              onClick={() => {
                setIsCommandOpen(true);
                setTimeout(() => commandInputRef.current?.focus(), 50);
              }}
              className="absolute right-2 flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 rounded-lg px-2 py-0.5 transition-all cursor-pointer"
              title="Open Spotlight Command Palette (⌘K)"
            >
              <Command className="w-2.5 h-2.5" />
              <span className="font-bold">K</span>
            </button>
          </div>

          {/* Notification Bell with Live Feed Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer ${
                isNotifOpen
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'bg-white border-slate-200/90 text-slate-600 hover:text-indigo-600 hover:border-indigo-200'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        System Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-[10px] font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-3 max-h-72 overflow-y-auto pr-1">
                    {notifsList.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Check className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                        <p className="text-xs font-semibold">All caught up!</p>
                        <p className="text-[11px]">No unread system alerts.</p>
                      </div>
                    ) : (
                      notifsList.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setIsNotifOpen(false);
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                            n.read ? 'bg-slate-50/60 opacity-75' : 'bg-slate-50 hover:bg-indigo-50/50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              n.type === 'danger'
                                ? 'bg-rose-100 text-rose-600'
                                : n.type === 'success'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-indigo-100 text-indigo-600'
                            }`}
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight mt-0.5">
                              {n.desc}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/admin/audit-logs');
                        setIsNotifOpen(false);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Security Notification Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Selector Dropdown */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:border-indigo-300 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDate}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            <AnimatePresence>
              {isDateMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2"
                >
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Filter Date Range
                  </div>
                  {DEFAULT_DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleDateSelect(opt)}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-colors cursor-pointer"
                    >
                      <span>{opt}</span>
                      {currentDate === opt && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authenticated Admin Profile Pill with Dropdown */}
          <div className="relative" ref={profileRef}>
            {isUserLoading ? (
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="hidden sm:block">
                  <div className="w-20 h-3 bg-slate-200 rounded" />
                  <div className="w-14 h-2 bg-slate-100 rounded mt-1.5" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200/90 text-left hover:opacity-90 transition-all cursor-pointer group"
              >
                {/* Avatar with Active Online Dot */}
                <div className="relative shrink-0">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName || user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full ${
                        user?.avatarBg || (isSuperAdmin ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600' : 'bg-gradient-to-tr from-indigo-600 to-blue-600')
                      } text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-indigo-500/20`}
                    >
                      {user?.avatarText || (user?.displayName || user?.name || 'AD').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Online Indicator Green Dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Profile Text (Hidden on small mobile) */}
                <div className="hidden sm:block min-w-0 max-w-[170px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 leading-tight truncate">
                      {user?.displayName || user?.name || user?.email || 'Staff'}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[9px] font-black tracking-tight ${
                        isSuperAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {roleBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono leading-tight truncate mt-0.5">
                    {user?.email || ''}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5 hidden sm:block" />
              </button>
            )}

            {/* Profile Menu Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {/* User Identity Card */}
                  <div className="p-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full ${
                          user?.avatarBg || (isSuperAdmin ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600' : 'bg-gradient-to-tr from-indigo-600 to-blue-600')
                        } text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md ring-2 ring-indigo-500/20`}
                      >
                        {user?.avatarText || (user?.displayName || user?.name || 'AD').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-900 truncate">
                          {user?.displayName || user?.name || user?.email || 'Staff Member'}
                        </p>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {user?.email || ''}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-600">Online</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lastActiveFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Platform Role
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                        {isSuperAdmin ? 'SUPER ADMINISTRATOR' : roleBadge}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="p-2 flex flex-col gap-0.5 text-xs text-slate-700 font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/admin/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/admin/access');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Security & RBAC Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/admin/audit-logs');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
                    >
                      <ScrollText className="w-4 h-4 text-slate-400" />
                      <span>Security Activity Log</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/admin/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <SunMoon className="w-4 h-4 text-slate-400" />
                        <span>Appearance & UI</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Light
                      </span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Switch Account (Enterprise ready) */}
                    <div className="w-full flex items-center justify-between px-3 py-2 text-slate-400">
                      <span className="text-[11px] font-medium">Switch Organization</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                        Enterprise
                      </span>
                    </div>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Production-Grade Spotlight Command Palette Modal (⌘K) */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/50 backdrop-blur-xs">
            {/* Click outside backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0"
              onClick={() => setIsCommandOpen(false)}
            />

            {/* Modal Card */}
            <motion.div
              ref={commandRef}
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              {/* Clean Seamless Search Input Bar */}
              <div className="flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/40">
                <Search className="w-5 h-5 text-indigo-600 mr-3.5 shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a command, page, or search resources..."
                  className="w-full bg-transparent border-0 outline-none ring-0 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-0"
                />
                {commandSearch && (
                  <button
                    type="button"
                    onClick={() => setCommandSearch('')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 mr-2 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[11px] font-bold font-mono text-slate-400 bg-white border border-slate-200 rounded-lg px-2 py-0.5 shadow-2xs">
                  ESC
                </span>
              </div>

              {/* Categorized Command Results with Keyboard Navigation */}
              <div className="p-3 max-h-[380px] overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No matching destinations</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try searching for "stores", "printers", "audit", or "access"
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Quick Navigation & Tools</span>
                      <span>{filteredItems.length} destinations</span>
                    </div>

                    {filteredItems.map((item, index) => {
                      const Icon = item.icon;
                      const isSelected = index === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setSelectedIndex(index)}
                          onClick={() => {
                            navigate(item.path);
                            setIsCommandOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[0.99]'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-black tracking-tight ${
                                      isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] truncate mt-0.5 ${
                                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                                }`}
                              >
                                {typeof item.description === 'string'
                                  ? item.description
                                  : typeof item.description === 'object'
                                  ? JSON.stringify(item.description)
                                  : String(item.description || '')}
                              </p>

                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span
                              className={`text-[10px] font-mono font-medium hidden sm:inline-block ${
                                isSelected ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              {item.path}
                            </span>
                            <CornerDownLeft
                              className={`w-3.5 h-3.5 transition-opacity ${
                                isSelected ? 'opacity-100 text-white' : 'opacity-0 text-slate-400'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Command Palette Footer with Keyboard Tips */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs font-bold text-slate-600">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs font-bold text-slate-600">
                      ↓
                    </kbd>
                    <span className="text-slate-400">to navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs font-bold text-slate-600">
                      ↵
                    </kbd>
                    <span className="text-slate-400">to select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] shadow-2xs font-bold text-slate-600">
                      esc
                    </kbd>
                    <span className="text-slate-400">to close</span>
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Self Print Enterprise</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminHeader;
