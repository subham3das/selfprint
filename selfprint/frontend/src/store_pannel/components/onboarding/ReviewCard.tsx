import React from 'react';
import {
  Store,
  Landmark,
  Edit2,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {

  StoreDetailsFormValues,
  BankDetailsFormValues
} from '../../types/storeOnboarding.types';

interface ReviewCardProps {
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

export const ReviewCard: React.FC<ReviewCardProps> = ({
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
  const maskedAccountNumber = bankDetails.accountNumber
    ? `•••• •••• ${bankDetails.accountNumber.slice(-4)}`
    : 'Not provided';

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-900">
          Step 3: Review & Finalize Registration
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Please review your details carefully before submitting your store application.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card 1: Store & Owner Summary */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Store className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-xs">
              Store & Owner Information
            </h3>
          </div>

          <button
            type="button"
            onClick={onEditStore}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
          {/* Store Photo Thumbnail */}
          {storeDetails.storeImage ? (
            <img
              src={storeDetails.storeImage}
              alt="Store Front"
              className="w-24 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-24 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-bold">
              No Photo
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 flex-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Store Name
              </span>
              <span className="font-bold text-slate-900">
                {storeDetails.storeName || '—'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Owner Full Name
              </span>
              <span className="font-bold text-slate-900">
                {storeDetails.ownerName || '—'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Address
              </span>
              <span className="font-medium text-slate-700">
                {storeDetails.storeAddress}, {storeDetails.city}, {storeDetails.state} -{' '}
                {storeDetails.pinCode}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Contact Phone
              </span>
              <span className="font-mono font-bold text-slate-900">
                +91 {storeDetails.phone}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                Email (Login ID)
              </span>
              <span className="font-mono font-medium text-slate-700">
                {storeDetails.email}
              </span>
            </div>

            {storeDetails.gstNumber && (
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  GSTIN
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {storeDetails.gstNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Bank Details Summary */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-xs">
              Bank Payout Information
            </h3>
          </div>

          <button
            type="button"
            onClick={onEditBank}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs pt-1">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Account Holder
            </span>
            <span className="font-bold text-slate-900">
              {bankDetails.accountHolderName || storeDetails.ownerName}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Bank Name
            </span>
            <span className="font-bold text-slate-900">
              {bankDetails.bankName || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Account Number
            </span>
            <span className="font-mono font-bold text-slate-900">
              {maskedAccountNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              IFSC Code
            </span>
            <span className="font-mono font-bold text-slate-900">
              {bankDetails.ifscCode || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Branch Name
            </span>
            <span className="font-medium text-slate-700">
              {bankDetails.branchName || '—'}
            </span>
          </div>

          {bankDetails.upiId && (
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                UPI ID
              </span>
              <span className="font-mono font-bold text-slate-800">
                {bankDetails.upiId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-extrabold text-slate-900">
              I confirm all the information provided above is accurate and complete.
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              By registering, you agree to the Self Print Partner Agreement and Automatic Settlement Terms.
            </p>
          </div>
        </label>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bank Details</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registering Store...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Registration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
