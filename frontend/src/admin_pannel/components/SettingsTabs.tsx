import React from 'react';
import {
  Settings,
  Sliders,
  Store,
  Users,
  Printer,
  Shield,
  Bell,
  CreditCard,
  Plug,
  Cpu
} from 'lucide-react';
import { SettingsTab } from '../types/settings.types';

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'General', label: 'General', icon: Settings },
    { id: 'Platform', label: 'Platform', icon: Sliders },
    { id: 'Stores', label: 'Stores', icon: Store },
    { id: 'Users', label: 'Users', icon: Users },
    { id: 'Printing', label: 'Printing', icon: Printer },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Billing', label: 'Billing', icon: CreditCard },
    { id: 'Integrations', label: 'Integrations', icon: Plug },
    { id: 'System', label: 'System', icon: Cpu }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl px-4 sm:px-6 shadow-xs overflow-x-auto">
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-3.5 text-xs font-bold transition-all relative cursor-pointer ${
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>

              {/* Active Underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
