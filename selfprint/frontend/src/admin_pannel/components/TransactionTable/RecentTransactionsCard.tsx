import React from 'react';
import { DashboardTransactionItem } from '../../types/admin.types';

interface RecentTransactionsCardProps {
  transactions: DashboardTransactionItem[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  onViewAll,
  isLoading
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Transactions Table */}
      <div className="w-full overflow-x-auto mt-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-2">ID</th>
              <th className="py-2 px-2">Store</th>
              <th className="py-2 px-2">Customer</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2 text-right">Commission</th>
              <th className="py-2 px-2 text-center">Payment</th>
              <th className="py-2 pl-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`txn-skel-${idx}`} className="animate-pulse">
                  <td className="py-2.5 pr-2">
                    <div className="w-16 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-12 h-3 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-10 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="w-8 h-3 bg-slate-100 rounded mx-auto" />
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <div className="w-14 h-4 bg-slate-100 rounded-full ml-auto" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                  No payment transactions recorded yet
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* ID */}
                  <td className="py-2.5 pr-2 font-mono text-[11px] font-bold text-slate-600">
                    {txn.id}
                  </td>

                  {/* Store Name */}
                  <td className="py-2.5 px-2 font-medium text-slate-900 truncate max-w-[120px]">
                    {txn.storeName}
                  </td>

                  {/* Customer */}
                  <td className="py-2.5 px-2 text-slate-600 font-medium">
                    {txn.customerName}
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-2 font-bold text-slate-900 text-right">
                    {txn.amount}
                  </td>

                  {/* Commission */}
                  <td className="py-2.5 px-2 font-medium text-slate-600 text-right">
                    {txn.commission}
                  </td>

                  {/* Payment Method */}
                  <td className="py-2.5 px-2 text-slate-500 font-semibold text-center">
                    {txn.paymentMethod}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 pl-2 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        txn.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : txn.status === 'Failed'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
