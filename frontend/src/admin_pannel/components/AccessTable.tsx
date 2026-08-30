import React from 'react';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { StaffMember } from '../types/access.types';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { PermissionSummary } from './PermissionSummary';
import { AccessActionMenu } from './AccessActionMenu';

interface AccessTableProps {
  staffList: StaffMember[];
  totalStaffCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDuplicate: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
  onResetPassword: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
}

export const AccessTable: React.FC<AccessTableProps> = ({
  staffList,
  totalStaffCount,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onResetPassword,
  onDelete
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalStaffCount);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500">
              <th className="py-3.5 pl-4 sm:pl-5 pr-3 min-w-[200px]">Staff Member</th>
              <th className="py-3.5 px-3 min-w-[180px]">Email Address</th>
              <th className="py-3.5 px-3 min-w-[130px]">Role</th>
              <th className="py-3.5 px-3 min-w-[140px] hidden md:table-cell">Department</th>
              <th className="py-3.5 px-3 min-w-[110px]">Status</th>
              <th className="py-3.5 px-3 min-w-[110px] hidden lg:table-cell">Last Login</th>
              <th className="py-3.5 px-3 min-w-[110px] hidden xl:table-cell">Created By</th>
              <th className="py-3.5 px-3 min-w-[140px]">Permissions</th>
              <th className="py-3.5 pr-4 sm:pr-5 pl-2 text-right min-w-[60px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No staff accounts found</p>
                  <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr
                  key={staff.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    staff.isSuperAdmin ? 'bg-purple-50/20' : ''
                  }`}
                >
                  {/* Avatar & Name */}
                  <td className="py-3 pl-4 sm:pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl ${staff.avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {staff.avatarText}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                          {staff.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {staff.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 group max-w-[200px]">
                      <span className="font-mono text-slate-800 text-xs truncate">
                        {staff.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(staff.email)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity p-0.5"
                        title="Copy email"
                      >
                        {copiedEmail === staff.email ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-3">
                    <RoleBadge role={staff.role} />
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="text-slate-600 text-xs truncate block max-w-[130px]">
                      {staff.department}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <StatusBadge status={staff.status} />
                  </td>

                  {/* Last Login */}
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {staff.lastLogin}
                    </span>
                  </td>

                  {/* Created By */}
                  <td className="py-3 px-3 hidden xl:table-cell">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {staff.createdBy}
                    </span>
                  </td>

                  {/* Permissions Summary */}
                  <td className="py-3 px-3">
                    <PermissionSummary
                      permissions={staff.permissions}
                      isSuperAdmin={staff.isSuperAdmin}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-3 pr-4 sm:pr-5 pl-2 text-right">
                    <AccessActionMenu
                      staff={staff}
                      onView={onView}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onToggleStatus={onToggleStatus}
                      onResetPassword={onResetPassword}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{totalStaffCount > 0 ? startIdx : 0}</strong> to{' '}
            <strong className="text-slate-800">{endIdx}</strong> of{' '}
            <strong className="text-slate-800">{totalStaffCount}</strong> staff
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2.5 font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
