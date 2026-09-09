import React from 'react';
import { motion } from 'framer-motion';
import { PaymentBreakdownItem } from '../../types/transaction.types';

interface PaymentBreakdownCardProps {
  breakdown: PaymentBreakdownItem[];
  totalRevenue: number;
}

export const PaymentBreakdownCard: React.FC<PaymentBreakdownCardProps> = ({
  breakdown,
  totalRevenue
}) => {
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <h2 className="text-base font-bold text-slate-900 tracking-tight pb-4 border-b border-slate-100">
        Payment Method Breakdown
      </h2>

      {/* Donut and Legend Grid */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto pt-4">
        {/* SVG Donut Chart */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Segment Arcs */}
            {breakdown.map((item, idx) => {
              const strokeDasharray = `${
                (item.percentage / 100) * circumference
              } ${circumference}`;
              const strokeDashoffset = -(
                (accumulatedPercent / 100) *
                circumference
              );
              accumulatedPercent += item.percentage;

              return (
                <motion.circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend & Stats List */}
        <div className="flex-1 space-y-3.5 text-xs w-full">
          {breakdown.map((item) => (
            <div
              key={item.method}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-700">
                  {item.method}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">
                  ₹{item.amount.toFixed(2)}
                </span>
                <span className="text-slate-400 text-[11px] ml-1">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}

          {/* Total Revenue Callout */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="font-bold text-base text-slate-900">
              ₹{totalRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
