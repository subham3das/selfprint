import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Building,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '@/lib/axios';

declare global {
  interface Window {
    google?: any;
  }
}


interface InvitationDetails {
  valid: boolean;
  name: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
}

export const AdminActivatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InvitationDetails | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // 1. Verify invitation token on load
  const verifyToken = useCallback(async () => {
    if (!token) {
      setErrorStatus(404);
      setErrorMessage('No invitation token was provided in the link.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);
      setErrorMessage(null);

      const res = await apiClient.get(`/admin/auth/verify-invitation/${token}`);
      if (res.data?.data) {
        setInviteDetails(res.data.data);
      } else {
        setInviteDetails(res.data);
      }
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const msg = err?.response?.data?.message || 'Unable to verify invitation link.';
      setErrorStatus(status);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // 2. Initialize Google Sign-In SDK
  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response.credential) {
        setErrorMessage('Google Sign-In was cancelled or failed to provide credentials.');
        return;
      }

      setIsActivating(true);
      setErrorMessage(null);

      try {
        const activateRes = await apiClient.post('/admin/auth/activate-google', {
          token,
          credential: response.credential
        });

        const data = activateRes.data;
        if (data.token) {
          localStorage.setItem('selfprint_admin_token', data.token);
          if (data.user) {
            const admin = data.user;
            const isSuper = admin.role === 'SUPER_ADMIN' || admin.email === 'das01subhamj@gmail.com';
            const displayName = admin.displayName || admin.name || 'Staff Member';
            const authUser = {
              id: admin.id || admin._id,
              name: admin.name || 'Staff',
              displayName,
              email: admin.email,
              role: admin.role,
              department: admin.department || (isSuper ? 'Executive Operations' : 'Platform Operations'),
              avatarBg: isSuper
                ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600'
                : 'bg-gradient-to-tr from-indigo-600 to-blue-600',
              avatarText: displayName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'ST',
              avatar: admin.avatar || '',
              permissions: admin.permissions || {},
              lastLogin: new Date().toISOString(),
              token: data.token
            };
            localStorage.setItem('selfprint_admin_user', JSON.stringify(authUser));
          }
        }


        setActivationSuccess(true);

        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true });
        }, 2000);
      } catch (err: any) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || 'Failed to complete Google account activation.';
        setErrorMessage(msg);
        if (status === 403) {
          setErrorStatus(403);
        }
      } finally {
        setIsActivating(false);
      }
    },
    [token, navigate]
  );

  useEffect(() => {
    if (!inviteDetails || activationSuccess || errorStatus) return;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '1022044993805-ttq61oaubkt448frstjejd5na2tcd4gf.apps.googleusercontent.com';

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('google-activate-btn');
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: 'filled_blue',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 340,
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.error('Google button render error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    }
  }, [inviteDetails, activationSuccess, errorStatus, handleGoogleCredentialResponse]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/40 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Self Print</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              Staff Portal
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise RBAC Security & Account Activation
          </p>
        </div>

        {/* State: 1. Loading */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">
              Verifying cryptographic invitation token...
            </p>
          </div>
        )}

        {/* State: 2. Success State */}
        {activationSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Account Activated Successfully!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your credentials and permissions are verified. Redirecting to your dashboard...
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Launching Admin Panel...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* State: 3. Error States (Expired, Invalid, Conflict, Mismatch) */}
        {!isLoading && !activationSuccess && errorStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 space-y-6"
          >
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              {errorStatus === 410 ? (
                <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : errorStatus === 409 ? (
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold text-white mb-1">
                  {errorStatus === 410
                    ? 'Invitation Link Expired'
                    : errorStatus === 409
                    ? 'Account Already Activated'
                    : errorStatus === 403
                    ? 'Google Account Mismatch'
                    : 'Invalid Invitation'}
                </p>
                <p className="text-rose-200/80 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            <div className="space-y-3">
              {errorStatus === 409 ? (
                <Link
                  to="/admin/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/25"
                >
                  <span>Proceed to Admin Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={verifyToken}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Verification</span>
                  </button>
                  <Link
                    to="/admin/login"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    <span>Return to Login</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* State: 4. Valid Invitation Ready for Google Activation */}
        {!isLoading && !activationSuccess && !errorStatus && inviteDetails && (
          <div className="space-y-6">
            {/* Staff Invitation Summary Box */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Invited Member
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20">
                  {inviteDetails.role}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-white">
                  {inviteDetails.name}
                </p>
                <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>{inviteDetails.email}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{inviteDetails.department}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Verified Invitation
                </span>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/30 text-[11px] text-indigo-200/90 leading-relaxed">
              <p>
                To complete account setup, please authenticate with the Google account associated with{' '}
                <strong className="text-white">{inviteDetails.email}</strong>.
              </p>
            </div>

            {/* Google Authentication Trigger Container */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-center min-h-[44px]">
                <div id="google-activate-btn" />
              </div>

              {isActivating && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 py-1">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                  <span>Completing account activation...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Self Print • Zero-Trust Security Protocol</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminActivatePage;
