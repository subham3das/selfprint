import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Radio,
  ChevronDown,
  Save
} from 'lucide-react';
import { SystemPreferencesFormValues } from '../types/settings.types';

interface SystemPreferencesCardProps {
  initialValues: SystemPreferencesFormValues;
  onSave: (values: SystemPreferencesFormValues) => void;
  isSaving?: boolean;
}

export const SystemPreferencesCard: React.FC<SystemPreferencesCardProps> = ({
  initialValues,
  onSave,
  isSaving
}) => {
  const [form, setForm] = useState<SystemPreferencesFormValues>(initialValues);

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
            <h3 className="text-sm font-bold text-slate-900">System Preferences</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Global platform behavior, store onboarding rules and security checks.
            </p>
          </div>
          {isDirty && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Unsaved Changes
            </span>
          )}
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
                  Enable new partners to register print hubs on platform
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
                  Automatically approve new store registrations without KYC review
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
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">
                  Platform Maintenance Mode
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Temporarily pause non-admin user operations and print queues
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
                form.maintenanceMode ? 'bg-rose-600' : 'bg-slate-200'
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
                  Two-Factor / Captcha Shield
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Require bot protection on authentication & password resets
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
                  Default New Store Status
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Initial status assigned upon partner registration
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
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-7 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="Pending">Pending Review</option>
                <option value="Active">Active Instant</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </form>
      </div>

      {/* Save Changes Button */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {isDirty ? 'Unsaved changes pending' : 'System preferences saved'}
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
