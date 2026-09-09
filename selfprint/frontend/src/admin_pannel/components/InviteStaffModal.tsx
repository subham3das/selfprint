import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Key, AlertCircle } from 'lucide-react';
import {
  InviteStaffFormValues,
  StaffRole,
  StaffPermissions,
  createRolePermissions
} from '../types/access.types';
import { PermissionMatrix } from './PermissionMatrix';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (values: InviteStaffFormValues) => void;
  initialRole?: StaffRole;
  initialPermissions?: StaffPermissions;
  serverErrors?: Record<string, string>;
  isSubmitting?: boolean;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  initialRole = 'Admin',
  initialPermissions,
  serverErrors = {},
  isSubmitting = false
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>(initialRole);
  const [department, setDepartment] = useState('Platform Operations');
  const [sendEmailInvite, setSendEmailInvite] = useState(true);
  const [generateTempPassword, setGenerateTempPassword] = useState(true);
  const [permissions, setPermissions] = useState<StaffPermissions>(
    initialPermissions || createRolePermissions(initialRole)
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    setPermissions(createRolePermissions(newRole));
    if (clientErrors.role) {
      setClientErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!email.includes('@') || !email.includes('.')) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!role) {
      errs.role = 'Role is required.';
    }
    if (!department.trim()) {
      errs.department = 'Department is required.';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    onInvite({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '+91 98765 00000',
      role,
      department,
      sendEmailInvite,
      generateTempPassword,
      permissions
    });
  };

  const activeErrors = { ...clientErrors, ...serverErrors };

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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invite Staff Member
              </h2>
              <p className="text-xs text-slate-400">
                Create new administrator or operational staff account and set permissions.
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Name, Email, Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (clientErrors.fullName) setClientErrors((p) => ({ ...p, fullName: '' }));
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full bg-slate-50 border ${
                  activeErrors.fullName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
                } rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {activeErrors.fullName && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{activeErrors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) setClientErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="rahul.s@selfprint.com"
                className={`w-full bg-slate-50 border ${
                  activeErrors.email ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
                } rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              {activeErrors.email && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{activeErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {activeErrors.phone && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{activeErrors.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Role & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="Admin">Admin (High privileges)</option>
                <option value="Manager">Manager (Regional/Store ops)</option>
                <option value="Finance">Finance (Revenue & accounts)</option>
                <option value="Operations">Operations (Fleet & hardware)</option>
                <option value="Support">Support (Helpdesk & tickets)</option>
              </select>
              {activeErrors.role && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{activeErrors.role}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (clientErrors.department) setClientErrors((p) => ({ ...p, department: '' }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {activeErrors.department && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{activeErrors.department}</span>
                </p>
              )}
            </div>
          </div>

          {/* Security & Invite Options */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={sendEmailInvite}
                onChange={(e) => setSendEmailInvite(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              >
              </input>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Send Invitation Email
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={generateTempPassword}
                onChange={(e) => setGenerateTempPassword(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              >
              </input>
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                Generate Secure Temporary Password
              </span>
            </label>
          </div>

          {/* Permission Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                Custom Module Permissions
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                Adjust granular access per resource
              </span>
            </div>

            <PermissionMatrix
              permissions={permissions}
              onChange={setPermissions}
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Sending Invitation...' : 'Send Invitation & Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteStaffModal;
