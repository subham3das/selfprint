import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  User,
  ShoppingBag,
  Clock,
  FileText,
  Zap
} from 'lucide-react';
import { QuickInsightItem } from '../types/analytics.types';

interface QuickInsightsProps {
  insights: QuickInsightItem[];
}

export const QuickInsights: React.FC<QuickInsightsProps> = ({ insights }) => {
  const getIconMeta = (type: QuickInsightItem['iconType']) => {
    switch (type) {
      case 'shield':
        return { icon: ShieldCheck, bg: 'bg-purple-50 text-purple-600' };
      case 'trending':
        return { icon: TrendingUp, bg: 'bg-sky-50 text-sky-600' };
      case 'user':
        return { icon: User, bg: 'bg-sky-50 text-sky-600' };
      case 'queue':
        return { icon: ShoppingBag, bg: 'bg-amber-50 text-amber-600' };
      case 'wait':
        return { icon: Clock, bg: 'bg-amber-50 text-amber-600' };
      case 'pages':
        return { icon: FileText, bg: 'bg-emerald-50 text-emerald-600' };
      case 'peak':
        return { icon: Zap, bg: 'bg-purple-50 text-purple-600' };
      case 'growth':
      default:
        return { icon: TrendingUp, bg: 'bg-emerald-50 text-emerald-600' };
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900">Quick Insights</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {insights.map((item) => {
          const { icon: Icon, bg } = getIconMeta(item.iconType);

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2.5 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Title */}
              <p className="text-[10px] uppercase font-bold text-slate-400 truncate">
                {item.title}
              </p>

              {/* Value */}
              <p className="text-sm font-black text-slate-900 mt-0.5 truncate tracking-tight">
                {item.value}
              </p>

              {/* Subtitle / Trend */}
              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium leading-none">
                <span
                  className={
                    item.trend
                      ? item.isPositive
                        ? 'font-bold text-emerald-600'
                        : 'font-bold text-rose-500'
                      : 'text-slate-400'
                  }
                >
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
