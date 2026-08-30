import React from 'react';
import { IssueCategoryStat } from '../types/support.types';

interface IssueCategoriesCardProps {
  categories: IssueCategoryStat[];
}

export const IssueCategoriesCard: React.FC<IssueCategoriesCardProps> = ({ categories }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Top Issue Categories</h3>
        <button
          type="button"
          onClick={() => alert('Viewing complete issue classification breakdown')}
          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List with Progress bars */}
      <div className="space-y-3 mt-3">
        {categories.map((cat, idx) => {
          const maxCount = categories[0]?.count || 542;
          const barWidth = Math.max(8, (cat.count / maxCount) * 100);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {cat.category}
                </span>
                <span className="font-mono text-slate-500 font-medium text-[11px]">
                  {cat.count} ({cat.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
