import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  CircleDollarSign,
  Coins
} from 'lucide-react';
import { TransactionStatsData } from '../types/transaction.types';

interface TransactionStatsCardsProps {
  stats: TransactionStatsData;
}

export const TransactionStatsCards: React.FC<TransactionStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      subText: stats.totalTransactionsTrend,
      isPositive: true,
      icon: CreditCard,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'success',
      title: 'Successful Transactions',
      value: stats.successfulTransactions.toLocaleString(),
      subText: stats.successfulTransactionsTrend,
      isPositive: true,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'pending',
      title: 'Pending Transactions',
      value: stats.pendingTransactions.toLocaleString(),
      subText: stats.pendingTransactionsTrend,
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'failed',
      title: 'Failed Transactions',
      value: stats.failedTransactions.toLocaleString(),
      subText: stats.failedTransactionsTrend,
      isPositive: false,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-500'
    },
    {
      id: 'amount',
      title: 'Total Amount',
      value: stats.totalAmountFormatted,
      subText: stats.totalAmountTrend,
      isPositive: true,
      icon: CircleDollarSign,
      iconBg: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'commission',
      title: 'Total Commission',
      value: stats.totalCommissionFormatted,
      subText: stats.totalCommissionTrend,
      isPositive: true,
      icon: Coins,
      iconBg: 'bg-sky-50 text-sky-600'
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
