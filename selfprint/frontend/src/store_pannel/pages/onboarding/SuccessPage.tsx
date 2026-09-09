import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SuccessAnimation } from '../../components/onboarding/SuccessAnimation';
import { StoreRegistrationResponse } from '../../types/storeOnboarding.types';

interface SuccessPageProps {
  registrationResult: StoreRegistrationResponse | null;
  countdown: number;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  registrationResult,
  countdown
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-600/10">
        <SuccessAnimation
          registrationResult={registrationResult}
          countdown={countdown}
          onGoToDashboard={() => navigate('/store/dashboard')}
        />
      </div>
    </div>
  );
};

export default SuccessPage;
