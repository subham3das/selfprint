import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Pencil,
  MoreVertical,
  QrCode,
  PowerOff,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { AdminStoreItem } from '../types/store.types';
import { usePermission } from '../context/PermissionContext';

interface StoreActionMenuProps {
  store: AdminStoreItem;
  onView: (store: AdminStoreItem) => void;
  onEdit: (store: AdminStoreItem) => void;
  onToggleStatus: (id: string, newStatus: AdminStoreItem['status']) => void;
  onDelete: (id: string) => void;
  onGenerateQr?: (store: AdminStoreItem) => void;
}

export const StoreActionMenu: React.FC<StoreActionMenuProps> = ({
  store,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onGenerateQr
}) => {
  const { can } = usePermission();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  const isSuspended = store.status === 'Suspended';
  const canEdit = can('stores', 'edit');
  const canApprove = can('stores', 'approve');
  const canDelete = can('stores', 'delete');

  return (
    <div className="relative flex items-center justify-end gap-1.5" ref={menuRef}>
      {/* 1. View Button (Always visible if page is accessible) */}
      <button
        type="button"
        onClick={() => onView(store)}
        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
        title="View Store Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* 2. Edit Button (Protected) */}
      {canEdit && (
        <button
          type="button"
          onClick={() => onEdit(store)}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 flex items-center justify-center transition-all cursor-pointer"
          title="Edit Store"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 3. More Menu Button */}
      {(canApprove || canDelete || canEdit) && (
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center transition-all cursor-pointer"
          title="More Actions"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      )}

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
                  onView(store);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Details</span>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(store);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Store</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onGenerateQr) {
                    onGenerateQr(store);
                  } else {
                    onView(store);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Generate QR</span>
              </button>
            </div>

            {(canApprove || canDelete) && (
              <div className="py-1">
                {canApprove && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleStatus(
                        store.id,
                        isSuspended ? 'Online' : 'Suspended'
                      );
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 font-medium transition-colors ${
                      isSuspended
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    {isSuspended ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Activate Store</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>Suspend Store</span>
                      </>
                    )}
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(store.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Store</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
