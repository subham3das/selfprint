import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  Phone,
  Layers,
  Store,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionItem } from '../../types/transaction.types';

interface TransactionDetailsModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Transaction Details
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {transaction.transactionId} &bull; {transaction.jobId}
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

          {/* Body */}
          <div className="p-6 space-y-4 text-xs">
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Total Paid Amount
                </span>
                <p className="text-2xl font-bold text-slate-900">
                  ₹{transaction.amount.toFixed(2)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {transaction.paymentStatus}
              </span>
            </div>

            {/* Customer & Print Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Customer
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {transaction.customerName}
                </p>
                <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {transaction.customerPhone}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Print Specs
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {transaction.pages} pages &bull; {transaction.copies} copy
                </p>
                <p className="text-slate-500 text-[11px]">
                  {transaction.colorMode} &bull; {transaction.paperSize}
                </p>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span>Price per page</span>
                <span className="font-medium text-slate-800">
                  ₹{transaction.pricePerPage.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal ({transaction.pages} × {transaction.copies})</span>
                <span className="font-medium text-slate-800">
                  ₹{transaction.subtotal.toFixed(2)}
                </span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{transaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount</span>
                <span>₹{transaction.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Audit Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Payment Method
                </span>
                <span className="font-semibold text-slate-800">
                  {transaction.paymentMethod}
                </span>
              </div>
              {transaction.upiReference && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">UPI Ref</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {transaction.upiReference}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date &amp; Time
                </span>
                <span className="text-slate-700">
                  {transaction.transactionDate} at {transaction.transactionTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  Store / Operator
                </span>
                <span className="text-slate-700">
                  {transaction.storeName} ({transaction.operator})
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
