import React from 'react';
import { FileText, Droplets, Layers, ArrowRight } from 'lucide-react';
import { StockAlertItem } from '../types/dashboard.types';

interface StockAlertsCardProps {
  alerts: StockAlertItem[];
  onViewAll?: () => void;
}

export const StockAlertsCard: React.FC<StockAlertsCardProps> = ({
  alerts,
  onViewAll
}) => {
  const getStockIcon = (type: StockAlertItem['type']) => {
    switch (type) {
      case 'paper':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
            <Layers className="w-4 h-4" />
          </div>
        );
      case 'toner':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'ink':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
            <Droplets className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Low Stock Alerts
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4 mt-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getStockIcon(alert.type)}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {alert.itemName}
                  </p>
                  <p className="text-xs text-slate-400 font-normal mt-0.5 truncate">
                    {alert.details}
                  </p>
                </div>
              </div>

              {/* Badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                  alert.severity === 'Critical'
                    ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold'
                    : 'bg-rose-50 text-rose-600 border-rose-200/80'
                }`}
              >
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
