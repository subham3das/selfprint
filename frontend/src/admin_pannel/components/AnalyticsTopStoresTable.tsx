import React from 'react';
import { AnalyticsTopStoreItem } from '../types/analytics.types';

interface AnalyticsTopStoresTableProps {
  stores: AnalyticsTopStoreItem[];
}

export const AnalyticsTopStoresTable: React.FC<AnalyticsTopStoresTableProps> = ({ stores }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          Top 10 Stores by Performance
        </h3>
        <button
          type="button"
          onClick={() => alert('Viewing all stores performance ranking')}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-2">Store</th>
              <th className="py-2 px-2 text-right">Orders</th>
              <th className="py-2 px-2 text-right">Revenue (₹)</th>
              <th className="py-2 pl-2 text-right">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stores.map((s) => (
              <tr key={s.rank} className="hover:bg-slate-50/80 transition-colors">
                {/* Store Name & Logo */}
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-[11px] font-mono font-bold text-slate-400 shrink-0 text-center">
                      {s.rank}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg ${s.logoBg} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {s.logoText}
                    </div>
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[130px]">
                      {s.name}
                    </span>
                  </div>
                </td>

                {/* Orders */}
                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                  {s.orders.toLocaleString()}
                </td>

                {/* Revenue */}
                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                  {s.revenue}
                </td>

                {/* Growth */}
                <td className="py-2.5 pl-2 text-right font-bold text-emerald-600 whitespace-nowrap text-[11px]">
                  {s.growth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
