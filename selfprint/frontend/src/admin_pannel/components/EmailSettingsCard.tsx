import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Send, Save } from 'lucide-react';
import { EmailSettingsFormValues } from '../types/settings.types';

interface EmailSettingsCardProps {
  initialValues: EmailSettingsFormValues;
  onSave: (values: EmailSettingsFormValues) => void;
  onTestEmail?: (recipient: string) => void;
  isSaving?: boolean;
}

export const EmailSettingsCard: React.FC<EmailSettingsCardProps> = ({
  initialValues,
  onSave,
  onTestEmail,
  isSaving
}) => {
  const [form, setForm] = useState<EmailSettingsFormValues>(initialValues);
  const [testRecipient, setTestRecipient] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleSendTest = () => {
    if (onTestEmail) {
      onTestEmail(testRecipient.trim() || form.fromEmail);
      setShowTestModal(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Email & Dispatch Settings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure platform transactional email sender, SMTP gateway and notification triggers.
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
          {/* From Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Sender Email Address (From)
            </label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* From Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Sender Display Name
            </label>
            <input
              type="text"
              value={form.fromName}
              onChange={(e) => setForm({ ...form, fromName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Email Provider */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Active Email Delivery Provider
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <select
                value={form.emailProvider}
                onChange={(e) => setForm({ ...form, emailProvider: e.target.value })}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="SendGrid API">SendGrid Web API (Recommended)</option>
                <option value="AWS SES">Amazon SES (Simple Email Service)</option>
                <option value="Gmail SMTP">Custom SMTP / Postfix</option>
                <option value="Mailgun">Mailgun REST Gateway</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="pr-2">
              <p className="font-bold text-slate-900 text-xs">
                Transactional Email Dispatch
              </p>
              <p className="text-[11px] text-slate-400">
                Send receipts, verification codes, and security alerts to users.
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

      {/* Save Changes & Test Email Buttons */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowTestModal(true)}
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Send className="w-3 h-3 text-slate-500" />
          <span>Test Email</span>
        </button>

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

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl w-full max-w-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Dispatch Test Email</h4>
            <p className="text-xs text-slate-400 mb-3">
              Enter recipient address to verify SMTP & gateway delivery.
            </p>
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="e.g. admin@selfprint.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
