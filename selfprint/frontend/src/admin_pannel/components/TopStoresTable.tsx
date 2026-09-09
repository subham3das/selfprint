import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopStoreRevenueItem } from '../types/revenue.types';

interface TopStoresTableProps {
  stores: TopStoreRevenueItem[];
  isLoading?: boolean;
}

export const TopStoresTable: React.FC<TopStoresTableProps> = ({ stores, isLoading }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Top Performing Stores</h3>
        <button
          type="button"
          onClick={() => navigate('/admin/stores')}
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`store-skel-${idx}`} className="animate-pulse">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 shrink-0" />
                      <div className="w-20 h-3 bg-slate-200 rounded" />
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-12 h-3 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-8 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    <div className="w-10 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                  No stores recorded yet
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg ${s.logoBg || 'bg-slate-900'} text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {s.logoText || 'S'}
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

                  <td className="py-2.5 pl-2 text-right font-mono font-semibold text-emerald-600">
                    {s.commission}
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
