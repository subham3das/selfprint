import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/login.schema';
import { adminAuthService } from '../services/auth.service';

export const useAdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: ''
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminAuthService.login({ email: values.email });

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

  const handleClearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    handleClearError
  };
};
