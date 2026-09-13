import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Terminal, Shield, Laptop, RefreshCw } from 'lucide-react';
import { PrinterSettingsConfig } from '../../types/settings.types';
import { useStoreSession } from '../../hooks/useStoreSession';
import { getSocket, joinStoreRoom } from '@/lib/socket';

interface DeveloperSettingsCardProps {
  printer: PrinterSettingsConfig;
  onSave: (updated: PrinterSettingsConfig) => Promise<void> | void;
}

export const DeveloperSettingsCard: React.FC<DeveloperSettingsCardProps> = ({
  printer,
  onSave
}) => {
  const storeInfo = useStoreSession();
  const storeId = storeInfo?.id;

  const [testMode, setTestMode] = useState<boolean>(Boolean(printer?.testMode));
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sync state whenever backend printer settings are fetched or updated
  useEffect(() => {
    if (printer?.testMode !== undefined) {
      setTestMode(Boolean(printer.testMode));
    }
  }, [printer?.testMode]);

  // Real-time synchronization across multi-tabs via WebSocket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (storeId) {
      joinStoreRoom(storeId);
    }

    const handleTestMode = (data: { testMode?: boolean; enabled?: boolean }) => {
      const nextVal = Boolean(data?.testMode ?? data?.enabled);
      setTestMode(nextVal);
    };

    socket.on('store:testModeChanged', handleTestMode);
    socket.on('test_mode_changed', handleTestMode);
    socket.on('store_test_mode', handleTestMode);

    return () => {
      socket.off('store:testModeChanged', handleTestMode);
      socket.off('test_mode_changed', handleTestMode);
      socket.off('store_test_mode', handleTestMode);
    };
  }, [storeId]);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    if (nextVal) {
      // Show confirmation when turning Test Mode ON
      setShowConfirmModal(true);
    } else {
      // Instantly disable and persist
      await applyTestMode(false);
    }
  };

  const applyTestMode = async (enabled: boolean) => {
    setIsSaving(true);
    setTestMode(enabled);
    try {
      await onSave({
        ...printer,
        testMode: enabled
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save test mode setting:', err);
      // Revert state on error
      setTestMode(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmEnable = async () => {
    setShowConfirmModal(false);
    await applyTestMode(true);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Developer &amp; Test Mode
              </h2>
              {testMode && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  🧪 Sandbox Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate full print pipeline without physical hardware. Output generates virtual PDF receipts.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>Persisted</span>
          </div>
        )}
      </div>

      {/* Main Toggle Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 via-slate-50 to-indigo-50/30 border border-purple-100/80 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Enable Test Mode (Virtual Printer Sandbox)</span>
              {isSaving && <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              When enabled, Desktop Connector exposes <strong>Microsoft Print to PDF</strong> and virtual test printers. Real print jobs simulate complete 4-state lifecycle and save PDF outputs locally without consuming paper or ink.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={testMode}
              disabled={isSaving}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {testMode && (
          <div className="p-4 bg-purple-50/70 border border-purple-200/70 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <Laptop className="w-4 h-4 text-purple-600" />
              <span>Virtual Output Directory</span>
            </div>
            <p className="text-purple-800 font-mono text-[11px] bg-white/80 p-2 rounded-lg border border-purple-200 select-all">
              Documents \ SelfPrint \ TestPrints \ receipt-&lt;jobId&gt;.pdf
            </p>
            <p className="text-[11px] text-purple-700">
              Jobs stream states: <code>Pending</code> ➔ <code>Accepted</code> ➔ <code>Printing</code> ➔ <code>Completed</code>.
            </p>
          </div>
        )}
      </div>

      {/* Permissions / Security Note */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3 text-xs text-slate-500">
        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Store-Specific Scope: </span>
          Test Mode is securely isolated to this store (<code>{storeInfo.storeCode || 'Current Store'}</code>) and persists across page refreshes, browser reopens, and connector restarts.
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
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

export default DeveloperSettingsCard;
