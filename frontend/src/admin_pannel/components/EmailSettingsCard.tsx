import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EmailSettingsFormValues } from '../types/settings.types';


interface EmailSettingsCardProps {
  initialValues: EmailSettingsFormValues;
  onSave: (values: EmailSettingsFormValues) => void;
}

export const EmailSettingsCard: React.FC<EmailSettingsCardProps> = ({
  initialValues,
  onSave
}) => {
  const [form, setForm] = useState<EmailSettingsFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Email Settings</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system email preferences.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* From Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              From Email
            </label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* From Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              From Name
            </label>
            <input
              type="text"
              value={form.fromName}
              onChange={(e) => setForm({ ...form, fromName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Email Provider */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Email Provider
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <span className="font-bold text-rose-500 text-xs">M</span>
              </div>
              <select
                value={form.emailProvider}
                onChange={(e) => setForm({ ...form, emailProvider: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="Gmail SMTP">Gmail SMTP</option>
                <option value="SendGrid API">SendGrid API</option>
                <option value="AWS SES">AWS SES</option>
                <option value="Mailgun">Mailgun</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <div className="pr-2">
              <p className="font-bold text-slate-900 text-xs">
                Email Notifications
              </p>
              <p className="text-[11px] text-slate-400">
                Enable to send email notifications to users.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  enableEmailNotifications: !form.enableEmailNotifications
                })
              }
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                form.enableEmailNotifications ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  form.enableEmailNotifications ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
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
