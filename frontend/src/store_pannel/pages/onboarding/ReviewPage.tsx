import React from 'react';
import { ReviewCard } from '../../components/onboarding/ReviewCard';
import {
  StoreDetailsFormValues,
  BankDetailsFormValues
} from '../../types/storeOnboarding.types';

interface ReviewPageProps {
  storeDetails: StoreDetailsFormValues;
  bankDetails: BankDetailsFormValues;
  isConfirmed: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onConfirmChange: (confirmed: boolean) => void;
  onEditStore: () => void;
  onEditBank: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  storeDetails,
  bankDetails,
  isConfirmed,
  isSubmitting,
  errorMessage,
  onConfirmChange,
  onEditStore,
  onEditBank,
  onBack,
  onSubmit
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40">
        <ReviewCard
          storeDetails={storeDetails}
          bankDetails={bankDetails}
          isConfirmed={isConfirmed}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onConfirmChange={onConfirmChange}
          onEditStore={onEditStore}
          onEditBank={onEditBank}
          onBack={onBack}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
