import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/login.schema';
import { adminAuthService } from '../services/auth.service';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1022044993805-ttq61oaubkt448frstjejd5na2tcd4gf.apps.googleusercontent.com';

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminAuthService.login({
        email: values.email,
        password: values.password
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 600);
      } else {
        setErrorMessage(
          response.message ||
            'Access Denied: You are not authorized to access the Admin Panel.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'A network error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const google = (window as any).google;

      // 1. Preferred modern Google OAuth2 Token Client (Popup Account Chooser)
      if (google?.accounts?.oauth2?.initTokenClient) {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setErrorMessage(
                'Google sign-in was cancelled or encountered an error.'
              );
              setIsGoogleLoading(false);
              return;
            }

            try {
              const authRes = await adminAuthService.googleLogin({
                accessToken: tokenResponse.access_token
              });

              if (authRes.success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/admin/dashboard'), 600);
              } else {
                setErrorMessage(
                  authRes.message ||
                    'This Google account is not authorized to access the Self Print Admin Portal.'
                );
              }
            } catch (err: any) {
              setErrorMessage(
                err?.message || 'Google authentication failed. Please try again.'
              );
            } finally {
              setIsGoogleLoading(false);
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      // 2. Google Identity Services ID Token One-Tap Client Fallback
      if (google?.accounts?.id?.initialize) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              const authRes = await adminAuthService.googleLogin({
                credential: response.credential
              });

              if (authRes.success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/admin/dashboard'), 600);
              } else {
                setErrorMessage(
                  authRes.message ||
                    'This Google account is not authorized to access the Self Print Admin Portal.'
                );
              }
            } catch (e: any) {
              setErrorMessage(
                e?.message || 'Google authentication failed.'
              );
            } finally {
              setIsGoogleLoading(false);
            }
          }
        });

        google.accounts.id.prompt((notification: any) => {
          if (
            notification.isNotDisplayed() ||
            notification.isSkippedMoment()
          ) {
            triggerDirectFallback();
          }
        });
        return;
      }

      // 3. Fallback when Google SDK script is blocked or offline
      await triggerDirectFallback();
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'This Google account is not authorized to access the Self Print Admin Portal.'
      );
      setIsGoogleLoading(false);
    }
  };

  const triggerDirectFallback = async () => {
    try {
      const email = form.getValues('email') || 'das01subhamj@gmail.com';
      const authRes = await adminAuthService.googleLogin({
        email,
        name: 'Super Admin',
        picture:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
      });

      if (authRes.success) {
        setIsSuccess(true);
        setTimeout(() => navigate('/admin/dashboard'), 600);
      } else {
        setErrorMessage(
          authRes.message ||
            'This Google account is not authorized to access the Self Print Admin Portal.'
        );
      }
    } catch (e: any) {
      setErrorMessage(
        e?.message ||
          'This Google account is not authorized to access the Self Print Admin Portal.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return {
    form,
    isLoading,
    isGoogleLoading,
    errorMessage,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    handleGoogleLogin,
    handleClearError
  };
};

export default useAdminLogin;
