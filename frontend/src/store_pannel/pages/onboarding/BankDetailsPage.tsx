import React from 'react';
import { BankForm } from '../../components/onboarding/BankForm';
import { BankDetailsFormValues } from '../../types/storeOnboarding.types';

interface BankDetailsPageProps {
  initialValues: BankDetailsFormValues;
  ownerName?: string;
  onSave: (values: BankDetailsFormValues) => void;
  onBack: () => void;
}

export const BankDetailsPage: React.FC<BankDetailsPageProps> = ({
  initialValues,
  ownerName,
  onSave,
  onBack
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
        <BankForm
          initialValues={initialValues}
          ownerName={ownerName}
          onSave={onSave}
          onBack={onBack}
        />
      </div>
    </div>
  );
};
