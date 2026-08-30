import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { AdminTransactionItem, PaymentMethod } from '../types/transaction.types';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { TransactionActionMenu } from './TransactionActionMenu';

interface TransactionsTableProps {
  transactions: AdminTransactionItem[];
  onViewTransaction: (txn: AdminTransactionItem) => void;
  onRefundTransaction: (txn: AdminTransactionItem) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onViewTransaction,
  onRefundTransaction,
  onDeleteTransaction
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const renderPaymentMethod = (method: PaymentMethod) => {
    switch (method) {
      case 'UPI':
        return (
          <div className="inline-flex items-center gap-1 font-black text-slate-800 tracking-wider text-[11px]">
            <span className="text-emerald-600 font-extrabold italic">UPI</span>
          </div>
        );
      case 'PhonePe':
        return (
          <div className="inline-flex items-center gap-1 font-bold text-purple-700 text-[11px]">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
              पे
            </span>
            <span>PhonePe</span>
          </div>
        );
      case 'Google Pay':
        return (
          <div className="inline-flex items-center gap-1 font-bold text-slate-800 text-[11px]">
            <span className="text-blue-600 font-extrabold">G</span>
            <span>Pay</span>
          </div>
        );
      case 'Paytm':
        return (
          <div className="inline-flex items-center gap-1 font-extrabold text-[#00b9f5] text-[11px]">
            <span>paytm</span>
          </div>
        );
      case 'Razorpay':
        return (
          <div className="inline-flex items-center gap-1 font-bold text-blue-700 text-[11px]">
            <span>Razorpay</span>
          </div>
        );
      case 'Cash':
        return (
          <div className="inline-flex items-center gap-1 font-bold text-slate-600 text-[11px]">
            <span>💵 Cash</span>
          </div>
        );
      default:
        return <span className="text-slate-600 text-xs">{method}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400">
              <th className="py-3.5 pl-5 pr-3">Transaction ID</th>
              <th className="py-3.5 px-3">Store</th>
              <th className="py-3.5 px-3">Customer</th>
              <th className="py-3.5 px-3 text-center">Order Type</th>
              <th className="py-3.5 px-3 text-center">Pages</th>
              <th className="py-3.5 px-3 text-right">Amount</th>
              <th className="py-3.5 px-3 text-right">Commission</th>
              <th className="py-3.5 px-3 text-center">Payment Method</th>
              <th className="py-3.5 px-3 text-center">Status</th>
              <th className="py-3.5 px-3 text-center">Date & Time</th>
              <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-slate-400 font-medium"
                >
                  No transactions match the selected filters or search query.
                </td>
              </tr>
            ) : (
              transactions.map((txn, idx) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.015 }}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 1. Transaction ID with copy button */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                      <span>{txn.txnId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(txn.id, txn.txnId)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Copy Transaction ID"
                      >
                        {copiedId === txn.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 2. Store */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${txn.storeLogoBg} flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs`}
                      >
                        {txn.storeLogoText}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">
                          {txn.storeName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {txn.city}, {txn.state}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 3. Customer */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={txn.customerAvatar}
                        alt={txn.customerName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                          {txn.customerName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                          {txn.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 4. Order Type */}
                  <td className="py-3.5 px-3 text-center">
                    {txn.orderType === 'Color Print' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        Color Print
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                        B&W Print
                      </span>
                    )}
                  </td>

                  {/* 5. Pages */}
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-800 text-xs">
                    {txn.pages}
                  </td>

                  {/* 6. Amount */}
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 text-xs">
                    {txn.amountFormatted}
                  </td>

                  {/* 7. Commission */}
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700 text-xs">
                    {txn.commissionFormatted}
                  </td>

                  {/* 8. Payment Method */}
                  <td className="py-3.5 px-3 text-center">
                    {renderPaymentMethod(txn.paymentMethod)}
                  </td>

                  {/* 9. Status */}
                  <td className="py-3.5 px-3 text-center">
                    <TransactionStatusBadge status={txn.status} />
                  </td>

                  {/* 10. Date & Time */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <p className="font-medium text-slate-800 text-xs">
                      {txn.date}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {txn.time}
                    </p>
                  </td>

                  {/* 11. Actions */}
                  <td className="py-3.5 pr-5 pl-3 text-right">
                    <TransactionActionMenu
                      transaction={txn}
                      onView={onViewTransaction}
                      onRefund={onRefundTransaction}
                      onDelete={onDeleteTransaction}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
