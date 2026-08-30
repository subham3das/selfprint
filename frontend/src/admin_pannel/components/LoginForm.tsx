import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LoginFormValues } from '../schemas/login.schema';

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onInputChange: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  form,
  isLoading,
  isSuccess,
  errorMessage,
  onSubmit,
  onInputChange
}) => {
  const {
    register,
    formState: { errors }
  } = form;

  const activeError = errors.email?.message || errorMessage;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Email Input Field */}
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
            disabled={isLoading || isSuccess}
            placeholder="Enter your admin email"
            {...register('email', {
              onChange: onInputChange
            })}
            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl transition-all outline-none ${
              activeError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Shield className="w-4 h-4 text-purple-600/60" />
          </div>
        </div>

        {/* Validation / Auth Error Alert with Shake Animation */}
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
      </div>

      {/* Primary Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || isSuccess}
        whileHover={!isLoading && !isSuccess ? { scale: 1.01, y: -1 } : {}}
        whileTap={!isLoading && !isSuccess ? { scale: 0.99 } : {}}
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
