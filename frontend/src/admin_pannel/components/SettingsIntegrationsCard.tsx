import React from 'react';
import { ChevronRight } from 'lucide-react';
import { IntegrationItem } from '../types/settings.types';

interface SettingsIntegrationsCardProps {
  integrations: IntegrationItem[];
  onManage: () => void;
}

export const SettingsIntegrationsCard: React.FC<SettingsIntegrationsCardProps> = ({
  integrations,
  onManage
}) => {
  const getIcon = (type: IntegrationItem['iconType']) => {
    switch (type) {
      case 'razorpay':
        return (
          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
            R
          </div>
        );
      case 'sendgrid':
        return (
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            S
          </div>
        );
      case 'firebase':
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
            🔥
          </div>
        );
      case 'cloudinary':
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
            ☁️
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-sm font-bold text-slate-900">Integrations</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage third-party integrations.
        </p>
      </div>

      {/* Integrations List */}
      <div className="divide-y divide-slate-100">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {getIcon(item.iconType)}
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {item.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === 'Connected'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                    : 'bg-amber-50 text-amber-600 border-amber-200/60'
                }`}
              >
                {item.status}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Manage Integrations Button */}
      <div className="pt-3 mt-1">
        <button
          type="button"
          onClick={onManage}
          className="w-full py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Manage Integrations
        </button>
      </div>
    </div>
  );
};
