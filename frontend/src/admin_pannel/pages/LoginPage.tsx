import React from 'react';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { LoginCard } from '../components/LoginCard';
import { SUPER_ADMIN_EMAIL } from '../data/access.mock';

export const AdminLoginPage: React.FC = () => {
  const {
    form,
    isLoading,
    errorMessage,
    isSuccess,
    onSubmit,
    handleClearError
  } = useAdminLogin();

  const handleQuickFill = (email: string) => {
    form.setValue('email', email, { shouldValidate: true });
    handleClearError();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-100/40 via-indigo-50/20 to-transparent pointer-events-none blur-3xl -z-10" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Placeholder / Empty for vertical balance */}
      <div className="w-full max-w-md flex items-center justify-between opacity-0 pointer-events-none">
        <span>Admin Login</span>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full flex flex-col items-center justify-center my-auto">
        <LoginCard
          form={form}
          isLoading={isLoading}
          isSuccess={isSuccess}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onInputChange={handleClearError}
        />

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center max-w-md animate-in fade-in duration-500">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Test Accounts
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill(SUPER_ADMIN_EMAIL)}
              className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-[11px] font-bold text-purple-700 shadow-2xs transition-all cursor-pointer"
            >
              👑 Super Admin ({SUPER_ADMIN_EMAIL})
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ananya.sharma@selfprint.com')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              🛡️ Admin (ananya.sharma@selfprint.com)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('unauthorized.guest@gmail.com')}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg text-[11px] font-bold text-rose-600 shadow-2xs transition-all cursor-pointer"
            >
              🚫 Test Unauthorized
            </button>
          </div>
        </div>
      </div>

      {/* Modern SaaS Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 font-medium space-y-1">
        <p>
          <strong className="text-slate-600 font-semibold">Self Print</strong> • Enterprise Administrator Portal
        </p>
        <p className="text-[11px] text-slate-400">
          Version 1.0 • © {new Date().getFullYear()} All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
