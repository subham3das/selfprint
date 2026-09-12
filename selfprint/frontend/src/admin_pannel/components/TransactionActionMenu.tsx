import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
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
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48 is 192px
    const menuHeight = 220;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 10 && rect.top > menuHeight;
    const top = openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setCoords({ top, left });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMenuOpen) {
      updatePosition();
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen]);

  const handleDownloadInvoice = () => {
    alert(`Downloading Official Tax Invoice for ${transaction.txnId}...`);
  };

  return (
    <div className="relative flex items-center justify-end gap-1.5">
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
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-95"
        title="More Options"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Floating Portal Menu */}
      {isMenuOpen &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 9999
            }}
            className="w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs divide-y divide-slate-100"
          >
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onView(transaction);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors cursor-pointer text-left"
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-amber-600 hover:bg-amber-50 font-medium transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors cursor-pointer text-left"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Record</span>
              </button>
            </div>
          </motion.div>,
          document.body
        )}
    </div>
  );
};

export default TransactionActionMenu;
