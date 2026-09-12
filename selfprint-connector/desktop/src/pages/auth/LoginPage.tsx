import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { storeAuthService, emitLifecycleLog } from '../../services/storeAuth';
import { localApi } from '../../services/api';

export const LoginPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const setAuthSession = useAppStore((s) => s.setAuthSession);
  const setUserStores = useAppStore((s) => s.setUserStores);
  const setSelectedStore = useAppStore((s) => s.setSelectedStore);
  const setAuthStage = useAppStore((s) => s.setAuthStage);
  const showToast = useAppStore((s) => s.showToast);

  // ── Auto-login on mount via DPAPI safeStorage ─────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function tryAutoLogin() {
      try {
        const session = await storeAuthService.getStoredAuthSession();
        if (!isMounted || !session?.token) {
          // Backward compatibility: If already paired previously, proceed directly to dashboard
          try {
            const health = await localApi.getHealth();
            if (health?.isRegistered && (health?.storeId || localStorage.getItem('selfprint_paired_store_name'))) {
              setAuthStage('AUTHENTICATED');
              setIsRestoring(false);
              return;
            }
          } catch {}

          setIsRestoring(false);
          setAuthStage('LOGIN');
          return;
        }

        // Validate token & fetch stores
        const stores = await storeAuthService.fetchMyStores(session.token);
        if (!isMounted) return;

        setAuthSession(session);
        setUserStores(stores);

        // Check if connector is already paired on local daemon
        let isAlreadyPaired = false;
        try {
          const health = await localApi.getHealth();
          if (health?.isRegistered && health?.storeId) {
            const matchingStore = stores.find((s) => s.id === health.storeId);
            if (matchingStore) {
              setSelectedStore(matchingStore);
              isAlreadyPaired = true;
            }
          }
        } catch {}

        if (isAlreadyPaired) {
          setAuthStage('AUTHENTICATED');
          showToast('Welcome Back', `Logged in to ${session.selectedStore?.storeName || 'SelfPrint'}`, 'success');
        } else if (session.selectedStore) {
          setSelectedStore(session.selectedStore);
          setAuthStage('PAIRING');
        } else if (stores.length === 1) {
          setSelectedStore(stores[0]);
          setAuthStage('PAIRING');
        } else {
          setAuthStage('STORE_SELECTION');
        }
      } catch (err: any) {
        console.warn('Auto-login session expired or invalid:', err.message);
        await storeAuthService.clearAuthSession();
        if (isMounted) {
          setIsRestoring(false);
          setAuthStage('LOGIN');
        }
      } finally {
        if (isMounted) setIsRestoring(false);
      }
    }

    tryAutoLogin();
    return () => {
      isMounted = false;
    };
  }, [setAuthSession, setUserStores, setSelectedStore, setAuthStage, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await storeAuthService.login(emailOrPhone.trim(), password);
      const session = {
        token: result.token,
        email: result.store?.email || emailOrPhone.trim(),
        ownerName: result.store?.ownerName || 'Store Owner',
        rememberMe,
        selectedStore: result.stores.length === 1 ? result.stores[0] : undefined
      };

      await storeAuthService.saveAuthSession(session);
      setAuthSession(session);
      setUserStores(result.stores);

      // Check daemon pairing state
      let pairedStoreId: string | null = null;
      try {
        const health = await localApi.getHealth();
        if (health?.isRegistered && health?.storeId) {
          pairedStoreId = health.storeId;
        }
      } catch {}

      if (result.stores.length === 1) {
        const singleStore = result.stores[0];
        setSelectedStore(singleStore);
        emitLifecycleLog('Store Selected', `Auto-selected store: ${singleStore.storeName}`);

        if (pairedStoreId && pairedStoreId === singleStore.id) {
          setAuthStage('AUTHENTICATED');
          showToast('Connected', `Logged in to ${singleStore.storeName}`, 'success');
        } else {
          setAuthStage('PAIRING');
        }
      } else {
        // Multiple stores exist -> route to Store Selection
        setAuthStage('STORE_SELECTION');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isRestoring) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 bg-slate-950 text-slate-200">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
        <p className="text-sm text-slate-400 font-medium">Checking stored credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 bg-slate-950 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">SelfPrint Connector</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with your SelfPrint Store Dashboard account</p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{errorMessage}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Phone Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email or Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="store@example.com"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Note */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0 cursor-pointer"
              />
              <span>Remember me on this PC</span>
            </label>
            <span className="text-slate-500">Encrypted with Windows DPAPI</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !emailOrPhone.trim() || !password}
            className="w-full mt-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Need an account? Register your print shop at{' '}
            <a
              href="https://selfprint.vercel.app/store/register"
              onClick={(e) => {
                e.preventDefault();
                (window as any).electronAPI?.openExternal('https://selfprint.vercel.app/store/register');
              }}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              selfprint.vercel.app
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
