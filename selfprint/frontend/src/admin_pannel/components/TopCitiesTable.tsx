import React from 'react';
import { TopCityRevenueItem } from '../types/revenue.types';

interface TopCitiesTableProps {
  cities: TopCityRevenueItem[];
  isLoading?: boolean;
}

export const TopCitiesTable: React.FC<TopCitiesTableProps> = ({ cities, isLoading }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with View All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Top Cities by Revenue
        </h3>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`city-skel-${idx}`} className="animate-pulse">
                  <td className="py-2.5 pl-1 pr-2">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="w-16 h-3 bg-slate-200 rounded ml-auto" />
                    <div className="w-20 h-1.5 bg-slate-100 rounded ml-auto mt-1" />
                  </td>
                  <td className="py-2.5 pr-1 pl-2 text-right">
                    <div className="w-10 h-3 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : cities.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                  No city data recorded yet
                </td>
              </tr>
            ) : (
              cities.map((item) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
