import React, { useState, useEffect } from 'react';
import { X, Edit2, Shield } from 'lucide-react';
import {

  StaffMember,
  EditStaffFormValues,
  StaffRole,
  StaffStatus,
  StaffPermissions,
  SUPER_ADMIN_EMAIL
} from '../types/access.types';
import { PermissionMatrix } from './PermissionMatrix';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onSave: (values: EditStaffFormValues) => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Admin');
  const [department, setDepartment] = useState('Platform Operations');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [permissions, setPermissions] = useState<StaffPermissions>({} as StaffPermissions);

  useEffect(() => {
    if (staff) {
      setFullName(staff.fullName);
      setPhone(staff.phone);
      setRole(staff.role);
      setDepartment(staff.department);
      setStatus(staff.status);
      setPermissions(staff.permissions);
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const isSuperAdmin =
    staff.isSuperAdmin || staff.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin) {
      alert('Super Admin account is immutable and cannot be modified.');
      return;
    }

    onSave({
      id: staff.id,
      fullName,
      phone,
      role,
      department,
      status,
      permissions
    });
  };

  const departments = [
    'Platform Operations',
    'IT Infrastructure',
    'Security & Compliance',
    'Hardware Fleet',
    'Regional Operations',
    'Store Operations',
    'FinOps & Accounts',
    'Customer Support',
    'Platform Admin'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Edit Staff Member & Permissions
              </h2>
              <p className="text-xs text-slate-400">
                {staff.email} • ID: {staff.id}
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

        {/* Super Admin Protected Warning */}
        {isSuperAdmin && (
          <div className="m-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-purple-900 text-xs">
            <Shield className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="font-extrabold">Permanent Super Admin Account</p>
              <p className="text-purple-700 mt-0.5">
                This account is protected by system security rules and cannot be edited or modified.
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Name, Email (disabled), Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled={isSuperAdmin}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={staff.email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                disabled={isSuperAdmin}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Role, Department, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role
              </label>
              <select
                disabled={isSuperAdmin}
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {isSuperAdmin && <option value="Super Admin">Super Admin</option>}
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                disabled={isSuperAdmin}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                disabled={isSuperAdmin}
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Invitation">Pending Invitation</option>
              </select>
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Custom Module Permissions
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Update access rights for this staff account
              </span>
            </div>

            <PermissionMatrix
              permissions={permissions}
              onChange={setPermissions}
              readOnly={isSuperAdmin}
              role={role}
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          {!isSuperAdmin && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
