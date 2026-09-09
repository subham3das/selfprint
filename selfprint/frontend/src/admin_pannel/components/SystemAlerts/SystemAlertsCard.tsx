import React from 'react';
import {
  AlertTriangle,
  Printer,
  WifiOff,
  CreditCard,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { SystemAlertItem } from '../../types/admin.types';

interface SystemAlertsCardProps {
  alerts: SystemAlertItem[];
  onViewAll?: () => void;
  isLoading?: boolean;
}

const getAlertIcon = (icon: SystemAlertItem['icon']) => {
  switch (icon) {
    case 'alert-triangle':
      return { Icon: AlertTriangle, color: 'text-rose-500 bg-rose-50' };
    case 'printer-off':
      return { Icon: Printer, color: 'text-amber-500 bg-amber-50' };
    case 'wifi-off':
      return { Icon: WifiOff, color: 'text-rose-500 bg-rose-50' };
    case 'credit-card-off':
      return { Icon: CreditCard, color: 'text-rose-500 bg-rose-50' };
    case 'user-plus':
      return { Icon: UserPlus, color: 'text-indigo-500 bg-indigo-50' };
    default:
      return { Icon: AlertTriangle, color: 'text-slate-500 bg-slate-50' };
  }
};

export const SystemAlertsCard: React.FC<SystemAlertsCardProps> = ({
  alerts,
  onViewAll,
  isLoading
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100/80">
        <h2 className="text-sm font-bold text-slate-900">System Alerts</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col divide-y divide-slate-100/80 mt-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={`alert-skel-${idx}`} className="py-2.5 flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 shrink-0" />
                <div className="w-32 h-3 bg-slate-200 rounded" />
              </div>
              <div className="w-16 h-3 bg-slate-100 rounded" />
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <p className="text-xs font-semibold text-slate-600">No active alerts</p>
            <p className="text-[11px] text-slate-400">All printers and services operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const { Icon, color } = getAlertIcon(alert.icon);
            const isDanger = alert.alertType === 'danger';

            return (
              <div
                key={alert.id}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60 rounded-xl px-1 transition-colors"
              >
                {/* Icon & Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {alert.title}
                  </span>
                </div>

                {/* Count & Label */}
                <div className="shrink-0 text-right">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isDanger ? 'text-rose-600' : 'text-indigo-600'
                    }`}
                  >
                    {alert.countLabel}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
