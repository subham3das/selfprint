import React from 'react';
import { X, Shield, Calendar, Phone, Building, UserCheck } from 'lucide-react';
import { StaffMember } from '../types/access.types';

import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { PermissionMatrix } from './PermissionMatrix';

interface ViewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onEditClick: (staff: StaffMember) => void;
}

export const ViewStaffModal: React.FC<ViewStaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEditClick
}) => {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${staff.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-md`}
            >
              {staff.avatarText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {staff.fullName}
                </h2>
                <RoleBadge role={staff.role} />
                <StatusBadge status={staff.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {staff.email} • Member ID: {staff.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Building className="w-3.5 h-3.5" />
                <span>Department</span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {staff.department}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Phone className="w-3.5 h-3.5" />
                <span>Contact</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800 truncate">
                {staff.phone}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last Login</span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {staff.lastLogin}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Created By</span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {staff.createdBy}
              </p>
            </div>
          </div>

          {/* Granular Permission Matrix (Read-only) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Assigned Platform Permissions (Matrix)
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Active permissions for this account
              </span>
            </div>

            <PermissionMatrix
              permissions={staff.permissions}
              readOnly={true}
              role={staff.role}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Account created on <span className="font-semibold text-slate-600">{staff.createdAt}</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            {!staff.isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditClick(staff);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Edit Permissions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
