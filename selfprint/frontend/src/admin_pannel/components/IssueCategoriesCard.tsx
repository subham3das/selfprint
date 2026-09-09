import React from 'react';
import { Tag } from 'lucide-react';
import { IssueCategoryStat } from '../types/support.types';

interface IssueCategoriesCardProps {
  categories: IssueCategoryStat[];
}

export const IssueCategoriesCard: React.FC<IssueCategoriesCardProps> = ({ categories }) => {
  const rawCategories = categories || [];
  const maxCount = rawCategories[0]?.count || 1;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Top Issue Categories</h3>
      </div>

      {/* List with Progress bars or Empty State */}
      {rawCategories.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-100 rounded-xl my-2">
          <Tag className="w-8 h-8 text-slate-300" />
          <p className="text-xs font-semibold">No issue categories recorded</p>
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {rawCategories.map((cat, idx) => {
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
      )}
    </div>
  );
};
