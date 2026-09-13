import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { AdminStoreItem } from '../types/store.types';

interface StoreDeleteModalProps {
  store: AdminStoreItem;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmDelete: (storeId: string) => void;
}

export const StoreDeleteModal: React.FC<StoreDeleteModalProps> = ({
  store,
  isOpen,
  isLoading = false,
  onClose,
  onConfirmDelete
}) => {
  const [typedName, setTypedName] = useState('');

  if (!isOpen) return null;

  const targetName = (store.name || '').trim();
  const isMatch = typedName.trim() === targetName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch && !isLoading) {
      onConfirmDelete(store.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Delete Store</h2>
              <p className="text-xs font-semibold text-rose-600">
                Permanent & Irreversible Action
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-950 text-xs flex flex-col gap-2">
            <p className="font-bold text-rose-900 leading-relaxed">
              This action permanently deletes the store and cannot be undone.
            </p>
            <ul className="text-[11px] text-rose-800 flex flex-col gap-1.5 list-disc pl-4 mt-1 font-medium">
              <li>Permanently deletes the store profile and merchant relations.</li>
              <li>Unpairs all hardware connectors and revokes device tokens.</li>
              <li>Instantly terminates all active JWT sessions and WebSockets.</li>
              <li>Removes printer configs, pricing, bank accounts, and QR standees.</li>
              <li>
                <span className="font-bold">Audit Preservation:</span> Historical orders and transaction receipts will be preserved for financial compliance under <code className="bg-rose-100 px-1 py-0.5 rounded text-[10px] font-mono">deletedStoreId</code>.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <label className="text-xs font-bold text-slate-700">
              Please type <span className="text-rose-600 font-extrabold select-all">"{targetName}"</span> to confirm deletion:
            </label>
            <input
              type="text"
              autoFocus
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={`Type "${targetName}"`}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isMatch && !isLoading
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deleting Permanently...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Store Permanently</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StoreDeleteModal;
