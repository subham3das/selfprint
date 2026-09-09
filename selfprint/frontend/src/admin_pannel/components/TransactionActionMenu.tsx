import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  MoreVertical,
  Download,
  RotateCcw,
  Store,
  User,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminTransactionItem } from '../types/transaction.types';

interface TransactionActionMenuProps {
  transaction: AdminTransactionItem;
  onView: (transaction: AdminTransactionItem) => void;
  onRefund: (transaction: AdminTransactionItem) => void;
  onDelete: (id: string) => void;
}

export const TransactionActionMenu: React.FC<TransactionActionMenuProps> = ({
  transaction,
  onView,
  onRefund,
  onDelete
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDownloadInvoice = () => {
    alert(`Downloading Official Tax Invoice for ${transaction.txnId}...`);
  };

  return (
    <div className="relative flex items-center justify-end gap-1.5" ref={menuRef}>
      {/* 1. View Button */}
      <button
        type="button"
        onClick={() => onView(transaction)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
        title="View Transaction Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* 2. More Menu Button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer"
        title="More Options"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs divide-y divide-slate-100"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onView(transaction);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleDownloadInvoice();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download Invoice</span>
              </button>

              {transaction.status === 'Success' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRefund(transaction);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-amber-600 hover:bg-amber-50 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Refund Amount</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/admin/stores');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>View Store</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/admin/users');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>View Customer</span>
              </button>
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(transaction.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
