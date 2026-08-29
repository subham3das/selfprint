import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Upload,
  CheckCircle2,
  Printer,
  ShieldCheck
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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setSelectedFile('sample_document_test.pdf');
    setTimeout(() => {
      setIsSuccess(true);
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
                Customer Mobile Kiosk Preview
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
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{config.storeName}</h3>
              <p className="text-xs text-slate-500">{config.storeLocation}</p>
              <span className="inline-block text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Store ID: {config.storeId}
              </span>
            </div>

            {/* Simulated Upload Box */}
            {!isSuccess ? (
              <div
                onClick={handleSimulateUpload}
                className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {selectedFile ? 'Processing...' : 'Tap to Select Document'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, DOCX, PNG, JPG (Up to {config.uploadLimitMb}MB)
                </span>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  Document Ready for Printing!
                </h4>
                <p className="text-xs text-emerald-700">
                  sample_document_test.pdf (4 pages &bull; B&amp;W &bull; ₹8.00)
                </p>
                <button
                  onClick={() => {
                    alert('Simulated customer checkout complete! Print dispatched.');
                    onClose();
                  }}
                  className="mt-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Confirm &amp; Print
                </button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Verified Permanent QR Endpoint</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
