import React from 'react';
import {
  Store,
  Printer,
  DollarSign,
  CreditCard,
  FileText,
  Bell,
  Sliders,
  HardDrive,
  Info,
  Laptop,
  Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';

export type SettingsCategoryId =
  | 'store'
  | 'connector'
  | 'printer'
  | 'developer'
  | 'pricing'
  | 'payment'
  | 'receipt'
  | 'notifications'
  | 'preferences'
  | 'backup'
  | 'about';

interface SettingsNavCardProps {
  activeCategory: SettingsCategoryId;
  onSelectCategory: (id: SettingsCategoryId) => void;
}

export const SettingsNavCard: React.FC<SettingsNavCardProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const categories = [
    {
      id: 'store' as SettingsCategoryId,
      title: 'Store Settings',
      desc: 'Manage your store details',
      icon: Store
    },
    {
      id: 'connector' as SettingsCategoryId,
      title: 'Printer Connector',
      desc: 'Pair & monitor Desktop Connector',
      icon: Laptop
    },
    {
      id: 'printer' as SettingsCategoryId,
      title: 'Printer Settings',
      desc: 'Configure printer & preferences',
      icon: Printer
    },
    {
      id: 'developer' as SettingsCategoryId,
      title: 'Developer',
      desc: 'Test Mode & Virtual Printer',
      icon: Terminal
    },
    {
      id: 'pricing' as SettingsCategoryId,
      title: 'Pricing',
      desc: 'Set page prices and rules',
      icon: DollarSign
    },
    {
      id: 'payment' as SettingsCategoryId,
      title: 'Payment Settings',
      desc: 'Manage UPI and payments',
      icon: CreditCard
    },
    {
      id: 'receipt' as SettingsCategoryId,
      title: 'Receipt Settings',
      desc: 'Customize receipt templates',
      icon: FileText
    },
    {
      id: 'notifications' as SettingsCategoryId,
      title: 'Notification Settings',
      desc: 'Manage alerts and emails',
      icon: Bell
    },
    {
      id: 'preferences' as SettingsCategoryId,
      title: 'Preferences',
      desc: 'General preferences',
      icon: Sliders
    },
    {
      id: 'backup' as SettingsCategoryId,
      title: 'Backup & Restore',
      desc: 'Backup and restore data',
      icon: HardDrive
    },
    {
      id: 'about' as SettingsCategoryId,
      title: 'About',
      desc: 'App version and info',
      icon: Info
    }
  ];

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1.5 select-none">
      <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 px-2 border-b border-slate-100">
        Settings
      </h2>

      <div className="pt-1.5 space-y-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-start gap-3.5 p-2.5 rounded-xl text-left transition-all duration-150 relative ${
                isActive
                  ? 'bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold'
                  : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  {cat.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {cat.desc}
                </p>
              </div>

              {isActive && (
                <motion.div
                  layoutId="settingsActiveBar"
                  className="w-1 h-6 rounded-full bg-indigo-600 self-center"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
