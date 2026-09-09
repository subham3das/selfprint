import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CreditCard,
  Printer,
  Clock,
  Store,
  User,
  CheckCircle2,
  Download,
  RotateCcw
} from 'lucide-react';
import { AdminTransactionItem } from '../types/transaction.types';
import { TransactionStatusBadge } from './TransactionStatusBadge';


interface TransactionViewModalProps {
  transaction: AdminTransactionItem | null;
  onClose: () => void;
  onRefund: (transaction: AdminTransactionItem) => void;
}

export const TransactionViewModal: React.FC<TransactionViewModalProps> = ({
  transaction,
  onClose,
  onRefund
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {transaction.txnId}
                </h3>
                <TransactionStatusBadge status={transaction.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Payment Gateway Ref: {transaction.paymentId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Key Amount Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Customer Paid
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {transaction.amountFormatted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Platform Commission (10%)
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {transaction.commissionFormatted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Payment Mode
              </span>
              <p className="text-sm font-bold text-indigo-700 mt-2">
                {transaction.paymentMethod}
              </p>
            </div>
          </div>

          {/* Parties Involved (Store & Customer) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Information */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Store / Kiosk</span>
              </h4>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full ${transaction.storeLogoBg} flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}
                >
                  {transaction.storeLogoText}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">
                    {transaction.storeName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {transaction.city}, {transaction.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Customer</span>
              </h4>
              <div className="flex items-center gap-2.5">
                <img
                  src={transaction.customerAvatar}
                  alt={transaction.customerName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div>
                  <p className="font-bold text-slate-900 text-xs">
                    {transaction.customerName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {transaction.customerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Details */}
          {transaction.printDetails && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Print Job Parameters</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    File Name
                  </span>
                  <span className="font-bold text-slate-900 truncate block mt-0.5">
                    {transaction.printDetails.fileName}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Total Pages
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {transaction.printDetails.totalPages} ({transaction.orderType})
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Paper Size
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">
                    {transaction.printDetails.paperSize} &bull; {transaction.printDetails.copies} Copy
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Hardware
                  </span>
                  <span className="font-bold text-slate-900 truncate block mt-0.5">
                    {transaction.printDetails.printerUsed}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Transaction & Print Pipeline</span>
            </h4>
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-800">Order Initiated</span>
                <span className="text-slate-400 font-mono text-[11px] ml-auto">
                  {transaction.date} &bull; {transaction.time}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-800">
                  Payment Verified via {transaction.paymentMethod}
                </span>
                <span className="text-slate-400 font-mono text-[11px] ml-auto">
                  Success
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-800">
                  Print Spool Dispatched to Kiosk Hardware
                </span>
                <span className="text-slate-400 font-mono text-[11px] ml-auto">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {transaction.status === 'Success' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRefund(transaction);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Issue Refund</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                alert(`Downloading Tax Invoice for ${transaction.txnId}`)
              }
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
