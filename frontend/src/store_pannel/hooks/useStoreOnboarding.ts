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

export const useStoreOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [storeDetails, setStoreDetails] = useState<StoreDetailsFormValues>(DEFAULT_STORE_DETAILS);
  const [bankDetails, setBankDetails] = useState<BankDetailsFormValues>(DEFAULT_BANK_DETAILS);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<StoreRegistrationResponse | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Countdown timer on success page
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
    setStoreDetails(values);
    goToStep('bank_details');
  };

  const handleSaveBankDetails = (values: BankDetailsFormValues) => {
    setBankDetails(values);
    goToStep('review');
  };

  const handleSubmitRegistration = async () => {
    if (!isConfirmed) {
      setErrorMessage('Please check the confirmation box to complete registration.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

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
      setErrorMessage(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFillDemo = () => {
    setStoreDetails({
      storeName: 'Print Hub Xerox & Cyber Cafe',
      ownerName: 'Diganta Borah',
      storeAddress: 'Shop No. 4, Opposite Cotton University, Panbazar',
      country: 'India',
      state: 'Assam',
      city: 'Guwahati',
      pinCode: '781001',
      phone: '9864012345',
      alternatePhone: '9864098765',
      email: 'printhub.guwahati@gmail.com',
      gstNumber: '18AABCU9603R1ZM',
      storeImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    setBankDetails({
      accountHolderName: 'Diganta Borah',
      bankName: 'State Bank of India',
      accountNumber: '302948192834',
      confirmAccountNumber: '302948192834',
      ifscCode: 'SBIN0000088',
      branchName: 'Panbazar Branch, Guwahati',
      upiId: 'printhub@sbi',
      chequeImage: '',
      passbookImage: ''
    });
  };

  return {
    currentStep,
    storeDetails,
    bankDetails,
    isConfirmed,
    setIsConfirmed,
    isSubmitting,
    errorMessage,
    registrationResult,
    countdown,
    goToStep,
    handleSaveStoreDetails,
    handleSaveBankDetails,
    handleSubmitRegistration,
    handleQuickFillDemo
  };
};
