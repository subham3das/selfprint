import React from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Printer,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRConfig } from '../../types/qr.types';

interface TestQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRConfig;
}

export const TestQRModal: React.FC<TestQRModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  if (!isOpen) return null;

  const handleOpenLiveUpload = () => {
    window.open(config.storeUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window simulating Mobile Device Customer Kiosk */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Top Bar simulating Customer View */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                Customer Upload Portal Test
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer View Body */}
          <div className="p-6 space-y-5">
            {/* Store Badge */}
            <div className="text-center space-y-1">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md mb-2"
                style={{ backgroundColor: config.primaryColor || '#4F46E5' }}
              >
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                ) : (
                  <Printer className="w-6 h-6" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{config.storeName}</h3>
              <p className="text-xs text-slate-500">{config.storeLocation}</p>
              <span className="inline-block text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Target URL: {config.storeUrl}
              </span>
            </div>

            {/* Test Portal Action Box */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Test Live Customer Experience
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Opens the actual customer upload panel in a new browser tab with your store's live pricing and printer settings.
                </p>
              </div>
              <button
                onClick={handleOpenLiveUpload}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Public Upload Portal</span>
              </button>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Verified Active QR Endpoint</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
