import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Store,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import {
  storeDetailsSchema,
  StoreDetailsSchemaValues
} from '../../schemas/storeOnboarding.schema';
import { StoreDetailsFormValues } from '../../types/storeOnboarding.types';
import { StoreImageUpload } from './StoreImageUpload';
import { InfoCard } from './InfoCard';

interface StoreFormProps {
  initialValues: StoreDetailsFormValues;
  serverFieldErrors?: Record<string, string>;
  onSave: (values: StoreDetailsFormValues) => void;
  onBack: () => void;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  initialValues,
  serverFieldErrors,
  onSave,
  onBack
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors }
  } = useForm<StoreDetailsSchemaValues>({
    resolver: zodResolver(storeDetailsSchema),
    defaultValues: initialValues
  });

  // Apply backend field-level errors and automatically focus the first invalid field
  useEffect(() => {
    if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
      let firstInvalidField: string | null = null;

      Object.entries(serverFieldErrors).forEach(([field, msg]) => {
        const cleanField = field.replace(/^storeDetails\./, '') as keyof StoreDetailsSchemaValues;
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

  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');
  const watchedImage = watch('storeImage');

  const indianStates = [
    'Assam',
    'Arunachal Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Tripura',
    'Sikkim',
    'West Bengal',
    'Bihar',
    'Delhi',
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Uttar Pradesh'
  ];

  return (
    <form onSubmit={handleSubmit(onSave, handleInvalid)} className="space-y-6 text-xs" noValidate>
      {/* Header */}
      <div className="pb-2 border-b border-slate-100">
        <h2 className="text-base font-extrabold text-slate-900">
          Step 1: Store & Owner Information
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Tell us about your print shop location and contact details.
        </p>
      </div>

      {/* Info Card: Default Credentials Rule */}
      <InfoCard email={watchedEmail} phone={watchedPhone} />

      {/* Section 1: Business Identity */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-purple-600" />
          <span>Shop & Owner Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Guwahati Xerox & Cyber Point"
              {...register('storeName')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.storeName
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.storeName && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.storeName.message}</span>
              </p>
            )}
          </div>

          {/* Owner Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Store Owner Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Diganta Borah"
              {...register('ownerName')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.ownerName
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.ownerName && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.ownerName.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Store Photo Upload Component */}
        <StoreImageUpload
          value={watchedImage || ''}
          onChange={(uri) => setValue('storeImage', uri, { shouldValidate: true })}
          error={errors.storeImage?.message}
        />
      </div>

      {/* Section 2: Physical Address & Location */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-600" />
          <span>Shop Address & Location</span>
        </h3>

        {/* Full Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Complete Shop Address / Landmark <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="Shop No., Complex, Street name, Near Landmark..."
            {...register('storeAddress')}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none ${
              errors.storeAddress
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            }`}
          />
          {errors.storeAddress && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
              <span className="text-rose-500 font-extrabold">✕</span>
              <span>{errors.storeAddress.message}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Guwahati"
              {...register('city')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.city
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.city && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.city.message}</span>
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('state')}
              className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none transition-all cursor-pointer ${
                errors.state
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            >
              {indianStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.state.message}</span>
              </p>
            )}
          </div>

          {/* PIN Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PIN Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="781001"
              {...register('pinCode')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.pinCode
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.pinCode && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.pinCode.message}</span>
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Country
            </label>
            <input
              type="text"
              readOnly
              {...register('country')}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Contact & Store Login Credentials */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          <span>Contact & Login Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Mobile */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number (Default Password) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register('phone')}
                className={`w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                  errors.phone
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>

          {/* Alternate Mobile */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alternate Phone <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                {...register('alternatePhone')}
                className={`w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                  errors.alternatePhone
                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
                }`}
              />
            </div>
            {errors.alternatePhone && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.alternatePhone.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address (Login ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="printhub@example.com"
              {...register('email')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GST Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={15}
              placeholder="18AABCU9603R1ZM"
              {...register('gstNumber')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 uppercase placeholder:text-slate-400 outline-none transition-all ${
                errors.gstNumber
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.gstNumber && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.gstNumber.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Custom Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Account Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.password
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.password && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.confirmPassword
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                <span className="text-rose-500 font-extrabold">✕</span>
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Welcome</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all cursor-pointer hover:translate-x-0.5"
        >
          <span>Continue to Bank Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default StoreForm;
