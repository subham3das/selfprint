import React, { useState } from 'react';
import { Check, AlertTriangle, Terminal, Shield, Laptop, RefreshCw } from 'lucide-react';
import { PrinterSettingsConfig } from '../../types/settings.types';
import { useStoreSession } from '../../hooks/useStoreSession';

interface DeveloperSettingsCardProps {
  printer: PrinterSettingsConfig;
  onSave: (updated: PrinterSettingsConfig) => Promise<void> | void;
}

export const DeveloperSettingsCard: React.FC<DeveloperSettingsCardProps> = ({
  printer,
  onSave
}) => {
  const storeInfo = useStoreSession();
  const [testMode, setTestMode] = useState<boolean>(Boolean(printer?.testMode));
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Gating: Only store owners and admins can toggle Test Mode
  const userRole = (storeInfo as any)?.role || 'OWNER';
  const canModify = userRole === 'OWNER' || userRole === 'ADMIN';

  const handleToggle = () => {
    if (!canModify) return;
    if (!testMode) {
      setShowConfirmModal(true);
    } else {
      setTestMode(false);
      saveSetting(false);
    }
  };

  const confirmEnable = () => {
    setTestMode(true);
    saveSetting(true);
    setShowConfirmModal(false);
  };

  const saveSetting = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const updated = { ...printer, testMode: enabled };
      await onSave(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save test mode:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-100 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Developer Settings
                {testMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    TEST MODE ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Virtual hardware emulation, developer sandboxing &amp; diagnostic controls
              </p>
            </div>
          </div>
        </div>

        {/* Developer Sandbox Section */}
        <div className="pt-5 space-y-5">
          {/* Active Banner */}
          {testMode ? (
            <div className="p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-extrabold text-sm">Virtual Printer Emulation Active</p>
                <p className="leading-relaxed">
                  The desktop connector is exposing <strong>SelfPrint Virtual Printer</strong> (via <code>Microsoft Print to PDF</code>). Print jobs are intercepted and rendered directly to:
                </p>
                <div className="mt-1 p-2 bg-amber-100/80 rounded-lg font-mono text-[11px] font-bold text-amber-950 break-all">
                  Documents \ SelfPrint \ TestPrints \ receipt-&lt;jobId&gt;.pdf
                </div>
                <p className="text-[11px] text-amber-800 font-medium pt-1">
                  ⚠️ Disable Test Mode before processing real customer print orders.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800 text-sm">Production Mode Active</p>
                <p className="mt-0.5 leading-relaxed">
                  Only verified physical hardware printers (USB, Network, WiFi, Bluetooth) are detected and used for print orders.
                </p>
              </div>
            </div>
          )}

          {/* Test Mode Toggle Control */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  Enable Test Mode
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Allow testing the full printing pipeline without owning a physical printer. Automatically injects <strong>SelfPrint Virtual Printer</strong> if no printer is connected.
              </p>
              {!canModify && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5" />
                  Only Store Owners and Admins can toggle Test Mode.
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={!canModify || isSaving}
              onClick={handleToggle}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                testMode ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  testMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Developer Telemetry & Info */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Pipeline Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Virtual Device</span>
                <span className="font-bold text-slate-800">SelfPrint Virtual Printer</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Driver Hook</span>
                <span className="font-bold text-slate-800">Microsoft Print to PDF</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase">Lifecycle States</span>
                <span className="font-mono text-slate-800 font-semibold">Pending ➔ Accepted ➔ Printing ➔ Completed</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold text-[10px] uppercase">File Naming</span>
                <span className="font-mono text-slate-800 font-semibold">receipt-&lt;jobId&gt;.pdf</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Save Feedback */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <span className="text-xs text-slate-400">
            Changes synchronize instantly with connected desktop daemons via WebSockets.
          </span>
          {isSaving ? (
            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </span>
          ) : isSaved ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          ) : null}
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enable Test Mode Sandbox?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are switching this store into <strong>Test Mode</strong>. The connector will expose a virtual printer and save output files to:
              </p>
              <div className="mt-2.5 p-2.5 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-800 font-bold break-all">
                Documents \ SelfPrint \ TestPrints \ receipt-&lt;jobId&gt;.pdf
              </div>
              <p className="text-xs text-amber-800 font-semibold mt-2.5">
                ⚠️ Generated files are saved locally. Disable Test Mode before going live. Continue?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEnable}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-colors cursor-pointer"
              >
                Continue &amp; Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
