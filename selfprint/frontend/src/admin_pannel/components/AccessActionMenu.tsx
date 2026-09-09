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
  ShieldCheck,
  Send,
  Link2,
  XCircle
} from 'lucide-react';
import { StaffMember, SUPER_ADMIN_EMAIL } from '../types/access.types';
import { usePermission } from '../context/PermissionContext';

interface AccessActionMenuProps {
  staff: StaffMember;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDuplicate: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
  onResetPassword: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onResendInvite?: (staff: StaffMember) => void;
  onCopyInviteLink?: (staff: StaffMember) => void;
  onCancelInvite?: (staff: StaffMember) => void;
}

export const AccessActionMenu: React.FC<AccessActionMenuProps> = ({
  staff,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onResetPassword,
  onDelete,
  onResendInvite,
  onCopyInviteLink,
  onCancelInvite
}) => {
  const { can } = usePermission();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin =
    staff.isSuperAdmin || staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const isPending = staff.status === 'Pending Invitation' || !staff.isActivated;
  const canEdit = can('access', 'edit');
  const canDelete = can('access', 'delete');
  const canCreate = can('access', 'create');

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

          {/* Pending Invitation Actions */}
          {isPending && !isSuperAdmin && (
            <div className="py-1 bg-amber-50/50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                Pending Activation
              </div>

              {onResendInvite && canCreate && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onResendInvite(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer text-left"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Resend Invitation</span>
                </button>
              )}

              {onCopyInviteLink && staff.inviteToken && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onCopyInviteLink(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Invitation Link</span>
                </button>
              )}

              {onCancelInvite && canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onCancelInvite(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Cancel Invitation</span>
                </button>
              )}
            </div>
          )}

          {/* Safe View & Edit Actions */}
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
              <span>View Profile & Matrix</span>
            </button>

            {!isSuperAdmin && canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onEdit(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit Permissions</span>
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

                {!isPending && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onResetPassword(staff);
                    }}
                    className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Reset Password</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Status Actions */}
          {!isSuperAdmin && !isPending && (canEdit || canDelete) && (
            <div className="py-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onToggleStatus(staff);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2 transition-colors cursor-pointer text-left ${
                    staff.status === 'Active'
                      ? 'text-amber-600 hover:bg-amber-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
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
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onDelete(staff);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delete Staff Account</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessActionMenu;
