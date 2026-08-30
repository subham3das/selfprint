import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Users,
  Receipt,
  Clock,
  Printer,
  Headphones,
  BarChart3,
  ShieldCheck,
  ScrollText,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { AdminNavRoute } from '../../types/admin.types';
import { adminAuthService } from '../../services/auth.service';

interface AdminSidebarProps {
  activeRoute: AdminNavRoute;
  onRouteChange: (route: AdminNavRoute) => void;
  isCollapsed?: boolean;
}


interface NavItemConfig {
  id: AdminNavRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stores', label: 'Stores', icon: Store },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'revenue', label: 'Revenue', icon: Clock },
  { id: 'printers', label: 'Printers', icon: Printer },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'access', label: 'Access Control', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings }
];



export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeRoute,
  onRouteChange,
  isCollapsed = false
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0B0D1B] border-r border-slate-800/80 flex flex-col justify-between p-4 sm:p-5 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="text-white font-black text-sm tracking-wider leading-none truncate">
                SELF PRINT
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1 truncate">
                Super Admin
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1.5" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRouteChange(item.id)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-xl bg-indigo-600 -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Self Print Platform Card */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/60">
        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>


        {/* Self Print Platform Promo Box */}
        {!isCollapsed && (
          <div className="relative bg-[#13162C] border border-indigo-900/40 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-inner overflow-hidden">
            {/* Soft Ambient Light */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

            {/* 3D Printer Graphic Box */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-indigo-900/60 to-slate-900/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md mb-2">
              <Printer className="w-6 h-6 stroke-[1.75]" />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-white text-xs font-bold">
                Self Print Platform
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight max-w-[170px]">
              All your print services managed in one place.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
