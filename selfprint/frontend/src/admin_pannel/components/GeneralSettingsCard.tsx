import React, { useState, useEffect } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import { GeneralSettingsFormValues } from '../types/settings.types';

interface GeneralSettingsCardProps {
  initialValues: GeneralSettingsFormValues;
  onSave: (values: GeneralSettingsFormValues) => void;
  isSaving?: boolean;
}

export const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({
  initialValues,
  onSave,
  isSaving
}) => {
  const [form, setForm] = useState<GeneralSettingsFormValues>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">General Settings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage basic platform identity, branding, and localization preferences.
            </p>
          </div>
          {isDirty && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Unsaved Changes
            </span>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Platform Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Platform Name
            </label>
            <input
              type="text"
              value={form.platformName}
              onChange={(e) => setForm({ ...form, platformName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC (GMT+00:00)">UTC (GMT+00:00)</option>
                <option value="America/New_York (EST -05:00)">America/New_York (EST -05:00)</option>
                <option value="Europe/London (BST +01:00)">Europe/London (BST +01:00)</option>
                <option value="Asia/Singapore (SGT +08:00)">Asia/Singapore (SGT +08:00)</option>
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
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (29/05/2026)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (29 May 2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-05-29)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (05/29/2026)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Default Currency
              </label>
              <div className="relative">
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="GBP">British Pound (£ GBP)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Platform Language
            </label>
            <div className="relative">
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="English (US)">English (US)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Assamese">Assamese (অসমীয়া)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </form>
      </div>

      {/* Save Changes Button */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {isDirty ? 'Unsaved changes pending' : 'All settings up to date'}
        </span>
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
