import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Landmark,
  QrCode,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import {
  bankDetailsSchema,
  BankDetailsSchemaValues
} from '../../schemas/storeOnboarding.schema';
import { BankDetailsFormValues } from '../../types/storeOnboarding.types';

interface BankFormProps {
  initialValues: BankDetailsFormValues;
  serverFieldErrors?: Record<string, string>;
  ownerName?: string;
  onSave: (values: BankDetailsFormValues) => void;
  onBack: () => void;
}

export const BankForm: React.FC<BankFormProps> = ({
  initialValues,
  serverFieldErrors,
  ownerName,
  onSave,
  onBack
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<BankDetailsSchemaValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      ...initialValues,
      accountHolderName: initialValues.accountHolderName || ownerName || ''
    }
  });

  // Apply backend field-level errors and automatically focus the first invalid field
  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      let firstInvalidField: string | null = null;

      Object.entries(serverFieldErrors).forEach(([field, msg]) => {
        const cleanField = field.replace(/^bankDetails\./, '') as keyof BankDetailsSchemaValues;
        if (cleanField) {
          setError(cleanField, { type: 'server', message: msg });
          if (!firstInvalidField) {
            firstInvalidField = cleanField;
          }
        }
      });

      if (firstInvalidField) {
        setTimeout(() => {
          const el = document.querySelector(`[name="${firstInvalidField}"]`) as HTMLElement;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 150);
      }
    }
  }, [serverFieldErrors, setError]);

  // Scroll to and focus the first invalid field on local validation failure
  const handleInvalid = (formErrors: any) => {
    const firstKey = Object.keys(formErrors)[0];
    if (firstKey) {
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const popularBanks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'Assam Gramin Vikash Bank'
  ];

  return (
    <form onSubmit={handleSubmit(onSave, handleInvalid)} className="space-y-6 text-xs" noValidate>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Step 2: Bank & Payout Information
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Your daily earnings from print jobs will be automatically settled into this account.
          </p>
        </div>
      </div>

      {/* Settlement Guarantee Notice */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Landmark className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-emerald-900">Instant Daily Settlements</p>
          <p className="text-emerald-700 text-[11px]">
            100% of customer payments are credited directly into your verified bank account.
          </p>
        </div>
      </div>

      {/* Bank Account Fields */}
      <div className="space-y-4">
        {/* Account Holder Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Account Holder Name (as per Bank Passbook) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Diganta Borah"
            {...register('accountHolderName')}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
              errors.accountHolderName
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            }`}
          />
          {errors.accountHolderName && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
              <span className="text-rose-500 font-extrabold">✕</span>
              <span>{errors.accountHolderName.message}</span>
            </p>
          )}
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Bank Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            list="popular-banks"
            placeholder="e.g. State Bank of India"
            {...register('bankName')}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
              errors.bankName
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            }`}
          />
          <datalist id="popular-banks">
            {popularBanks.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          {errors.bankName && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
              <span className="text-rose-500 font-extrabold">✕</span>
              <span>{errors.bankName.message}</span>
            </p>
          )}
        </div>

        {/* Account Number & Confirm Account Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Account Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bank Account Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 302948192834"
              {...register('accountNumber')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono ${
                errors.accountNumber
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.accountNumber && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.accountNumber.message}</span>
              </p>
            )}
          </div>

          {/* Confirm Account Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Account Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Re-enter account number"
              {...register('confirmAccountNumber')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono ${
                errors.confirmAccountNumber
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.confirmAccountNumber && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.confirmAccountNumber.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* IFSC Code & Branch Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* IFSC Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              IFSC Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={11}
              placeholder="e.g. SBIN0000088"
              {...register('ifscCode')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono uppercase ${
                errors.ifscCode
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.ifscCode && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.ifscCode.message}</span>
              </p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Branch Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Panbazar Branch, Guwahati"
              {...register('branchName')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none ${
                errors.branchName
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.branchName && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.branchName.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* UPI ID (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Store UPI ID / VPA (Optional for Direct QR Payouts)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <QrCode className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. printhub@sbi"
              {...register('upiId')}
              className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none ${
                errors.upiId
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
          </div>
          {errors.upiId && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
              <span className="text-rose-500 font-extrabold">✕</span>
              <span>{errors.upiId.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Details</span>
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Continue to Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default BankForm;
