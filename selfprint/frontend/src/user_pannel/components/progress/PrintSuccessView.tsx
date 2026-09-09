import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  FileCheck,
  RotateCcw,
  Sparkles,
  Printer,
  Download
} from 'lucide-react';
import { userPublicService } from '../../services/userPublic.service';

interface PrintSuccessViewProps {
  fileName: string;
  pages: number;
  copies: number;
  totalPaid: number;
  jobCode: string;
  onPrintMore: () => void;
}

export const PrintSuccessView: React.FC<PrintSuccessViewProps> = ({
  fileName,
  pages,
  copies,
  totalPaid,
  jobCode,
  onPrintMore
}) => {
  const [countdown, setCountdown] = useState(45);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onPrintMore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onPrintMore]);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const receipt = await userPublicService.fetchReceipt(jobCode);
      if (receipt) {
        const receiptText = `
========================================
       SELFPRINT OFFICIAL RECEIPT
========================================
Receipt No:    ${receipt.receiptNumber}
Store Name:    ${receipt.storeName}
Location:      ${receipt.storeCity}
GSTIN:         ${receipt.gstin}
Date & Time:   ${new Date(receipt.date).toLocaleString()}
----------------------------------------
Job Number:    ${receipt.jobNumber}
Transaction:   ${receipt.transactionId}
Document:      ${receipt.fileName}
Pages Printed: ${receipt.pages * receipt.copies} (${receipt.copies} copies)
Paper Size:    ${receipt.paperSize} (${receipt.colorMode})
Payment Mode:  ${receipt.paymentMethod}
----------------------------------------
TOTAL PAID:    ₹${receipt.totalAmount.toFixed(2)}
========================================
 Thank you for printing with SelfPrint!
========================================
`;
        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receipt.jobNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download receipt:', err);
      alert('Could not download receipt at this time.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Confetti particles
  const confettiColors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];
  const particles = Array.from({ length: 24 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex flex-col items-center text-center space-y-6 select-none relative overflow-hidden pt-2"
    >
      {/* Confetti Explosion Burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((_, i) => {
          const angle = (i / particles.length) * 360;
          const radius = 90 + Math.random() * 80;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const color = confettiColors[i % confettiColors.length];

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: [0, x],
                y: [0, y, y + 40],
                scale: [0, 1.2, 0.8],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.8 + Math.random() * 0.6,
                ease: 'easeOut',
                delay: 0.1
              }}
              className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>

      {/* Large Animated Green Emblem */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: 0.2
          }}
          className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 relative z-10"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Check className="w-12 h-12 stroke-[3.5]" />
          </motion.div>
        </motion.div>

        {/* Pulsing ring aura */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Job Completed</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          🎉 Printing Complete!
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
          Your documents are ready. Please collect them from the printer output tray.
        </p>
      </div>

      {/* Summary Card */}
      <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3 text-xs text-left">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Print Receipt</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            {jobCode}
          </span>
        </div>

        <div className="space-y-2 text-slate-600">
          <div className="flex items-center justify-between">
            <span>Document</span>
            <span className="font-bold text-slate-800 truncate max-w-[180px]">
              {fileName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Pages Printed</span>
            <span className="font-bold text-slate-800">
              {pages * copies} pages ({copies} {copies === 1 ? 'copy' : 'copies'})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Paid</span>
            <span className="font-bold text-emerald-600 font-mono">
              ₹{totalPaid.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Printer Station</span>
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Store LaserJet Tray
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isDownloading ? 'Fetching Receipt...' : 'Download Official Receipt'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons & Countdown */}
      <div className="w-full space-y-3 pt-2">
        <button
          onClick={onPrintMore}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Print More Documents</span>
        </button>

        {/* Auto Return Countdown Pill */}
        <p className="text-xs text-slate-400 font-medium">
          Returning to upload page in{' '}
          <span className="font-bold text-slate-700 font-mono">
            {countdown}s
          </span>
        </p>
      </div>
    </motion.div>
  );
};
