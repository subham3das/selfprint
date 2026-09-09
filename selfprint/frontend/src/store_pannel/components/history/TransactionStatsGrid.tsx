import React from 'react';
import {
  FileText,
  DollarSign,
  Coins,
  Receipt,
  RotateCcw,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FinancialSummary } from '../../types/transaction.types';

interface TransactionStatsGridProps {
  summary: FinancialSummary;
}

export const TransactionStatsGrid: React.FC<TransactionStatsGridProps> = ({
  summary
}) => {
  const cards = [
    {
      id: 'total_txns',
      title: 'Total Transactions',
      value: summary.totalTransactions,
      prefix: '',
      subtextPeriod: summary.period,
      changeText: `↑ ${summary.totalTransactionsChangePercent}% vs yesterday`,
      hasPositiveChange: true,
      icon: FileText,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'total_revenue',
      title: 'Total Revenue',
      value: `₹${summary.totalRevenue.toFixed(2)}`,
      prefix: '',
      subtextPeriod: summary.period,
      changeText: `↑ ${summary.totalRevenueChangePercent}% vs yesterday`,
      hasPositiveChange: true,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'cash_received',
      title: 'Cash Received',
      value: `₹${summary.cashReceived.toFixed(2)}`,
      prefix: '',
      subtextPeriod: summary.period,
      changeText: null,
      icon: Coins,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'avg_order_value',
      title: 'Avg. Order Value',
      value: `₹${summary.avgOrderValue.toFixed(2)}`,
      prefix: '',
      subtextPeriod: summary.period,
      changeText: null,
      icon: Receipt,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'refunds',
      title: 'Refunds',
      value: `₹${summary.refundsTotal.toFixed(2)}`,
      prefix: '',
      subtextPeriod: summary.period,
      changeText: null,
      icon: RotateCcw,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            whileHover={{ y: -2 }}
            className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 select-none"
          >
            {/* Icon Box */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.bgColor} ${card.iconColor}`}
            >
              <Icon className="w-6 h-6 stroke-[1.8]" />
            </div>

            {/* Metric Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">
                {card.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {card.value}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="text-slate-400 font-medium">
                  {card.subtextPeriod}
                </span>
                {card.changeText && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold text-[11px]">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{card.changeText.replace('↑ ', '')}</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
