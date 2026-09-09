import React from 'react';
import { Printer, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { QueueSummaryStats } from '../../types/queue.types';

interface QueueStatsGridProps {
  summary: QueueSummaryStats;
  onSelectStatus?: (status: string) => void;
}

export const QueueStatsGrid: React.FC<QueueStatsGridProps> = ({
  summary,
  onSelectStatus
}) => {
  const cards = [
    {
      id: 'printing',
      title: 'Printing',
      value: summary.printingNow,
      subtext: 'Jobs in progress',
      icon: Printer,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtextColor: 'text-blue-600',
      statusTarget: 'Printing'
    },
    {
      id: 'waiting',
      title: 'Waiting',
      value: summary.waitingInQueue,
      subtext: 'Jobs in queue',
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtextColor: 'text-amber-600',
      statusTarget: 'Waiting'
    },
    {
      id: 'completed',
      title: 'Completed Today',
      value: summary.completedToday,
      subtext: 'Total completed',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      subtextColor: 'text-emerald-600',
      statusTarget: 'Completed'
    },
    {
      id: 'failed',
      title: 'Failed Today',
      value: summary.failedToday,
      subtext: 'Total failed',
      icon: XCircle,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      subtextColor: 'text-rose-600',
      statusTarget: 'Failed'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelectStatus?.(card.statusTarget)}
            className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 cursor-pointer select-none"
          >
            {/* Icon Box */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${card.bgColor} ${card.iconColor}`}
            >
              <Icon className="w-7 h-7 stroke-[1.8]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500">{card.title}</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {card.value}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${card.subtextColor}`}>
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
