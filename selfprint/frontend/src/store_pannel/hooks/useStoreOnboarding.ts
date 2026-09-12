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

const BANK_FIELD_KEYS = [
  'accountHolderName',
  'bankName',
  'accountNumber',
  'confirmAccountNumber',
  'ifscCode',
  'branchName',
  'upiId',
  'chequeImage',
  'passbookImage'
];

export const useStoreOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  
  // Preserve form state from localStorage if available
  const [storeDetails, setStoreDetails] = useState<StoreDetailsFormValues>(() => {
    try {
      const saved = localStorage.getItem('selfprint_onboarding_store_details');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not restore store details from localStorage:', e);
    }
    return DEFAULT_STORE_DETAILS;
  });

  const [bankDetails, setBankDetails] = useState<BankDetailsFormValues>(() => {
    try {
      const saved = localStorage.getItem('selfprint_onboarding_bank_details');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not restore bank details from localStorage:', e);
    }
    return DEFAULT_BANK_DETAILS;
  });

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
    console.log("[STEP BEFORE]", currentStep);
    console.log("[STEP AFTER]", step);
    console.log("[WHO CHANGED STEP]", new Error().stack);
    console.log(`[Onboarding] currentStep change -> ${step}`);
    console.log(`[Onboarding] onboarding status: Active Step is now '${step}'`);
    setErrorMessage(null);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStoreDetails = (values: StoreDetailsFormValues) => {
    console.log('[Onboarding] Submitting Store Details (Step 1)...', {
      storeName: values.storeName,
      ownerName: values.ownerName,
      email: values.email
    });
    const updatedStoreDetails = { ...storeDetails, ...values };
    setStoreDetails(updatedStoreDetails);
    try {
      localStorage.setItem('selfprint_onboarding_store_details', JSON.stringify(updatedStoreDetails));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    setServerFieldErrors({});
    console.log('[Onboarding] currentStep change: store_details -> bank_details');
    console.log('[Onboarding] onboarding status: Step 1 completed, advancing to Step 2');
    goToStep('bank_details');
  };

  const handleSaveBankDetails = async (values: BankDetailsFormValues) => {
    console.log('[Onboarding] Submitting Bank Details (Step 2)...', {
      bankName: values.bankName,
      accountHolderName: values.accountHolderName,
      ifscCode: values.ifscCode
    });

    setIsSubmitting(true);
    setErrorMessage(null);
    setServerFieldErrors({});

    try {
      // 1. Submit bank details to backend API and wait for response
      const response = await storeOnboardingService.submitBankDetails(values);
      console.log('[Onboarding] Bank Details API Response:', response);

      if (response && response.success) {
        // 6. Preserve form state after successful submission
        const updatedBankDetails = { ...bankDetails, ...values };
        setBankDetails(updatedBankDetails);
        try {
          localStorage.setItem('selfprint_onboarding_bank_details', JSON.stringify(updatedBankDetails));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }

        // 3. On success, advance to Step 3 instead of resetting to Step 2
        // 9. Add logging for currentStep changes and onboarding status
        console.log('[Onboarding] currentStep change: bank_details -> review');
        console.log('[Onboarding] onboarding status: Step 2 completed successfully, advancing to Step 3 (Review)');
        goToStep('review');
      } else {
        console.warn('[Onboarding] API response indicated non-success:', response);
        setErrorMessage(response?.message || 'Failed to validate bank details. Please check your inputs.');
      }
    } catch (err: any) {
      console.error('[Onboarding] Bank details submission error:', err);
      const responseData = err?.response?.data;
      const status = err?.response?.status;
      const fieldErrors: Record<string, string> | undefined = responseData?.errors;

      console.log('[Onboarding] API response error data:', responseData);

      // 7 & 8: Only redirect back to Bank Details if the backend explicitly reports validation errors
      // Show validation errors inline instead of silently returning to Step 2
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        console.log('[Onboarding] Backend reported validation errors:', fieldErrors);
        setServerFieldErrors(fieldErrors);
        setErrorMessage(null); // Show errors inline, do not show generic top banner
        goToStep('bank_details');
      } else {
        const serverMessage =
          responseData?.message ||
          responseData?.error ||
          (status ? `Server Error (${status}). Please try again.` : 'Unable to validate bank details with server.');
        setErrorMessage(serverMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRegistration = async () => {
    if (!isConfirmed) {
      setErrorMessage('Please check the confirmation box to complete registration.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setServerFieldErrors({});
    console.log('[Onboarding] Submitting final store registration...');

    try {
      const response = await storeOnboardingService.registerStore({
        storeDetails,
        bankDetails,
        confirmed: true
      });

      console.log('[Onboarding] Registration API Response:', response);

      if (response.success) {
        // Clear cached onboarding drafts upon successful registration
        try {
          localStorage.removeItem('selfprint_onboarding_store_details');
          localStorage.removeItem('selfprint_onboarding_bank_details');
        } catch (e) {
          console.warn('LocalStorage cleanup warning:', e);
        }

        console.log('[Onboarding] currentStep change: review -> success');
        console.log('[Onboarding] onboarding status: Store registration completed successfully');

        setRegistrationResult(response);
        setCountdown(5);
        goToStep('success');
      } else {
        setErrorMessage(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('[Onboarding] Registration submission error:', err);
      const responseData = err?.response?.data;
      const status = err?.response?.status;
      const fieldErrors: Record<string, string> | undefined = responseData?.errors;

      console.log('[Onboarding] API response error data:', responseData);

      // Handle field-level validation errors (422 or any response with errors dictionary)
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setServerFieldErrors(fieldErrors);
        setErrorMessage(null); // Do NOT show top banner for validation errors

        // Determine if any error belongs to Store Details vs Bank Details
        const hasStoreError = Object.keys(fieldErrors).some(
          (k) => STORE_FIELD_KEYS.includes(k) || k.startsWith('storeDetails')
        );
        const hasBankError = Object.keys(fieldErrors).some(
          (k) => BANK_FIELD_KEYS.includes(k) || k.startsWith('bankDetails')
        );

        if (hasStoreError) {
          console.log('[Onboarding] currentStep change: review -> store_details (validation errors)');
          goToStep('store_details');
        } else if (hasBankError) {
          console.log('[Onboarding] currentStep change: review -> bank_details (validation errors)');
          goToStep('bank_details');
        } else {
          // General / system error (e.g. storeCode duplicate or other root error) - stay on review and show message
          const firstMsg = Object.values(fieldErrors)[0];
          setErrorMessage(firstMsg || responseData?.message || 'Registration failed. Please check the entered information.');
        }
        return;
      }

      // Handle 500, network error, or unexpected exceptions (Stay on review, show message)
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
