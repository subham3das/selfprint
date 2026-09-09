import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecentRevenueTransactionItem } from '../types/revenue.types';

interface RevenueTransactionsTableProps {
  transactions: RecentRevenueTransactionItem[];
  isLoading?: boolean;
}

export const RevenueTransactionsTable: React.FC<RevenueTransactionsTableProps> = ({
  transactions,
  isLoading
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with View All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Revenue Transactions
        </h3>
        <button
          type="button"
          onClick={() => navigate('/admin/transactions')}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
              <th className="py-2.5 pl-1 pr-2">Transaction ID</th>
              <th className="py-2.5 px-2">Store</th>
              <th className="py-2.5 px-2 text-right">Amount</th>
              <th className="py-2.5 px-2 text-right">Commission</th>
              <th className="py-2.5 px-2 text-center">Status</th>
              <th className="py-2.5 pr-1 pl-2 text-right">Date &amp; Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`rev-txn-skel-${idx}`} className="animate-pulse">
                  <td className="py-2.5 pl-1 pr-2">
                    <div className="w-20 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-12 h-3 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-10 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="w-12 h-4 bg-slate-100 rounded-full mx-auto" />
                  </td>
                  <td className="py-2.5 pr-1 pl-2 text-right">
                    <div className="w-16 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No revenue transactions recorded yet
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Transaction ID */}
                  <td className="py-2.5 pl-1 pr-2 font-mono font-bold text-slate-900 text-xs">
                    {txn.txnId}
                  </td>

                  {/* Store */}
                  <td className="py-2.5 px-2 text-slate-700 font-medium text-xs truncate max-w-[130px]">
                    {txn.storeName}
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-2 text-right font-bold text-slate-900 font-mono text-xs">
                    {txn.amountFormatted}
                  </td>

                  {/* Commission */}
                  <td className="py-2.5 px-2 text-right font-medium text-slate-600 font-mono text-xs">
                    {txn.commissionFormatted}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        txn.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : txn.status === 'Pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-2.5 pr-1 pl-2 text-right whitespace-nowrap">
                    <p className="font-medium text-slate-800 text-xs">{txn.date}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{txn.time}</p>
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
