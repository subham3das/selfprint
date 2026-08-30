import React from 'react';
import { TopStoreRevenueItem } from '../types/revenue.types';

interface TopStoresTableProps {
  stores: TopStoreRevenueItem[];
}

export const TopStoresTable: React.FC<TopStoresTableProps> = ({ stores }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Top Performing Stores</h3>
        <button
          type="button"
          onClick={() => alert('Viewing all stores revenue breakdown')}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-2">Store</th>
              <th className="py-2 px-2 text-right">Revenue</th>
              <th className="py-2 px-2 text-right">Txns</th>
              <th className="py-2 pl-2 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stores.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg ${s.logoBg} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {s.logoText}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate max-w-[120px]">
                        {s.storeName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {s.city}, {s.state}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                  {s.revenue}
                </td>

                <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                  {s.transactions.toLocaleString()}
                </td>

                <td className="py-2.5 pl-2 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                  {s.commission}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
