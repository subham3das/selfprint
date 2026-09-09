import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  RotateCcw,
  Check
} from 'lucide-react';
import { RevenueFilterState, RevenueFilterPeriod } from '../types/revenue.types';
import { RevenueExportDropdown } from './RevenueExportDropdown';

interface RevenueFiltersProps {
  filters: RevenueFilterState;
  onFilterChange: (newFilters: Partial<RevenueFilterState>) => void;
  onReset: () => void;
  onExport: (format: 'csv' | 'excel' | 'pdf' | 'report' | 'summary') => void;
  uniqueStores: string[];
  uniqueCities: string[];
}

export const RevenueFilters: React.FC<RevenueFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onExport,
  uniqueStores,
  uniqueCities
}) => {
  const [openDropdown, setOpenDropdown] = useState<'period' | 'store' | 'city' | 'type' | null>(null);
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

  const periodOptions: RevenueFilterPeriod[] = [
    'Today',
    'This Week',
    'This Month',
    'Last Month',
    'This Year',
    'Custom'
  ];

  const revenueTypeOptions = [
    'All Revenue Types',
    'Print Services',
    'Subscription Plans',
    'Membership Fees',
    'Other Services'
  ];

  return (
    <div
      ref={filterRef}
      className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
    >
      {/* Left Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Time Period Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'period' ? null : 'period')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'period' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {periodOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onFilterChange({ period: opt });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.period === opt
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {filters.period === opt && <Check className="w-3 h-3 text-indigo-600" />}
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
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span className="truncate max-w-[130px]">{filters.store}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <AnimatePresence>
            {openDropdown === 'store' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-52 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {uniqueStores.map((st) => (
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
                    <span className="truncate">{st}</span>
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
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.city}</span>
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
                {uniqueCities.map((ct) => (
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
                    <span>{ct}</span>
                    {filters.city === ct && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Revenue Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'type' ? null : 'type')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.revenueType}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {revenueTypeOptions.map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => {
                      onFilterChange({ revenueType: tp });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                      filters.revenueType === tp
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tp}</span>
                    {filters.revenueType === tp && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Right Export Button */}
      <RevenueExportDropdown onExport={onExport} />
    </div>
  );
};
