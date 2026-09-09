import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Layers,
  Receipt,
  TrendingUp,
  Sliders,
  BarChart3,
  ArrowRight,
  Sparkles,
  Store
} from 'lucide-react';


interface WelcomePageProps {
  onStart: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const navigate = useNavigate();

  const benefits = [
    {
      title: 'QR Based Printing',
      desc: 'Zero app download required for customers',
      icon: QrCode,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      title: 'Automatic Order Queue',
      desc: 'Smart spooling with instant job preview',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'Live Payment Transactions',
      desc: '100% direct UPI & digital collection',
      icon: Receipt,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Daily Revenue Reports',
      desc: 'Automated settlement & growth analytics',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Printer Fleet Management',
      desc: 'Ink, paper & spooler status tracking',
      icon: Sliders,
      color: 'text-cyan-600 bg-cyan-50'
    },
    {
      title: 'Customer Analytics',
      desc: 'Understand peak hours and repeat users',
      icon: BarChart3,
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      {/* Top Graphic / Hero Badge */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30"
        >
          <Store className="w-8 h-8 stroke-[1.75]" />
        </motion.div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-xs font-bold text-purple-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Partner Program</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome to Self Print Partner
          </h1>

          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            Automate your print shop, reduce manual WhatsApp file transfers, receive print orders instantly via QR, and manage your business with ease.
          </p>
        </div>
      </div>

      {/* 6 Feature Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all group"
            >
              <div>
                <div
                  className={`w-8 h-8 rounded-xl ${b.color} flex items-center justify-center mb-2.5 shadow-2xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs">
                  {b.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {b.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/store/login')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
        >
          Already Registered? Login
        </button>
      </div>
    </div>
  );
};

