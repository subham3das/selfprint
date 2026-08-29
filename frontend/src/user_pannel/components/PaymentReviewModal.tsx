import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeLib from 'qrcode';
import {
  X,
  CheckCircle2,
  Printer,
  QrCode,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPriceSummary,
  UserPrintJobConfig,
  UploadedFileInfo,
  StoreKioskInfo
} from '../types/userPrint.types';

interface PaymentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFileInfo | null;
  config: UserPrintJobConfig;
  summary: UserPriceSummary;
  store: StoreKioskInfo;
}

export const PaymentReviewModal: React.FC<PaymentReviewModalProps> = ({
  isOpen,
  onClose,
  file,
  config,
  summary,
  store
}) => {
  const navigate = useNavigate();
  const [upiQrSvg, setUpiQrSvg] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<
    'pay' | 'verifying' | 'printing' | 'completed'
  >('pay');
  const [jobCode, setJobCode] = useState<string>('SP-10239-082');

  const upiPayUrl = `upi://pay?pa=${store.upiId}&pn=${encodeURIComponent(
    store.storeName
  )}&am=${summary.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    'Self Print Order'
  )}`;

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('pay');
      setJobCode(`SP-10239-${Math.floor(100 + Math.random() * 900)}`);
      QRCodeLib.toString(
        upiPayUrl,
        {
          type: 'svg',
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' }
        },
        (err, svg) => {
          if (!err && svg) setUpiQrSvg(svg);
        }
      );
    }
  }, [isOpen, upiPayUrl]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setPaymentStep('verifying');
    setTimeout(() => {
      onClose();
      navigate(`/store/${store.storeId}/progress`, {
        state: {
          fileName: file?.name || 'Notes.pdf',
          pages: summary.selectedPagesCount || 18,
          copies: config.copies || 2,
          paperSize: config.paperSize || 'A4',
          colorMode: config.colorMode || 'Black & White',
          totalPaid: summary.totalAmount || 36.0,
          jobCode: jobCode
        }
      });
    }, 1200);
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {paymentStep === 'pay'
                    ? 'Scan & Pay to Print'
                    : paymentStep === 'completed'
                    ? 'Print Successful!'
                    : 'Processing Job...'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {store.storeName} &bull; {jobCode}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1: Scan & Pay */}
          {paymentStep === 'pay' && (
            <div className="space-y-4 text-xs">
              {/* QR Code Container */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/60 flex flex-col items-center justify-center text-center">
                <p className="font-bold text-slate-800 text-xs mb-1">
                  Pay via any UPI App (GPay, PhonePe, Paytm)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mb-3">
                  {store.upiId}
                </p>

                <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative">
                  {upiQrSvg ? (
                    <div
                      className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: upiQrSvg }}
                    />
                  ) : (
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                  )}
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
                    <Printer className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[11px] text-slate-500">Amount Due</span>
                  <p className="text-xl font-bold text-slate-900 font-mono">
                    ₹{summary.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Specs Summary Pill */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-600">
                <span className="truncate max-w-[160px]">{file?.name}</span>
                <span className="font-bold text-slate-800 shrink-0">
                  {config.copies} {config.copies === 1 ? 'copy' : 'copies'} × {summary.selectedPagesCount} {summary.selectedPagesCount === 1 ? 'page' : 'pages'} ({config.colorMode})
                </span>
              </div>


              {/* Action Button */}
              <button
                onClick={handleSimulatePayment}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                <span>I Have Paid &bull; Start Print</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Verifying */}
          {paymentStep === 'verifying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center animate-bounce">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Verifying UPI Payment...
              </h4>
              <p className="text-xs text-slate-400">
                Confirming transaction of ₹{summary.totalAmount.toFixed(2)}
              </p>
            </div>
          )}

          {/* STEP 3: Printing */}
          {paymentStep === 'printing' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Printer className="w-7 h-7 animate-pulse" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Document is Printing!
              </h4>
              <p className="text-xs text-slate-500">
                Sending {summary.totalBillablePages} pages to printer tray...
              </p>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {/* STEP 4: Completed */}
          {paymentStep === 'completed' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">
                  Printing Completed!
                </h4>
                <p className="text-xs text-slate-500">
                  Please collect your {config.copies} {config.copies === 1 ? 'copy' : 'copies'} ({summary.totalBillablePages} {summary.totalBillablePages === 1 ? 'page' : 'pages'}) from the tray.
                </p>
              </div>


              <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Receipt / Job ID</span>
                <span className="font-bold font-mono text-indigo-600">
                  {jobCode}
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
