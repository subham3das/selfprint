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
}

export const RevenueStatsCards: React.FC<RevenueStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: stats.totalRevenue,
      subText: stats.totalRevenueTrend,
      isPositive: true,
      icon: Wallet,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'commission',
      title: 'Platform Commission',
      value: stats.platformCommission,
      subText: stats.platformCommissionTrend,
      isPositive: true,
      icon: Coins,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'transactions',
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      subText: stats.totalTransactionsTrend,
      isPositive: true,
      icon: Receipt,
      iconBg: 'bg-sky-50 text-sky-600'
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: stats.averageOrderValue,
      subText: stats.averageOrderValueTrend,
      isPositive: true,
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'refunds',
      title: 'Refunds & Adjustments',
      value: stats.refundsAdjustments,
      subText: stats.refundsTrend,
      isPositive: false,
      icon: RotateCcw,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'net-revenue',
      title: 'Net Revenue',
      value: stats.netRevenue,
      subText: stats.netRevenueTrend,
      isPositive: true,
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
