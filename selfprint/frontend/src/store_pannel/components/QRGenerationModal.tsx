import React from 'react';
import { X, QrCode, Printer, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreInfo } from '../types/dashboard.types';

interface QRGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeInfo: StoreInfo;
}

export const QRGenerationModal: React.FC<QRGenerationModalProps> = ({
  isOpen,
  onClose,
  storeInfo
}) => {
  const [copied, setCopied] = React.useState(false);
  const storeUrl = `https://selfprint.app/kiosk/${encodeURIComponent(
    storeInfo.name.toLowerCase().replace(/\s+/g, '-')
  )}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-left">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Store QR Code Standee
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QR Standee Card Preview */}
          <div className="p-6">
            <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white flex flex-col items-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
                Scan to Self-Print
              </span>

              {/* QR Code Graphic (SVG) */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-slate-900"
                  fill="currentColor"
                >
                  {/* Outer corner top-left */}
                  <rect x="10" y="10" width="25" height="25" rx="3" fill="#0F172A" />
                  <rect x="15" y="15" width="15" height="15" rx="1" fill="#FFFFFF" />
                  <rect x="18" y="18" width="9" height="9" rx="1" fill="#4F46E5" />

                  {/* Outer corner top-right */}
                  <rect x="65" y="10" width="25" height="25" rx="3" fill="#0F172A" />
                  <rect x="70" y="15" width="15" height="15" rx="1" fill="#FFFFFF" />
                  <rect x="73" y="18" width="9" height="9" rx="1" fill="#4F46E5" />

                  {/* Outer corner bottom-left */}
                  <rect x="10" y="65" width="25" height="25" rx="3" fill="#0F172A" />
                  <rect x="15" y="70" width="15" height="15" rx="1" fill="#FFFFFF" />
                  <rect x="18" y="73" width="9" height="9" rx="1" fill="#4F46E5" />

                  {/* Pattern Dots */}
                  <rect x="42" y="12" width="6" height="6" rx="1" fill="#0F172A" />
                  <rect x="52" y="12" width="6" height="6" rx="1" fill="#0F172A" />
                  <rect x="42" y="24" width="6" height="12" rx="1" fill="#4F46E5" />
                  <rect x="52" y="30" width="6" height="6" rx="1" fill="#0F172A" />

                  <rect x="12" y="42" width="6" height="6" rx="1" fill="#0F172A" />
                  <rect x="24" y="42" width="12" height="6" rx="1" fill="#0F172A" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#4F46E5" />
                  <rect x="65" y="42" width="6" height="12" rx="1" fill="#0F172A" />
                  <rect x="78" y="42" width="10" height="6" rx="1" fill="#0F172A" />

                  <rect x="12" y="54" width="18" height="6" rx="1" fill="#0F172A" />
                  <rect x="65" y="60" width="12" height="6" rx="1" fill="#4F46E5" />
                  <rect x="82" y="54" width="6" height="12" rx="1" fill="#0F172A" />

                  <rect x="42" y="65" width="6" height="12" rx="1" fill="#0F172A" />
                  <rect x="52" y="72" width="12" height="6" rx="1" fill="#0F172A" />
                  <rect x="42" y="82" width="18" height="6" rx="1" fill="#4F46E5" />
                  <rect x="68" y="78" width="8" height="10" rx="1" fill="#0F172A" />
                  <rect x="80" y="78" width="8" height="8" rx="1" fill="#0F172A" />
                </svg>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mt-3">
                {storeInfo.name}
              </h4>
              <p className="text-xs text-slate-500">{storeInfo.location}</p>
            </div>

            {/* Copy Link Row */}
            <div className="mt-4 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 truncate flex-1 text-left font-mono">
                {storeUrl}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors flex items-center gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => alert('Printing Store QR Standee...')}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Standee</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
