import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StoreLoginFormValues } from '../../schemas/storeLogin.schema';

interface StoreLoginFormProps {
  form: UseFormReturn<StoreLoginFormValues>;
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onInputChange: () => void;
}

export const StoreLoginForm: React.FC<StoreLoginFormProps> = ({
  form,
  isLoading,
  isSuccess,
  errorMessage,
  onSubmit,
  onInputChange
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors }
  } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left" noValidate>
      {/* Error Alert Banner with Shake Animation */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4, x: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              x: [-4, 4, -4, 4, -2, 2, 0]
            }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 shadow-2xs"
          >
            <div className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-extrabold text-rose-900">Login Failed</p>
              <p className="text-[11px] text-rose-700 leading-snug">
                {errorMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="store-email"
          className="block text-xs font-bold text-slate-700"
        >
          Registered Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="store-email"
            type="email"
            autoComplete="email"
            autoFocus
            disabled={isLoading || isSuccess}
            placeholder="e.g. yourshop@gmail.com"
            {...register('email', { onChange: onInputChange })}
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl transition-all outline-none ${
              errors.email
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] font-bold text-rose-600 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="store-password"
            className="block text-xs font-bold text-slate-700"
          >
            Password
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="store-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isLoading || isSuccess}
            placeholder="Enter your account password"
            {...register('password', { onChange: onInputChange })}
            className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl transition-all outline-none ${
              errors.password
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] font-bold text-rose-600 mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
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
              <span>Verifying Store Account...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Login Successful! Redirecting...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      {/* Divider */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
          OR
        </span>
      </div>

      {/* Bottom Switch to Register */}
      <div className="text-center pt-1">
        <p className="text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/store/onboarding')}
            className="text-purple-600 hover:text-purple-700 font-bold hover:underline transition-all cursor-pointer"
          >
            Create Store Account
          </button>
        </p>
      </div>
    </form>
  );
};
