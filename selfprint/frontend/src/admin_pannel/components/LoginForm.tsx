import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LoginFormValues } from '../schemas/login.schema';

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  isLoading: boolean;
  isGoogleLoading?: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onGoogleLogin: () => void;
  onInputChange: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  form,
  isLoading,
  isGoogleLoading = false,
  isSuccess,
  errorMessage,
  onSubmit,
  onGoogleLogin,
  onInputChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors }
  } = form;

  const activeError = errors.email?.message || errorMessage;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* 1. Administrator Email Input Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="admin-email"
          className="block text-xs font-bold text-slate-700 tracking-tight"
        >
          Administrator Email
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>

          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            autoFocus
            disabled={isLoading || isGoogleLoading || isSuccess}
            placeholder="das01subhamj@gmail.com"
            {...register('email', {
              onChange: onInputChange
            })}
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl transition-all outline-hidden ${
              activeError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Shield className="w-4 h-4 text-purple-600/60" />
          </div>
        </div>
      </div>

      {/* 2. Password Input Field */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="admin-password"
          className="block text-xs font-bold text-slate-700 tracking-tight"
        >
          Password
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>

          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isLoading || isGoogleLoading || isSuccess}
            placeholder="••••••••••••"
            {...register('password', {
              onChange: onInputChange
            })}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl transition-all outline-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Professional Divider with "OR" */}
      <div className="relative py-1 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
          OR
        </span>
      </div>

      {/* 4. Continue with Google Button */}
      <motion.button
        type="button"
        onClick={onGoogleLogin}
        disabled={isLoading || isGoogleLoading || isSuccess}
        whileHover={!isLoading && !isGoogleLoading && !isSuccess ? { scale: 1.01, y: -0.5 } : {}}
        whileTap={!isLoading && !isGoogleLoading && !isSuccess ? { scale: 0.99 } : {}}
        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            <span className="text-slate-600 font-bold">Authenticating with Google...</span>
          </>
        ) : (
          <>
            {/* Official Multi-color Google SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </motion.button>

      {/* 5. Validation / Auth Error Alert with Shake Animation */}
      <AnimatePresence mode="wait">
        {activeError && (
          <motion.div
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              x: [-4, 4, -4, 4, -2, 2, 0]
            }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl text-[11px] font-bold text-rose-700 leading-snug"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Primary Login Button */}
      <motion.button
        type="submit"
        disabled={isLoading || isGoogleLoading || isSuccess}
        whileHover={!isLoading && !isGoogleLoading && !isSuccess ? { scale: 1.01, y: -1 } : {}}
        whileTap={!isLoading && !isGoogleLoading && !isSuccess ? { scale: 0.99 } : {}}
        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
          isSuccess
            ? 'bg-emerald-600 shadow-emerald-600/25'
            : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-purple-600/25'
        } disabled:opacity-75 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 animate-bounce" />
            <span>Access Granted! Redirecting...</span>
          </>
        ) : (
          <>
            <span>Login to Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </form>
  );
};

export default LoginForm;
