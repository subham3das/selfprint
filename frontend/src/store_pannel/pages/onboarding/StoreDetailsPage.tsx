import React from 'react';
import { StoreForm } from '../../components/onboarding/StoreForm';
import { StoreDetailsFormValues } from '../../types/storeOnboarding.types';

interface StoreDetailsPageProps {
  initialValues: StoreDetailsFormValues;
  onSave: (values: StoreDetailsFormValues) => void;
  onBack: () => void;
  onQuickFill?: () => void;
}

export const StoreDetailsPage: React.FC<StoreDetailsPageProps> = ({
  initialValues,
  onSave,
  onBack,
  onQuickFill
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
        <StoreForm
          initialValues={initialValues}
          onSave={onSave}
          onBack={onBack}
          onQuickFill={onQuickFill}
        />
      </div>
    </div>
  );
};
