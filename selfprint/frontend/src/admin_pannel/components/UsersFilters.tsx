import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Download,
  Check
} from 'lucide-react';
import { UserFilterState } from '../types/user.types';

interface UsersFiltersProps {
  filters: UserFilterState;
  onFilterChange: (newFilters: Partial<UserFilterState>) => void;
  onReset: () => void;
  onExport: () => void;
  uniqueStores: string[];
  uniqueCities: string[];
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExport,
  uniqueStores,
  uniqueCities
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'store' | 'city' | 'plan' | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = ['All', 'Active', 'Inactive', 'Blocked', 'Banned', 'Pending', 'Verified'];
  const planOptions = ['All', 'Basic', 'Pro', 'Enterprise', 'Student'];
  const storeOptions = ['All', ...uniqueStores];
  const cityOptions = ['All', ...uniqueCities];

  return (
    <div
      ref={filterRef}
      className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
    >
      {/* Search Input Box */}
      <div className="relative flex-1 min-w-[260px] sm:min-w-[320px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search users by name, email or phone..."
          className="w-full bg-slate-50/70 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'status' ? null : 'status')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.status === 'All' ? 'All Status' : filters.status}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {statusOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onFilterChange({ status: st });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.status === st
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{st === 'All' ? 'All Status' : st}</span>
                    {filters.status === st && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Store Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'store' ? null : 'store')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span className="truncate max-w-[110px]">
              {filters.store === 'All' ? 'All Stores' : filters.store}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <AnimatePresence>
            {openDropdown === 'store' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-48 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {storeOptions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onFilterChange({ store: st });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.store === st
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{st === 'All' ? 'All Stores' : st}</span>
                    {filters.store === st && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'city' ? null : 'city')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.city === 'All' ? 'All Cities' : filters.city}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'city' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-44 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {cityOptions.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => {
                      onFilterChange({ city: ct });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.city === ct
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{ct === 'All' ? 'All Cities' : ct}</span>
                    {filters.city === ct && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'plan' ? null : 'plan')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.plan === 'All' ? 'All Plans' : filters.plan}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'plan' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {planOptions.map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => {
                      onFilterChange({ plan: pl });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.plan === pl
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{pl === 'All' ? 'All Plans' : pl}</span>
                    {filters.plan === pl && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Filters Button */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>

        {/* Export Users Button */}
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export Users</span>
        </button>
      </div>
    </div>
  );
};
