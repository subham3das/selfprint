import React from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, ArrowRight, LogOut, CheckCircle, Shield } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StoreAccount } from '../../types/auth';
import { localApi } from '../../services/api';

export const StoreSelectionPage: React.FC = () => {
  const userStores = useAppStore((s) => s.userStores);
  const authSession = useAppStore((s) => s.authSession);
  const setSelectedStore = useAppStore((s) => s.setSelectedStore);
  const setAuthStage = useAppStore((s) => s.setAuthStage);
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);

  const handleSelectStore = async (store: StoreAccount) => {
    setSelectedStore(store);

    // Check if connector is already paired to this selected store
    let isPairedToThisStore = false;
    try {
      const health = await localApi.getHealth();
      if (health?.isRegistered && health?.storeId === store.id) {
        isPairedToThisStore = true;
      }
    } catch {}

    if (isPairedToThisStore) {
      setAuthStage('AUTHENTICATED');
      showToast('Store Connected', `Connector is paired with ${store.storeName}`, 'success');
    } else {
      setAuthStage('PAIRING');
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-950 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Account Authenticated</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Select Store Location</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-200">{authSession?.email}</strong>. Choose which store this connector should run for.
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Store Cards List */}
        <div className="flex-1 overflow-y-auto py-6 space-y-3.5 pr-1">
          {userStores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No active stores found for this account. Please verify on the SelfPrint Store Dashboard.
            </div>
          ) : (
            userStores.map((store) => (
              <motion.div
                key={store.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectStore(store)}
                className="group p-5 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {store.storeName}
                      </h3>
                      {store.storeCode && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px] font-medium">
                          {store.storeCode}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle className="w-2.5 h-2.5 inline" />
                        <span>Active</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1.5">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{store.city || store.address || 'Location registered'}</span>
                      </div>
                      {store.ownerName && (
                        <>
                          <span>•</span>
                          <span>Owner: {store.ownerName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-400 group-hover:text-emerald-400 transition-colors pl-4">
                  <span className="text-xs font-semibold">Select</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
          <span>You can switch stores anytime later from the sidebar navigation.</span>
          <span>{userStores.length} store(s) available</span>
        </div>
      </motion.div>
    </div>
  );
};
export default StoreSelectionPage;
