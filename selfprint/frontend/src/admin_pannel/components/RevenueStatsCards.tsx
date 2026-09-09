import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Coins,
  Receipt,
  ShoppingBag,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { RevenueStatsData } from '../types/revenue.types';

interface RevenueStatsCardsProps {
  stats: RevenueStatsData;
  isLoading?: boolean;
}

export const RevenueStatsCards: React.FC<RevenueStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`rev-stat-skel-${idx}`}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-28 animate-pulse"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
              <div className="w-20 h-3 bg-slate-100 rounded" />
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded mt-2" />
            <div className="w-24 h-2.5 bg-slate-100 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: stats.totalRevenue || '₹0.00',
      subText: stats.totalRevenueTrend || '0% from last month',
      isPositive: !stats.totalRevenueTrend?.includes('↓'),
      icon: Wallet,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'commission',
      title: 'Platform Commission',
      value: stats.platformCommission || '₹0.00',
      subText: stats.platformCommissionTrend || '0% from last month',
      isPositive: !stats.platformCommissionTrend?.includes('↓'),
      icon: Coins,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'transactions',
      title: 'Total Transactions',
      value: (stats.totalTransactions || 0).toLocaleString(),
      subText: stats.totalTransactionsTrend || '0% from last month',
      isPositive: !stats.totalTransactionsTrend?.includes('↓'),
      icon: Receipt,
      iconBg: 'bg-sky-50 text-sky-600'
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: stats.averageOrderValue || '₹0.00',
      subText: stats.averageOrderValueTrend || '0% from last month',
      isPositive: !stats.averageOrderValueTrend?.includes('↓'),
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'refunds',
      title: 'Refunds & Adjustments',
      value: stats.refundsAdjustments || '₹0.00',
      subText: stats.refundsTrend || '0% from last month',
      isPositive: false,
      icon: RotateCcw,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'net-revenue',
      title: 'Net Revenue',
      value: stats.netRevenue || '₹0.00',
      subText: stats.netRevenueTrend || '0% from last month',
      isPositive: !stats.netRevenueTrend?.includes('↓'),
      icon: TrendingUp,
      iconBg: 'bg-indigo-50 text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
      {cards.map((c, idx) => {
        const Icon = c.icon;

        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.02 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Top: Icon + Title */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-500 truncate">
                {c.title}
              </span>
            </div>

            {/* Numeric Value */}
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {c.value}
              </span>
            </div>

            {/* Bottom Subtext */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium leading-none">
              <span
                className={`font-bold truncate ${
                  c.isPositive ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {c.subText}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
