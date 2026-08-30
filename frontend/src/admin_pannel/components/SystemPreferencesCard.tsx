import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Radio,
  ChevronDown
} from 'lucide-react';
import { SystemPreferencesFormValues } from '../types/settings.types';

interface SystemPreferencesCardProps {
  initialValues: SystemPreferencesFormValues;
  onSave: (values: SystemPreferencesFormValues) => void;
}

export const SystemPreferencesCard: React.FC<SystemPreferencesCardProps> = ({
  initialValues,
  onSave
}) => {
  const [form, setForm] = useState<SystemPreferencesFormValues>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">System Preferences</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure system wide preferences.
          </p>
        </div>

        {/* Preferences List */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. Allow New Store Registration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Allow New Store Registration
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Enable new stores to register on platform
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  allowNewStoreRegistration: !form.allowNewStoreRegistration
                })
              }
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                form.allowNewStoreRegistration ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  form.allowNewStoreRegistration ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Auto Approve Stores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Auto Approve Stores
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Automatically approve store registrations
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  autoApproveStores: !form.autoApproveStores
                })
              }
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                form.autoApproveStores ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  form.autoApproveStores ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Maintenance Mode
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Put platform in maintenance mode
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  maintenanceMode: !form.maintenanceMode
                })
              }
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                form.maintenanceMode ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  form.maintenanceMode ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Enable Captcha */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Enable Captcha
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Show captcha on login and registration
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  enableCaptcha: !form.enableCaptcha
                })
              }
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                form.enableCaptcha ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                  form.enableCaptcha ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Default Store Status */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Default Store Status
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  New stores will be set as pending
                </p>
              </div>
            </div>
            <div className="relative shrink-0">
              <select
                value={form.defaultStoreStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    defaultStoreStatus: e.target.value as any
                  })
                }
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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
