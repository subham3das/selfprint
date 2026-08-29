import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptSettingsModal: React.FC<ReceiptSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [headerNote, setHeaderNote] = useState(
    'Self-Print Instant Kiosk - Thank You!'
  );
  const [footerNote, setFooterNote] = useState(
    'Visit again! For queries call 9876543210'
  );
  const [showQrOnReceipt, setShowQrOnReceipt] = useState(true);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Receipt Settings
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Customize printed thermal &amp; digital receipts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Receipt Header Message
              </label>
              <input
                type="text"
                value={headerNote}
                onChange={(e) => setHeaderNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Receipt Footer Text
              </label>
              <input
                type="text"
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-700">
                  Include Store QR on Receipt
                </span>
                <button
                  type="button"
                  onClick={() => setShowQrOnReceipt(!showQrOnReceipt)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showQrOnReceipt ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showQrOnReceipt ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-700">
                  Display Detailed GST Breakdown
                </span>
                <button
                  type="button"
                  onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    showTaxBreakdown ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showTaxBreakdown ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Receipt Settings</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
