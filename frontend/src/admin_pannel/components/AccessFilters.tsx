import React from 'react';
import { Search, ChevronDown, RotateCcw, UserPlus, History } from 'lucide-react';
import { AccessFiltersState } from '../types/access.types';

interface AccessFiltersProps {
  filters: AccessFiltersState;
  onFilterChange: (filters: AccessFiltersState) => void;
  onReset: () => void;
  onInviteClick: () => void;
  onAuditLogsClick: () => void;
}

export const AccessFilters: React.FC<AccessFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onInviteClick,
  onAuditLogsClick
}) => {
  const roles = [
    'All Roles',
    'Super Admin',
    'Admin',
    'Manager',
    'Finance',
    'Operations',
    'Support'
  ];

  const statuses = [
    'All Status',
    'Active',
    'Inactive',
    'Suspended',
    'Pending Invitation'
  ];

  const departments = [
    'All Departments',
    'Executive & Platform Security',
    'Platform Operations',
    'IT Infrastructure',
    'Security & Compliance',
    'Hardware Fleet',
    'Regional Operations',
    'Store Operations',
    'Customer Support'
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Search Input & Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Search by name, email, role or department..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Role Dropdown */}
        <div className="relative">
          <select
            value={filters.role}
            onChange={(e) =>
              onFilterChange({ ...filters, role: e.target.value })
            }
            className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ ...filters, status: e.target.value })
            }
            className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Department Dropdown */}
        <div className="relative hidden xl:block">
          <select
            value={filters.department}
            onChange={(e) =>
              onFilterChange({ ...filters, department: e.target.value })
            }
            className="appearance-none pl-3 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Audit Log Button */}
        <button
          type="button"
          onClick={onAuditLogsClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Audit Logs</span>
        </button>

        {/* Primary Invite Button */}
        <button
          type="button"
          onClick={onInviteClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Invite Staff</span>
        </button>
      </div>
    </div>
  );
};
