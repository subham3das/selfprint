import React from 'react';
import { TopCityRevenueItem } from '../types/revenue.types';

interface TopCitiesTableProps {
  cities: TopCityRevenueItem[];
}

export const TopCitiesTable: React.FC<TopCitiesTableProps> = ({ cities }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with View All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Top Cities by Revenue
        </h3>
        <button
          type="button"
          onClick={() => alert('Viewing complete regional analytics breakdown')}
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
              <th className="py-2.5 pl-1 pr-2">City</th>
              <th className="py-2.5 px-2 text-right">Revenue</th>
              <th className="py-2.5 pr-1 pl-2 text-right">Transactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cities.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* City */}
                <td className="py-2 pl-1 pr-2 font-bold text-slate-900 text-xs">
                  {item.city}, {item.state}
                </td>

                {/* Revenue + Progress Bar */}
                <td className="py-2 px-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {item.revenueFormatted}
                    </span>
                    <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Transactions */}
                <td className="py-2 pr-1 pl-2 text-right font-semibold text-slate-700 text-xs">
                  {item.transactions.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
