import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Printer,
  FileText,
  Store
} from 'lucide-react';
import { AdminUserItem } from '../types/user.types';
import { UserStatusBadge } from './UserStatusBadge';


interface UserProfileModalProps {
  user: AdminUserItem | null;
  onClose: () => void;
  onEdit: (user: AdminUserItem) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onEdit
}) => {
  if (!user) return null;

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
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {user.name}
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {user.userIdCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserStatusBadge status={user.status} />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Key Metric Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Total Spent
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {user.totalSpentFormatted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Total Orders
              </span>
              <p className="text-lg font-black text-indigo-600 mt-1">
                {user.totalOrders}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Pages Printed
              </span>
              <p className="text-lg font-black text-slate-900 mt-1">
                {user.pagesPrinted}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Plan
              </span>
              <div className="mt-1 flex justify-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user.membershipPlan}
                </span>
              </div>
            </div>
          </div>

          {/* Personal & Contact Details */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal & Contact Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {user.fullAddress}, {user.city}, {user.state}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {user.joinedOn}</span>
              </div>
            </div>
          </div>

          {/* Printing Habits & Favorite Store */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Print Breakdown</span>
              </h4>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Color Prints:</span>
                <span className="font-bold text-purple-600">
                  {user.colorPrintsCount} Pages
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Black & White:</span>
                <span className="font-bold text-slate-800">
                  {user.bwPrintsCount} Pages
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Primary Kiosk Station</span>
              </h4>
              <p className="text-xs font-bold text-slate-900">
                {user.favoriteStore}
              </p>
              <div className="mt-auto flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Customer</span>
              </div>
            </div>
          </div>

          {/* Recent Orders History */}
          {user.recentOrders && user.recentOrders.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Recent Print Orders</span>
              </h4>
              <div className="flex flex-col divide-y divide-slate-100">
                {user.recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {ord.fileName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {ord.pages} Pages &bull; {ord.colorMode} &bull; {ord.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {ord.amount}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
              onEdit(user);
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Edit User Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};
