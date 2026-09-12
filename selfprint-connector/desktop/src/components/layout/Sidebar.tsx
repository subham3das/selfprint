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
  Radio,
  WifiOff,
  Loader2,
  Store,
  ArrowLeftRight,
  LogOut
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NavigationTab } from '../../types';

export const Sidebar: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const notifications = useAppStore((s) => s.notifications);
  const isLocalConnected = useAppStore((s) => s.isLocalConnected);
  const isSocketReconnecting = useAppStore((s) => s.isSocketReconnecting);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'printers', label: 'Printers', icon: <Printer className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> }
  ];

  const selectedStore = useAppStore((s) => s.selectedStore);
  const authSession = useAppStore((s) => s.authSession);
  const switchStore = useAppStore((s) => s.switchStore);
  const logout = useAppStore((s) => s.logout);

  return (
    <aside className="w-56 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-3 select-none">
      {/* Brand Header & Navigation Links */}
      <div className="space-y-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3 px-2 py-1">
          <img
            src="/logoapp.png"
            alt="SelfPrint Logo"
            className="w-8 h-8 object-contain rounded-lg shadow-md shadow-emerald-500/20"
          />
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-tight">SelfPrint</h2>
            <p className="text-[10px] text-emerald-400 font-medium">Connector v1.0.0</p>
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
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
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

      {/* Footer Controls & Account Section */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
        {/* Active Store & Switch/Logout */}
        {(selectedStore || authSession) && (
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-200 truncate">
                  {selectedStore?.storeName || 'Active Store'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {selectedStore?.storeCode || authSession?.email || 'Store Session'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/50">
              <button
                onClick={() => {
                  if (window.confirm('Switching stores will unpair this connector from the current store. Proceed?')) {
                    switchStore();
                  }
                }}
                className="flex-1 py-1 px-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 text-[10px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                title="Unpair and select another store"
              >
                <ArrowLeftRight className="w-2.5 h-2.5" />
                <span>Switch</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to sign out?')) {
                    logout();
                  }
                }}
                className="py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-[10px] font-semibold flex items-center justify-center transition-colors"
                title="Sign out of account"
              >
                <LogOut className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px]">
            {isSocketReconnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-400 font-medium">Reconnecting...</span>
              </>
            ) : isLocalConnected ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-slate-400">Port 4500</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400">Host Offline</span>
              </>
            )}
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
