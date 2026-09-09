import React from 'react';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { LoginCard } from '../components/LoginCard';

export const AdminLoginPage: React.FC = () => {
  const {
    form,
    isLoading,
    isGoogleLoading,
    errorMessage,
    isSuccess,
    onSubmit,
    handleGoogleLogin,
    handleClearError
  } = useAdminLogin();

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
          isGoogleLoading={isGoogleLoading}
          isSuccess={isSuccess}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onGoogleLogin={handleGoogleLogin}
          onInputChange={handleClearError}
        />
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
