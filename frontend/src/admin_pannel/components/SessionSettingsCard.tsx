import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SessionSettingsFormValues } from '../types/settings.types';

interface SessionSettingsCardProps {
  initialValues: SessionSettingsFormValues;
  onSave: (values: SessionSettingsFormValues) => void;
}

export const SessionSettingsCard: React.FC<SessionSettingsCardProps> = ({
  initialValues,
  onSave
}) => {
  const [form, setForm] = useState<SessionSettingsFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Session Settings</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure user session and security.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Session Timeout */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Session Timeout
            </label>
            <div className="relative">
              <select
                value={form.sessionTimeout}
                onChange={(e) => setForm({ ...form, sessionTimeout: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="15 Minutes">15 Minutes</option>
                <option value="30 Minutes">30 Minutes</option>
                <option value="1 Hour">1 Hour</option>
                <option value="4 Hours">4 Hours</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Remember Me Duration */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Remember Me Duration
            </label>
            <div className="relative">
              <select
                value={form.rememberMeDuration}
                onChange={(e) => setForm({ ...form, rememberMeDuration: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="1 Day">1 Day</option>
                <option value="7 Days">7 Days</option>
                <option value="30 Days">30 Days</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Maximum Login Attempts */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Maximum Login Attempts
            </label>
            <input
              type="number"
              value={form.maxLoginAttempts}
              onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Lockout Duration */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Lockout Duration
            </label>
            <div className="relative">
              <select
                value={form.lockoutDuration}
                onChange={(e) => setForm({ ...form, lockoutDuration: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="15 Minutes">15 Minutes</option>
                <option value="30 Minutes">30 Minutes</option>
                <option value="1 Hour">1 Hour</option>
                <option value="24 Hours">24 Hours</option>
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
