import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  TransactionItem,
  TransactionFilters,
  DateRangePreset
} from '../../types/transaction.types';

interface TransactionTableCardProps {
  transactions: TransactionItem[];
  filters: TransactionFilters;
  onFilterChange: (updated: Partial<TransactionFilters>) => void;
  onOpenFilterModal: () => void;
  onOpenExportModal: () => void;
  onViewDetails: (txn: TransactionItem) => void;
}

export const TransactionTableCard: React.FC<TransactionTableCardProps> = ({
  transactions,
  filters,
  onFilterChange,
  onOpenFilterModal,
  onOpenExportModal,
  onViewDetails
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const pageSize = 8;

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    // Search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTxn = txn.transactionId.toLowerCase().includes(q);
      const matchJob = txn.jobId.toLowerCase().includes(q);
      const matchName = txn.customerName.toLowerCase().includes(q);
      const matchPhone = txn.customerPhone.toLowerCase().includes(q);
      if (!matchTxn && !matchJob && !matchName && !matchPhone) {
        return false;
      }
    }

    // Payment Status
    if (filters.paymentStatus !== 'All' && txn.paymentStatus !== filters.paymentStatus) {
      return false;
    }

    // Payment Method
    if (filters.paymentMethod !== 'All' && !txn.paymentMethod.toLowerCase().includes(filters.paymentMethod.toLowerCase())) {
      return false;
    }

    // Color Mode
    if (filters.colorMode !== 'All' && txn.colorMode !== filters.colorMode) {
      return false;
    }

    // Paper Size
    if (filters.paperSize !== 'All' && txn.paperSize !== filters.paperSize) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const displayedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize
  );

  const datePresets: { id: DateRangePreset; label: string; text: string }[] = [
    { id: 'today', label: 'Today', text: '24 May 2024 - 24 May 2024' },
    { id: 'yesterday', label: 'Yesterday', text: '23 May 2024 - 23 May 2024' },
    { id: 'last_7_days', label: 'Last 7 Days', text: '18 May 2024 - 24 May 2024' },
    { id: 'last_30_days', label: 'Last 30 Days', text: '25 Apr 2024 - 24 May 2024' },
    { id: 'this_month', label: 'This Month', text: '01 May 2024 - 24 May 2024' }
  ];

  const activeDateText =
    datePresets.find((d) => d.id === filters.dateRange)?.text ||
    '24 May 2024 - 24 May 2024';

  const hasActiveFilters =
    filters.paymentStatus !== 'All' ||
    filters.paymentMethod !== 'All' ||
    filters.colorMode !== 'All' ||
    filters.paperSize !== 'All' ||
    filters.sortBy !== 'newest';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Refunded
          </span>
        );
      case 'Failed':
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            All Transactions
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Complete list of all print transactions
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>{activeDateText}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isDateMenuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 text-xs space-y-0.5">
                {datePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onFilterChange({ dateRange: preset.id });
                      setIsDateMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      filters.dateRange === preset.id
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>{preset.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {preset.text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={onOpenFilterModal}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
              hasActiveFilters
                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>

          {/* Export Button matching reference */}
          <button
            onClick={onOpenExportModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-2 font-semibold">Transaction ID</th>
              <th className="py-3 px-2 font-semibold">Date &amp; Time</th>
              <th className="py-3 px-2 font-semibold">Customer Name</th>
              <th className="py-3 px-2 font-semibold">Phone</th>
              <th className="py-3 px-2 font-semibold text-center">Pages</th>
              <th className="py-3 px-2 font-semibold text-center">Copies</th>
              <th className="py-3 px-2 font-semibold">Type</th>
              <th className="py-3 px-2 font-semibold">Amount</th>
              <th className="py-3 px-2 font-semibold">Payment Method</th>
              <th className="py-3 px-2 font-semibold">Status</th>
              <th className="py-3 px-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {displayedTransactions.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <span>
                    {transactions.length === 0
                      ? 'No transactions available'
                      : 'No transactions match your search or filter criteria.'}
                  </span>
                </td>
              </tr>
            ) : (
              displayedTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Transaction ID */}
                  <td className="py-3.5 px-2 font-bold text-indigo-600">
                    {txn.transactionId}
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-2">
                    <div className="text-slate-800 font-medium leading-tight">
                      {txn.transactionDate}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {txn.transactionTime}
                    </div>
                  </td>

                  {/* Customer Name */}
                  <td className="py-3.5 px-2 font-medium text-slate-800">
                    {txn.customerName}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-2 font-mono text-slate-600">
                    {txn.customerPhone}
                  </td>

                  {/* Pages */}
                  <td className="py-3.5 px-2 text-center font-medium text-slate-700">
                    {txn.pages}
                  </td>

                  {/* Copies */}
                  <td className="py-3.5 px-2 text-center font-medium text-slate-700">
                    {txn.copies}
                  </td>

                  {/* Type (B&W or Color) */}
                  <td className="py-3.5 px-2 font-medium text-slate-700">
                    {txn.colorMode}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-2 font-bold text-slate-900">
                    ₹{txn.amount.toFixed(2)}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-2">
                    <div className="text-slate-800 font-medium leading-tight">
                      {txn.paymentMethod.startsWith('UPI') ? 'UPI' : txn.paymentMethod}
                    </div>
                    {txn.paymentMethod.startsWith('UPI') && (
                      <div className="text-[11px] text-slate-400 font-normal">
                        {txn.paymentMethod.replace('UPI (', '').replace(')', '')}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-2">{getStatusBadge(txn.paymentStatus)}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => onViewDetails(txn)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="View Transaction Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">
          Showing {displayedTransactions.length > 0 ? startIndex + 1 : 0} to{' '}
          {startIndex + displayedTransactions.length} of{' '}
          {filteredTransactions.length} transactions
        </span>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
