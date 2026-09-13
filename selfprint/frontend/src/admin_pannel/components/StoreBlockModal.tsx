import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ban,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AdminStoreItem } from '../types/store.types';

interface StoreBlockModalProps {
  store: AdminStoreItem;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirmBlock: (storeId: string, reason: string) => void;
}

const PRESET_REASONS = [
  'Fraudulent activity',
  'Violation of platform terms',
  'Non-payment / Unsettled dues',
  'Hardware safety / abuse concern',
  'Suspicious login activity'
];

export const StoreBlockModal: React.FC<StoreBlockModalProps> = ({
  store,
  isOpen,
  isLoading = false,
  onClose,
  onConfirmBlock
}) => {
  const [reason, setReason] = useState('Fraudulent activity');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim() && !isLoading) {
      onConfirmBlock(store.id, reason.trim());
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
              <Ban className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Block Store Access</h2>
              <p className="text-xs font-semibold text-rose-600">
                {store.name} ({store.storeIdCode})
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
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Immediate Platform Enforcement:</span>
            </div>
            <ul className="text-[11px] text-rose-800 flex flex-col gap-1 list-disc pl-4 font-medium">
              <li>Immediately invalidates every active JWT session for this store.</li>
              <li>Disconnects all active WebSocket channels and hardware bridges.</li>
              <li>Rejects subsequent login attempts with HTTP 403 (STORE_BLOCKED).</li>
              <li>Stops desktop connector heartbeats and locks printing kiosks.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700">Select or Enter Reason for Blocking:</label>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    reason === preset
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed administrative reason..."
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
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
              disabled={!reason.trim() || isLoading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-rose-600/30 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enforcing Block...</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Block Store Access</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StoreBlockModal;
