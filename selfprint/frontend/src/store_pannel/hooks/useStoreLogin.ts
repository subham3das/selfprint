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
      await storeAuthService.login(values.email, values.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/store/dashboard');
      }, 400);
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Authentication failed. Please verify your credentials.';
      setErrorMessage(serverMessage);
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

export default useStoreLogin;
