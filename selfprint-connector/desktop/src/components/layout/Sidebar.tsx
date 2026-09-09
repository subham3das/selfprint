import React from 'react';
import {
  LayoutDashboard,
  Printer,
  Bell,
  Activity,
  Settings,
  Info,
  Sun,
  Moon,
  Radio
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NavigationTab } from '../../types';

export const Sidebar: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const notifications = useAppStore((s) => s.notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'printers', label: 'Printers', icon: <Printer className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-56 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-3 select-none">
      {/* Brand Header & Navigation Links */}
      <div className="space-y-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3 px-2 py-1">
          <img
            src="/logoapp.png"
            alt="SelfPrint Logo"
            className="w-8 h-8 object-contain rounded-lg shadow-md shadow-blue-500/20"
          />
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-tight">SelfPrint</h2>
            <p className="text-[10px] text-blue-400 font-medium">Connector v0.2.0</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                  {item.label}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: Live Status & Theme */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Port 4500</span>
          </div>
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
