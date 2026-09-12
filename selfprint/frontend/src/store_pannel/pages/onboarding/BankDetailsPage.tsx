import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BankForm } from '../../components/onboarding/BankForm';
import { BankDetailsFormValues } from '../../types/storeOnboarding.types';

interface BankDetailsPageProps {
  initialValues: BankDetailsFormValues;
  serverFieldErrors?: Record<string, string>;
  ownerName?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSave: (values: BankDetailsFormValues) => void;
  onBack: () => void;
}

export const BankDetailsPage: React.FC<BankDetailsPageProps> = ({
  initialValues,
  serverFieldErrors,
  ownerName,
  isSubmitting,
  errorMessage,
  onSave,
  onBack
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
        <BankForm
          initialValues={initialValues}
          serverFieldErrors={serverFieldErrors}
          ownerName={ownerName}
          isSubmitting={isSubmitting}
          onSave={onSave}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

export default BankDetailsPage;
