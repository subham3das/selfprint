import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { AdminTransactionItem, RefundFormValues } from '../types/transaction.types';

interface RefundModalProps {
  transaction: AdminTransactionItem | null;
  onClose: () => void;
  onConfirmRefund: (values: RefundFormValues) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  transaction,
  onClose,
  onConfirmRefund
}) => {
  if (!transaction) return null;

  const [refundAmount, setRefundAmount] = useState<number>(transaction.amountRaw);
  const [reason, setReason] = useState<string>('Paper Jam / Hardware Failure');
  const [refundMethod, setRefundMethod] = useState<RefundFormValues['refundMethod']>('Original Payment Method');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRefund({
      transactionId: transaction.txnId,
      refundAmount,
      reason,
      refundMethod
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Process Refund
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {transaction.txnId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Customer
              </span>
              <span className="font-bold text-slate-900">
                {transaction.customerName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Original Payment
              </span>
              <span className="font-bold text-slate-900">
                {transaction.amountFormatted} ({transaction.paymentMethod})
              </span>
            </div>
          </div>

          {/* Refund Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Refund Amount (₹)</label>
            <input
              type="number"
              required
              step="0.5"
              max={transaction.amountRaw}
              min={1}
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Refund Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Paper Jam / Hardware Failure">Paper Jam / Hardware Failure</option>
              <option value="Incorrect Print Configuration">Incorrect Print Configuration</option>
              <option value="Duplicate Charge">Duplicate Charge</option>
              <option value="Customer Requested Cancellation">Customer Requested Cancellation</option>
              <option value="Other">Other Operational Issue</option>
            </select>
          </div>

          {/* Refund Method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Disbursement Method</label>
            <select
              value={refundMethod}
              onChange={(e) =>
                setRefundMethod(
                  e.target.value as RefundFormValues['refundMethod']
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="Original Payment Method">Original Payment Method ({transaction.paymentMethod})</option>
              <option value="Instant UPI">Instant UPI Transfer</option>
              <option value="Store Credit">Self Print Store Credit</option>
            </select>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-[11px] text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This will update the transaction status to <strong>Refunded</strong> and initiate a reversal transaction reference.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirm &amp; Refund</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
