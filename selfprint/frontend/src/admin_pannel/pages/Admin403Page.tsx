import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Mail, LogOut } from 'lucide-react';
import { usePermission } from '../context/PermissionContext';
import { adminAuthService } from '../services/auth.service';

export const Admin403Page: React.FC = () => {
  const navigate = useNavigate();
  const { role, department } = usePermission();

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-purple-100/50 via-indigo-50/30 to-transparent pointer-events-none blur-3xl -z-10" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative z-10">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* 403 Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest bg-purple-50 text-purple-700 border border-purple-200/60 uppercase mb-3">
          Error 403 • Forbidden
        </span>

        {/* Heading */}
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Access Restricted
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          You don't have permission to access this module. Your current administrator permissions restrict viewing or managing this section.
        </p>

        {/* Role & Department Info Pill */}
        <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600 mb-6 font-medium">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Role</span>
            <span className="font-bold text-slate-800">{role || 'Staff Member'}</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Department</span>
            <span className="font-bold text-slate-800">{department || 'Platform Operations'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <a
            href="mailto:das01subhamj@gmail.com?subject=Permission%20Access%20Request%20-%20Self%20Print%20Admin"
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            Contact Super Admin
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-9 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign in with a different account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
        <p>Self Print Enterprise Security • Role-Based Access Control</p>
      </footer>
    </div>
  );
};

export default Admin403Page;
