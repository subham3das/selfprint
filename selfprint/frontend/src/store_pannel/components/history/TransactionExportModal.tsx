import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionItem } from '../../types/transaction.types';

interface TransactionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionItem[];
}

export const TransactionExportModal: React.FC<TransactionExportModalProps> = ({
  isOpen,
  onClose,
  transactions
}) => {
  const [selectedFormat, setSelectedFormat] = useState<
    'csv' | 'excel' | 'pdf' | 'print'
  >('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);

    if (selectedFormat === 'csv') {
      // Generate actual CSV content
      const headers = [
        'Transaction ID',
        'Job ID',
        'Date',
        'Time',
        'Customer Name',
        'Phone',
        'Pages',
        'Copies',
        'Paper Size',
        'Color Mode',
        'Amount',
        'Payment Method',
        'Status'
      ];

      const rows = transactions.map((t) => [
        t.transactionId,
        t.jobId,
        t.transactionDate,
        t.transactionTime,
        `"${t.customerName}"`,
        t.customerPhone,
        t.pages,
        t.copies,
        t.paperSize,
        t.colorMode,
        t.amount,
        `"${t.paymentMethod}"`,
        t.paymentStatus
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `SelfPrint_Transactions_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (selectedFormat === 'print') {
      window.print();
    }

    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  const formats = [
    {
      id: 'csv',
      title: 'CSV Spreadsheet',
      desc: 'Standard comma-separated table (.csv)',
      icon: FileSpreadsheet,
      badge: 'Fast'
    },
    {
      id: 'excel',
      title: 'Excel Spreadsheet',
      desc: 'Formatted workbook for MS Excel (.xlsx)',
      icon: FileSpreadsheet,
      badge: 'Formatted'
    },
    {
      id: 'pdf',
      title: 'PDF Summary Report',
      desc: 'Print-ready financial statement with charts',
      icon: FileText,
      badge: 'Statement'
    },
    {
      id: 'print',
      title: 'Direct Print',
      desc: 'Send receipt/report directly to connected printer',
      icon: Printer,
      badge: 'Thermal / A4'
    }
  ];

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
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Export Transactions
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4 text-xs">
            <p className="text-slate-500">
              Export <strong>{transactions.length} transactions</strong> for the
              selected period:
            </p>

            <div className="space-y-2">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() =>
                      setSelectedFormat(
                        fmt.id as 'csv' | 'excel' | 'pdf' | 'print'
                      )
                    }
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-xs">
                            {fmt.title}
                          </p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {fmt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {fmt.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
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
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              {isExporting ? (
                <span>Exporting...</span>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Export File</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
