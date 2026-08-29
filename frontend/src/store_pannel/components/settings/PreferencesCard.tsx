import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PreferencesSettingsConfig } from '../../types/settings.types';

interface PreferencesCardProps {
  preferences: PreferencesSettingsConfig;
  onSave: (updated: PreferencesSettingsConfig) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({
  preferences,
  onSave
}) => {
  const [formData, setFormData] =
    useState<PreferencesSettingsConfig>(preferences);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <h2 className="text-base font-bold text-slate-900 tracking-tight">
        Preferences
      </h2>
      <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
        General preferences for your store panel
      </p>

      <form
        onSubmit={handleSubmit}
        className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs"
      >
        {/* Left 3 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* Auto Refresh Interval */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Auto Refresh Interval
            </label>
            <select
              value={formData.autoRefreshInterval}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  autoRefreshInterval: e.target
                    .value as PreferencesSettingsConfig['autoRefreshInterval']
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
            >
              <option value="5 Seconds">5 Seconds</option>
              <option value="10 Seconds">10 Seconds</option>
              <option value="30 Seconds">30 Seconds</option>
              <option value="60 Seconds">60 Seconds</option>
            </select>
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Theme</label>
            <select
              value={formData.theme}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  theme: e.target.value as PreferencesSettingsConfig['theme']
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
            >
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Language</label>
            <select
              value={formData.language}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  language: e.target
                    .value as PreferencesSettingsConfig['language']
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>

        {/* Right 2 Toggles and Save Button */}
        <div className="flex flex-wrap items-center gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Low Stock Alerts */}
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 block text-[11px]">
              Show Low Stock Alerts
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  showLowStockAlerts: !formData.showLowStockAlerts
                })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                formData.showLowStockAlerts ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  formData.showLowStockAlerts
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Revenue on Dashboard */}
          <div className="space-y-1">
            <span className="font-semibold text-slate-700 block text-[11px]">
              Show Revenue on Dashboard
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  showRevenueOnDashboard: !formData.showRevenueOnDashboard
                })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                formData.showRevenueOnDashboard
                  ? 'bg-indigo-600'
                  : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  formData.showRevenueOnDashboard
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2 sm:pt-0">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
