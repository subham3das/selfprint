import React from 'react';
import { motion } from 'framer-motion';
import { Printer, Lock } from 'lucide-react';
import { LoginForm } from './LoginForm';

import { UseFormReturn } from 'react-hook-form';
import { LoginFormValues } from '../schemas/login.schema';

interface LoginCardProps {
  form: UseFormReturn<LoginFormValues>;
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onInputChange: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  form,
  isLoading,
  isSuccess,
  errorMessage,
  onSubmit,
  onInputChange
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[420px] bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 relative overflow-hidden"
    >
      {/* Decorative Top Accent Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header: Logo & Brand Badge */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 mb-3.5">
          <Printer className="w-6 h-6" />
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className="text-sm font-black text-slate-900 tracking-tight">
            Self Print
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
            ADMIN
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Administrator Portal
        </p>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Enter your registered administrator email to continue.
        </p>
      </div>

      {/* Form Component */}
      <LoginForm
        form={form}
        isLoading={isLoading}
        isSuccess={isSuccess}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onInputChange={onInputChange}
      />

      {/* Security Badge Note */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>Secured with Role-Based Access Control</span>
      </div>
    </motion.div>
  );
};
