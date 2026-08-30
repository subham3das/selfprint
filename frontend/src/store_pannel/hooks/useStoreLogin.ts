import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  storeLoginSchema,
  StoreLoginFormValues
} from '../schemas/storeLogin.schema';
import { storeAuthService } from '../services/storeAuth.service';

export const useStoreLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<StoreLoginFormValues>({
    resolver: zodResolver(storeLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: StoreLoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await storeAuthService.login({
        email: values.email,
        password: values.password
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/store/dashboard');
        }, 500);
      } else {
        setErrorMessage(
          response.message ||
            'The email or password you entered is incorrect. Please try again.'
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

  const handleQuickFill = (email: string, pass: string) => {
    form.setValue('email', email, { shouldValidate: true });
    form.setValue('password', pass, { shouldValidate: true });
    handleClearError();
  };

  return {
    form,
    isLoading,
    errorMessage,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    handleClearError,
    handleQuickFill
  };
};
