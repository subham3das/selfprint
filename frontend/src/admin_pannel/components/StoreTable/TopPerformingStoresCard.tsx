import React from 'react';
import { Store } from 'lucide-react';
import { TopPerformingStoreItem } from '../../types/admin.types';

interface TopPerformingStoresCardProps {
  stores: TopPerformingStoreItem[];
  onViewAll?: () => void;
}

export const TopPerformingStoresCard: React.FC<TopPerformingStoresCardProps> = ({
  stores,
  onViewAll
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">Top Performing Stores</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Stores Table */}
      <div className="w-full overflow-x-auto mt-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-2">Store</th>
              <th className="py-2 px-2 text-right">Revenue</th>
              <th className="py-2 px-2 text-right">Orders</th>
              <th className="py-2 px-2 text-right">Commission</th>
              <th className="py-2 pl-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {stores.map((store) => (
              <tr
                key={store.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Store Name with Icon */}
                <td className="py-2.5 pr-2 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[130px]">
                    {store.storeName}
                  </span>
                </td>

                {/* Revenue */}
                <td className="py-2.5 px-2 font-semibold text-slate-900 text-right">
                  {store.revenue}
                </td>

                {/* Orders */}
                <td className="py-2.5 px-2 text-slate-600 font-medium text-right">
                  {store.orders}
                </td>

                {/* Commission */}
                <td className="py-2.5 px-2 text-slate-600 font-medium text-right">
                  {store.commission}
                </td>

                {/* Status Badge */}
                <td className="py-2.5 pl-2 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      store.status === 'Online'
                        ? 'bg-emerald-50 text-emerald-600'
                        : store.status === 'Busy'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {store.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
