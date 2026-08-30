import React from 'react';
import {
  HelpCircle,
  Clock,
  Database,
  HardDrive,
  Users,
  Store,
  Printer
} from 'lucide-react';
import { SystemOverviewData } from '../types/settings.types';

interface SystemOverviewCardProps {
  overview: SystemOverviewData;
}

export const SystemOverviewCard: React.FC<SystemOverviewCardProps> = ({ overview }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-sm font-bold text-slate-900">System Overview</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Overview of your platform settings.
        </p>
      </div>

      {/* Overview List */}
      <div className="space-y-3 text-xs">
        {/* Platform Version */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Platform Version</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {overview.platformVersion}
          </span>
        </div>

        {/* Environment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Environment</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            {overview.environment}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Database Status</span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {overview.databaseStatus}
          </span>
        </div>

        {/* Storage Usage */}
        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Storage Usage</span>
            </div>
            <span className="font-mono font-bold text-slate-900">
              {overview.storageUsedPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview.storageUsedPercent}%` }}
            />
          </div>
        </div>

        {/* Active Users */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Active Users</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {overview.activeUsers.toLocaleString()}
          </span>
        </div>

        {/* Total Stores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Store className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Total Stores</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {overview.totalStores.toLocaleString()}
          </span>
        </div>

        {/* Total Printers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Total Printers</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {overview.totalPrinters.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
