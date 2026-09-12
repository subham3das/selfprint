import React, { useState } from 'react';
import { ShieldCheck, Key, CheckCircle2, AlertCircle, X, Store, Laptop } from 'lucide-react';
import { Button } from '../common/Button';
import { localApi } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

interface PairConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectorId: string;
  machineId: string;
  hostname: string;
  version: string;
  currentStoreName?: string | null;
  onPairSuccess?: (info: { storeName: string; storeId?: string; storeCode?: string; ownerName?: string }) => void;
}

export const PairConnectorModal: React.FC<PairConnectorModalProps> = ({
  isOpen,
  onClose,
  connectorId,
  machineId,
  hostname,
  version,
  currentStoreName,
  onPairSuccess
}) => {
  const [pairingCode, setPairingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successStore, setSuccessStore] = useState<string | null>(currentStoreName || null);

  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('SP-') && val.length > 0 && !val.startsWith('S')) {
      val = `SP-${val}`;
    }
    setPairingCode(val.slice(0, 9));
    setErrorMessage(null);
  };

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode.trim()) {
      setErrorMessage('Please enter the pairing code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await localApi.pairConnector({
        pairingCode: pairingCode.trim(),
        connectorId,
        machineId,
        hostname,
        version
      });

      const storeName = res.data.storeName || 'Your Store';
      const storeId = res.data.storeId || '';
      const storeCode = res.data.storeCode || '';
      const ownerName = res.data.ownerName || '';

      setSuccessStore(storeName);

      // Persist paired store credentials locally
      localStorage.setItem('selfprint_paired_store_name', storeName);
      localStorage.setItem('selfprint_device_token', res.data.deviceToken);
      if (storeId) {
        localStorage.setItem('selfprint_store_id', storeId);
      }
      if (storeCode) {
        localStorage.setItem('selfprint_store_code', storeCode);
      }
      if (ownerName) {
        localStorage.setItem('selfprint_owner_name', ownerName);
      }

      // Sync credentials to local daemon
      try {
        await fetch('http://127.0.0.1:4500/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceToken: res.data.deviceToken,
            storeId
          })
        });
      } catch (e) {
        // HTTP sync fallback handled below
      }

      // Direct fallback via Electron IPC if available (zero network dependency)
      try {
        if ((window as any).electronAPI?.saveConfig) {
          await (window as any).electronAPI.saveConfig({
            deviceToken: res.data.deviceToken,
            storeId
          });
        }
      } catch {}

      showToast('Connector Paired', `Successfully linked to ${storeName}!`, 'success');
      addActivity({
        type: 'CONNECTOR_STARTED',
        title: 'Connector Paired',
        description: `Successfully linked hardware bridge to ${storeName}.`
      });

      if (onPairSuccess) onPairSuccess({ storeName, storeId, storeCode, ownerName });
    } catch (err: any) {
      setErrorMessage(err.message || 'Pairing failed. Please check the code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Connect To Your Store</h2>
              <p className="text-[11px] text-slate-400">Enter the Connector Code from your Store Dashboard.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success State */}
        {successStore ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Connector Permanently Linked</span>
              </div>
              <p className="text-xs text-slate-300">
                This desktop connector is paired with <strong className="text-emerald-300">{successStore}</strong>. Hardware data and physical print jobs will route automatically.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Machine ID:</span>
                <span className="font-mono text-slate-200">{machineId.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hostname:</span>
                <span className="text-slate-200 font-medium">{hostname}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Auth Token:</span>
                <span className="text-emerald-400 font-medium">Secured • Auto-login active</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSuccessStore(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Pair to different store
              </button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Pairing Form */
          <form onSubmit={handlePair} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Store Pairing Code
              </label>
              <input
                type="text"
                value={pairingCode}
                onChange={handleCodeChange}
                placeholder="SP-8F4KD2"
                maxLength={9}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-lg font-mono text-center tracking-wider text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                autoFocus
              />
              <p className="text-[11px] text-slate-400">
                Enter the 6-character code from <strong>Settings &gt; Printer Connector</strong> in your Store Dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>One-Time Permanent Setup</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Once paired, this computer will automatically authenticate on startup. You will never need to enter this code again.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={isSubmitting}
                disabled={pairingCode.length < 5 || isSubmitting}
              >
                Connect
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
