import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Store,
  QrCode,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StoreRegistrationResponse } from '../../types/storeOnboarding.types';

interface SuccessAnimationProps {
  registrationResult: StoreRegistrationResponse | null;
  countdown: number;
  onGoToDashboard: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  registrationResult,
  countdown,
  onGoToDashboard
}) => {
  const cards = [
    {
      title: 'Store Created',
      desc: registrationResult?.storeName || 'Print Shop Registered',
      icon: Store,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Dashboard Ready',
      desc: 'Realtime order queues & analytics',
      icon: LayoutDashboard,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'QR Code Ready',
      desc: 'Instant customer upload posters',
      icon: QrCode,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Account Activated',
      desc: 'Instant payouts enabled',
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  return (
    <div className="text-center py-6 px-4 space-y-6">
      {/* Animated Checkmark Badge */}
      <div className="relative inline-flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30"
        >
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
        </motion.div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-2 max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          🎉 Welcome to Self Print Partner!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Your store has been successfully registered. You're now ready to automate your printing business, receive instant customer orders, manage printers, and grow your revenue.
        </p>

        {registrationResult?.storeId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-xs font-mono font-bold text-purple-700 mt-2">
            <span>Store ID:</span>
            <span>{registrationResult.storeId}</span>
          </div>
        )}
      </div>

      {/* 4 Feature Activation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl mx-auto text-left">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-900 text-xs">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Action & Countdown Indicator */}
      <div className="pt-4 max-w-md mx-auto space-y-3">
        <button
          type="button"
          onClick={onGoToDashboard}
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>Go to Store Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-slate-400 font-mono">
          Auto-redirecting to dashboard in <strong className="text-slate-800 font-bold">{countdown}s</strong>...
        </p>
      </div>
    </div>
  );
};
