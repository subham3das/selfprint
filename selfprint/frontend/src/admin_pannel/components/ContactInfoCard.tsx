import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { ContactInfoFormValues } from '../types/settings.types';

interface ContactInfoCardProps {
  initialValues: ContactInfoFormValues;
  onSave: (values: ContactInfoFormValues) => void;
  isSaving?: boolean;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  initialValues,
  onSave,
  isSaving
}) => {
  const [form, setForm] = useState<ContactInfoFormValues>(initialValues);

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
            <h3 className="text-sm font-bold text-slate-900">Contact Information</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official platform support, corporate communications & headquarters address.
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
          {/* Support Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Primary Support Email
            </label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Support Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Helpline Phone Number
            </label>
            <input
              type="text"
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Corporate Headquarters Address
            </label>
            <textarea
              rows={3}
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
            />
          </div>
        </form>
      </div>

      {/* Save Changes Button */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {isDirty ? 'Unsaved changes pending' : 'Contact info up to date'}
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
