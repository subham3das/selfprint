import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Printer,
  CheckCircle2
} from 'lucide-react';
import { AdminStoreItem } from '../types/store.types';
import { StoreStatusBadge } from './StoreStatusBadge';
import { StorePlanBadge } from './StorePlanBadge';


interface StoreViewModalProps {
  store: AdminStoreItem | null;
  onClose: () => void;
  onEdit: (store: AdminStoreItem) => void;
}

export const StoreViewModal: React.FC<StoreViewModalProps> = ({
  store,
  onClose,
  onEdit
}) => {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl ${store.logoBgColor} flex items-center justify-center font-black text-sm shadow-md`}
            >
              {store.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {store.name}
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {store.storeIdCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {store.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StoreStatusBadge status={store.status} />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Total Revenue
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {store.revenueFormatted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Commission
              </span>
              <p className="text-lg font-black text-indigo-600 mt-1">
                {store.commissionFormatted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Orders
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {store.ordersCount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Plan
              </span>
              <div className="mt-1 flex justify-center">
                <StorePlanBadge plan={store.plan} />
              </div>
            </div>
          </div>

          {/* Owner & Contact Information */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Owner & Contact Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{store.ownerName}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{store.ownerPhone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{store.ownerEmail || store.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {store.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Location & Hardware */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Store Location</span>
              </h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {store.fullAddress}
              </p>
              <div className="mt-auto pt-2 text-[11px] text-slate-400 font-semibold">
                PIN: {store.pincode || '781001'} &bull; {store.city}, {store.state}
              </div>
            </div>

            {/* Hardware & Standee */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Kiosk Hardware & QR</span>
              </h4>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Connected Printers:</span>
                <span className="font-bold text-slate-800">
                  {store.printerCount} Units Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">QR Standee:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready & Deployed</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(store);
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Edit Store Details
          </button>
        </div>
      </motion.div>
    </div>
  );
};
