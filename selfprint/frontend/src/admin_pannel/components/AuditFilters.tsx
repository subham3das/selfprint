import React from 'react';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Table,
  GitCommit,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import {
  AuditFiltersState,
  AuditViewMode,
  AutoRefreshInterval
} from '../types/audit.types';
import { AuditFiltersOptionsResponse } from '../services/auditLogs.service';
import { AuditExportDropdown } from './AuditExportDropdown';

interface AuditFiltersProps {
  filters: AuditFiltersState;
  filterOptions?: AuditFiltersOptionsResponse;
  onFilterChange: (filters: AuditFiltersState) => void;
  viewMode: AuditViewMode;
  onViewModeChange: (mode: AuditViewMode) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf' | 'json') => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onReset,
  onRefresh,
  onExport
}) => {
  const modules = filterOptions?.modules || [
    'All Modules',
    'Auth',
    'Stores',
    'Users',
    'Transactions',
    'Revenue',
    'Printers',
    'Support',
    'Analytics',
    'Settings',
    'Access Control',
    'System'
  ];

  const severities = filterOptions?.severities || [
    'All Severities',
    'Info',
    'Success',
    'Warning',
    'Critical',
    'Security'
  ];

  const statuses = filterOptions?.statuses || [
    'All Statuses',
    'Completed',
    'Failed',
    'Blocked',
    'Pending'
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
      {/* Top Row: Search + Main Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="Search user, email, IP, action, module, session..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={filters.module}
              onChange={(e) =>
                onFilterChange({ ...filters, module: e.target.value })
              }
              className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Severity Filter */}
          <div className="relative">
            <select
              value={filters.severity}
              onChange={(e) =>
                onFilterChange({ ...filters, severity: e.target.value })
              }
              className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative hidden xl:block">
            <select
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value })
              }
              className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onReset}
            className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Tools: View Switcher, Auto-Refresh, Export */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Timeline View"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Heatmap & Map View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>
          </div>

          {/* Auto Refresh Dropdown */}
          <div className="relative">
            <select
              value={filters.autoRefresh}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  autoRefresh: e.target.value as AutoRefreshInterval
                })
              }
              className={`appearance-none pl-3 pr-7 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.autoRefresh !== 'off'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <option value="off">Auto: OFF</option>
              <option value="30s">Live: 30s</option>
              <option value="1m">Live: 1 min</option>
              <option value="5m">Live: 5 min</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export Dropdown */}
          <AuditExportDropdown onExport={onExport} />
        </div>
      </div>
    </div>
  );
};
