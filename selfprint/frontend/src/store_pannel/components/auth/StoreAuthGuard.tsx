import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { storeAuthService } from '../../services/storeAuth.service';
import { Loader2 } from 'lucide-react';

export const StoreAuthGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<'CHECKING' | 'AUTHENTICATED' | 'REDIRECT_LOGIN'>('CHECKING');
  const location = useLocation();

  useEffect(() => {
    const token = storeAuthService.getStoredToken();

    if (!token) {
      // Unauthenticated access to protected store route -> Redirect directly to Store Login
      setAuthState('REDIRECT_LOGIN');
      return;
    }

    // Basic JWT expiration inspection
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired
          storeAuthService.logout();
          setAuthState('REDIRECT_LOGIN');
          return;
        }
      }
    } catch {
      // Invalid JWT format
      storeAuthService.logout();
      setAuthState('REDIRECT_LOGIN');
      return;
    }

    setAuthState('AUTHENTICATED');
  }, [location.pathname]);

  if (authState === 'CHECKING') {
    // Clean loading state: Do NOT render dashboard, printer cards, or default values
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Verifying Store Session...
          </span>
        </div>
      </div>
    );
  }

  if (authState === 'REDIRECT_LOGIN') {
    return <Navigate to="/store/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default StoreAuthGuard;
