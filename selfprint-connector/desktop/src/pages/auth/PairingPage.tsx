import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Store, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Laptop, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { storeAuthService } from '../../services/storeAuth';
import { localApi } from '../../services/api';
import { HealthData } from '../../types';

export const PairingPage: React.FC = () => {
  const [pairingCode, setPairingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  const selectedStore = useAppStore((s) => s.selectedStore);
  const authSession = useAppStore((s) => s.authSession);
  const userStores = useAppStore((s) => s.userStores);
  const setAuthStage = useAppStore((s) => s.setAuthStage);
  const showToast = useAppStore((s) => s.showToast);
  const addActivity = useAppStore((s) => s.addActivity);

  useEffect(() => {
    localApi.getHealth().then(setHealthData).catch(() => {});
  }, []);

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
    if (!selectedStore) {
      setErrorMessage('Please select a store first.');
      return;
    }
    if (!pairingCode.trim()) {
      setErrorMessage('Please enter the pairing code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await storeAuthService.pairWithCode({
        pairingCode: pairingCode.trim(),
        storeId: selectedStore.id,
        token: authSession?.token,
        health: healthData
      });

      localStorage.setItem('selfprint_paired_store_name', result.storeName);
      localStorage.setItem('selfprint_paired_store_id', result.storeId);
      if (result.deviceToken) {
        localStorage.setItem('selfprint_device_token', result.deviceToken);
      }

      addActivity({
        type: 'CONNECTOR_STARTED',
        title: 'Connector Paired & Registered',
        description: `Successfully paired to ${result.storeName} (${result.storeCode || result.storeId})`
      });

      showToast('Pairing Verified', `Connector registered to ${result.storeName}`, 'success');
      setAuthStage('AUTHENTICATED');
    } catch (err: any) {
      setErrorMessage(err.message || 'Pairing failed. Ensure code belongs to this store and is not expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-950 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <Link2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Pair Desktop Connector</h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorize this machine to receive and print jobs for your store.
          </p>
        </div>

        {/* Selected Store Banner */}
        {selectedStore && (
          <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-100">{selectedStore.storeName}</span>
                  {selectedStore.storeCode && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                      {selectedStore.storeCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{selectedStore.city || selectedStore.address || 'Selected Store'}</p>
              </div>
            </div>

            {userStores.length > 1 && (
              <button
                onClick={() => setAuthStage('STORE_SELECTION')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Switch</span>
              </button>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{errorMessage}</span>
          </motion.div>
        )}

        {/* Pairing Form */}
        <form onSubmit={handlePair} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Enter 6-Character Pairing Code
            </label>
            <input
              type="text"
              value={pairingCode}
              onChange={handleCodeChange}
              placeholder="SP-XXXXXX"
              disabled={isSubmitting}
              maxLength={9}
              className="w-full text-center text-2xl font-mono tracking-widest font-black py-3 bg-slate-950/90 border-2 border-emerald-500/30 focus:border-emerald-400 rounded-xl text-emerald-300 placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all uppercase"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Generate this code in <strong>Store Dashboard &gt; Hardware &gt; Pair Connector</strong>.
            </p>
          </div>

          {/* Machine Registration Metadata Preview */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>Machine Hostname:</span>
              </span>
              <span className="font-mono text-slate-200">{healthData?.hostname || 'Host Device'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>OS &amp; Version:</span>
              </span>
              <span className="font-mono text-slate-200">
                Windows • v{healthData?.connectorVersion || '1.0.0'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || pairingCode.length < 5}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Pairing Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify &amp; Register Connector</span>
                </>
              )}
            </button>

            {userStores.length > 1 && (
              <button
                type="button"
                onClick={() => setAuthStage('STORE_SELECTION')}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Back to Store Selection
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default PairingPage;
