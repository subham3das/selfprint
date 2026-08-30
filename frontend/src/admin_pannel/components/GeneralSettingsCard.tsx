import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GeneralSettingsFormValues } from '../types/settings.types';

interface GeneralSettingsCardProps {
  initialValues: GeneralSettingsFormValues;
  onSave: (values: GeneralSettingsFormValues) => void;
}

export const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({
  initialValues,
  onSave
}) => {
  const [form, setForm] = useState<GeneralSettingsFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">General Settings</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage basic platform information and preferences.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Platform Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={form.platformName}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Platform Tagline */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Platform Tagline
            </label>
            <input
              type="text"
              value={form.platformTagline}
              onChange={(e) => setForm({ ...form, platformTagline: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Time Zone
            </label>
            <div className="relative">
              <select
                value={form.timeZone}
                onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Asia/Kolkata (GMT+05:30)">
                  Asia/Kolkata (GMT+05:30)
                </option>
                <option value="UTC (GMT+00:00)">UTC (GMT+00:00)</option>
                <option value="America/New_York (GMT-05:00)">
                  America/New_York (GMT-05:00)
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date Format & Currency in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date Format
              </label>
              <div className="relative">
                <select
                  value={form.dateFormat}
                  onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="29 May 2025 (DD MMM YYYY)">
                    29 May 2025 (DD MMM YYYY)
                  </option>
                  <option value="29/05/2025 (DD/MM/YYYY)">
                    29/05/2025 (DD/MM/YYYY)
                  </option>
                  <option value="2025-05-29 (YYYY-MM-DD)">
                    2025-05-29 (YYYY-MM-DD)
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Currency
              </label>
              <div className="relative">
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Indian Rupee (₹)">Indian Rupee (₹)</option>
                  <option value="US Dollar ($)">US Dollar ($)</option>
                  <option value="Euro (€)">Euro (€)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Language
            </label>
            <div className="relative">
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Assamese">Assamese</option>
                <option value="Bengali">Bengali</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </form>
      </div>

      {/* Save Changes Button */}
      <div className="pt-4 mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
