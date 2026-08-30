import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Plus,
  Check,
  X
} from 'lucide-react';
import { PrinterFilterState } from '../types/printer.types';

interface PrinterFiltersProps {
  filters: PrinterFilterState;
  onFilterChange: (newFilters: Partial<PrinterFilterState>) => void;
  onReset: () => void;
  onAddNewPrinter: () => void;
  uniqueStores: string[];
  uniqueCities: string[];
}

export const PrinterFilters: React.FC<PrinterFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  onAddNewPrinter,
  uniqueStores,
  uniqueCities
}) => {
  const [openDropdown, setOpenDropdown] = useState<'status' | 'store' | 'city' | 'type' | null>(null);
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

  const statusOptions = ['All Status', 'Online', 'Busy', 'Offline', 'Maintenance', 'Error'];
  const typeOptions = ['All Types', 'Laser', 'Inkjet'];

  return (
    <div
      ref={filterRef}
      className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3"
    >
      {/* Left Search & Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* Search Input */}
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by printer name, ID, store or location..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'status' ? null : 'status')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
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
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {statusOptions.map((opt) => {
                  const val = opt === 'All Status' ? 'All' : opt;
                  const isSelected = filters.status === val;

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onFilterChange({ status: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
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
            <span className="truncate max-w-[120px]">
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
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
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
                    <span>{ct === 'All' ? 'All Cities' : ct}</span>
                    {filters.city === ct && <Check className="w-3 h-3 text-indigo-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Type Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === 'type' ? null : 'type')
            }
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{filters.type === 'All' ? 'All Types' : filters.type}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {openDropdown === 'type' && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1"
              >
                {typeOptions.map((tp) => {
                  const val = tp === 'All Types' ? 'All' : tp;
                  const isSelected = filters.type === val;

                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => {
                        onFilterChange({ type: val });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-600 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tp}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    </button>
                  );
                })}
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

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onAddNewPrinter}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add New Printer</span>
      </button>
    </div>
  );
};
