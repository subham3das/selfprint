import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  UserX,
  UserCheck,
  KeyRound,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { StaffMember } from '../types/access.types';
import { SUPER_ADMIN_EMAIL } from '../data/access.mock';

interface AccessActionMenuProps {
  staff: StaffMember;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDuplicate: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
  onResetPassword: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
}

export const AccessActionMenu: React.FC<AccessActionMenuProps> = ({
  staff,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onResetPassword,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin =
    staff.isSuperAdmin || staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          {/* Super Admin Protected Account Header */}
          {isSuperAdmin && (
            <div className="px-3 py-2 bg-purple-50/70 text-purple-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-black tracking-wide">PERMANENT ROOT</p>
                <p className="text-[9px] text-purple-600 font-medium">Protected Account</p>
              </div>
            </div>
          )}

          {/* Safe Actions */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onView(staff);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Permissions</span>
            </button>

            {!isSuperAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onEdit(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Staff & Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDuplicate(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate Permissions</span>
                </button>
              </>
            )}
          </div>

          {/* Sensitive & Dangerous Actions (Completely hidden for Super Admin) */}
          {!isSuperAdmin && (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onResetPassword(staff);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onToggleStatus(staff);
                }}
                className={`w-full px-3 py-1.5 flex items-center gap-2 transition-colors cursor-pointer text-left ${
                  staff.status === 'Active'
                    ? 'text-amber-700 hover:bg-amber-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {staff.status === 'Active' ? (
                  <>
                    <UserX className="w-3.5 h-3.5 text-amber-500" />
                    <span>Suspend Account</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Activate Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onDelete(staff);
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete Account</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
