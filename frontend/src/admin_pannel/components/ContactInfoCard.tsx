import React, { useState } from 'react';
import { ContactInfoFormValues } from '../types/settings.types';

interface ContactInfoCardProps {
  initialValues: ContactInfoFormValues;
  onSave: (values: ContactInfoFormValues) => void;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
  initialValues,
  onSave
}) => {
  const [form, setForm] = useState<ContactInfoFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Contact Information</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Update platform contact details.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Support Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Support Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Support Phone
            </label>
            <input
              type="text"
              value={form.supportPhone}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Company Address
            </label>
            <textarea
              rows={4}
              value={form.companyAddress}
              onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
            />
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
