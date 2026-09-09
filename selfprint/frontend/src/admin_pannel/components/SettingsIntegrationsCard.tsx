import React from 'react';
import { RefreshCw, Plug } from 'lucide-react';
import { IntegrationItem } from '../types/settings.types';

interface SettingsIntegrationsCardProps {
  integrations: IntegrationItem[];
  onManage?: () => void;
  onTestIntegration?: (provider: string) => void;
}

export const SettingsIntegrationsCard: React.FC<SettingsIntegrationsCardProps> = ({
  integrations,
  onManage,
  onTestIntegration
}) => {
  const getIcon = (type: IntegrationItem['iconType']) => {
    switch (type) {
      case 'razorpay':
        return (
          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
            R
          </div>
        );
      case 'sendgrid':
        return (
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
            S
          </div>
        );
      case 'firebase':
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            🔥
          </div>
        );
      case 'cloudinary':
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            ☁️
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Third-Party Integrations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live APIs, storage gateways & messaging services.
            </p>
          </div>
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

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.status === 'Connected'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                      : 'bg-amber-50 text-amber-600 border-amber-200/60'
                  }`}
                >
                  {item.status}
                </span>

                {onTestIntegration && (
                  <button
                    type="button"
                    onClick={() => onTestIntegration(item.name)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    title={`Test ${item.name} Connection`}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Integrations Button */}
      <div className="pt-3 mt-1">
        <button
          type="button"
          onClick={onManage}
          className="w-full py-2 border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plug className="w-3.5 h-3.5" />
          <span>Manage API Credentials</span>
        </button>
      </div>
    </div>
  );
};
