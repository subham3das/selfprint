import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OnboardingStep,
  StoreDetailsFormValues,
  BankDetailsFormValues,
  StoreRegistrationResponse
} from '../types/storeOnboarding.types';
import { storeOnboardingService } from '../services/storeOnboarding.service';

const DEFAULT_STORE_DETAILS: StoreDetailsFormValues = {
  storeName: '',
  ownerName: '',
  storeAddress: '',
  country: 'India',
  state: 'Assam',
  city: '',
  pinCode: '',
  phone: '',
  alternatePhone: '',
  email: '',
  gstNumber: '',
  storeImage: '',
  password: '',
  confirmPassword: ''
};

const DEFAULT_BANK_DETAILS: BankDetailsFormValues = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  branchName: '',
  upiId: '',
  chequeImage: '',
  passbookImage: ''
};

const STORE_FIELD_KEYS = [
  'storeName',
  'ownerName',
  'storeAddress',
  'country',
  'state',
  'city',
  'pinCode',
  'pincode',
  'phone',
  'alternatePhone',
  'email',
  'gstNumber',
  'gstin',
  'storeImage',
  'password',
  'confirmPassword'
];

export const useStoreOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [storeDetails, setStoreDetails] = useState<StoreDetailsFormValues>(DEFAULT_STORE_DETAILS);
  const [bankDetails, setBankDetails] = useState<BankDetailsFormValues>(DEFAULT_BANK_DETAILS);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [registrationResult, setRegistrationResult] = useState<StoreRegistrationResponse | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Countdown timer on success page -> redirect directly to /store/dashboard
  useEffect(() => {
    if (currentStep !== 'success') return;

    if (countdown <= 0) {
      navigate('/store/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep, countdown, navigate]);

  const goToStep = (step: OnboardingStep) => {
    setErrorMessage(null);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStoreDetails = (values: StoreDetailsFormValues) => {
    setStoreDetails((prev) => ({ ...prev, ...values }));
    setServerFieldErrors({});
    goToStep('bank_details');
  };

  const handleSaveBankDetails = (values: BankDetailsFormValues) => {
    setBankDetails((prev) => ({ ...prev, ...values }));
    setServerFieldErrors({});
    goToStep('review');
  };

  const handleSubmitRegistration = async () => {
    if (!isConfirmed) {
      setErrorMessage('Please check the confirmation box to complete registration.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setServerFieldErrors({});

    try {
      const response = await storeOnboardingService.registerStore({
        storeDetails,
        bankDetails,
        confirmed: true
      });

      if (response.success) {
        setRegistrationResult(response);
        setCountdown(5);
        goToStep('success');
      } else {
        setErrorMessage(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const responseData = err?.response?.data;
      const status = err?.response?.status;
      const fieldErrors: Record<string, string> | undefined = responseData?.errors;

      // Handle field-level validation errors (422 or any response with errors dictionary)
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setServerFieldErrors(fieldErrors);
        setErrorMessage(null); // Do NOT show top banner for validation errors

        // Determine if any error belongs to Store Details vs Bank Details
        const hasStoreError = Object.keys(fieldErrors).some(
          (k) => STORE_FIELD_KEYS.includes(k) || k.startsWith('storeDetails')
        );

        if (hasStoreError) {
          goToStep('store_details');
        } else {
          goToStep('bank_details');
        }
        return;
      }

      // Handle 500, network error, or unexpected exceptions (Top banner allowed ONLY for these)
      const serverMessage =
        responseData?.message ||
        responseData?.error ||
        (status ? `Server Error (${status}). Please try again.` : 'Unable to connect to Self Print server.');
      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    storeDetails,
    bankDetails,
    isConfirmed,
    setIsConfirmed,
    isSubmitting,
    errorMessage,
    serverFieldErrors,
    registrationResult,
    countdown,
    goToStep,
    handleSaveStoreDetails,
    handleSaveBankDetails,
    handleSubmitRegistration
  };
};

export default useStoreOnboarding;
