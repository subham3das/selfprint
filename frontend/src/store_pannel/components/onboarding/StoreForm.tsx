import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Store,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles
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
  onSave: (values: StoreDetailsFormValues) => void;
  onBack: () => void;
  onQuickFill?: () => void;
}

export const StoreForm: React.FC<StoreFormProps> = ({
  initialValues,
  onSave,
  onBack,
  onQuickFill
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<StoreDetailsSchemaValues>({
    resolver: zodResolver(storeDetailsSchema),
    defaultValues: initialValues
  });

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
    <form onSubmit={handleSubmit(onSave)} className="space-y-6 text-xs" noValidate>
      {/* Header & Quick Fill */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Step 1: Store & Owner Information
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Tell us about your print shop location and contact details.
          </p>
        </div>

        {onQuickFill && (
          <button
            type="button"
            onClick={onQuickFill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Store</span>
          </button>
        )}
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
              placeholder="e.g. Print Hub Xerox & Cyber Cafe"
              {...register('storeName')}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                errors.storeName
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
              }`}
            />
            {errors.storeName && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.storeName.message}
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
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.ownerName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Store Picture Upload */}
      <StoreImageUpload
        value={watchedImage || ''}
        onChange={(uri) => setValue('storeImage', uri, { shouldValidate: true })}
        error={errors.storeImage?.message}
      />

      {/* Section 3: Contact & Address */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-600" />
          <span>Location & Contact</span>
        </h3>

        {/* Store Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Complete Shop Address / Landmark <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Shop No. 4, Opposite Cotton University, Panbazar"
            {...register('storeAddress')}
            className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none ${
              errors.storeAddress
                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                : 'border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/10'
            }`}
          />
          {errors.storeAddress && (
            <p className="text-[11px] font-bold text-rose-600 mt-1">
              {errors.storeAddress.message}
            </p>
          )}
        </div>

        {/* City, State, PIN, Country */}
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
            />
            {errors.city && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.city.message}
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none cursor-pointer"
            >
              {indianStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono"
            />
            {errors.pinCode && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.pinCode.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Country <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              {...register('country')}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none"
            />
          </div>
        </div>

        {/* Phone, Alternate Phone, Email, GST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mobile Number (Default Password) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="9864012345"
                {...register('phone')}
                className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono"
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Alternate Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alternate Phone (Optional)
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9864098765"
              {...register('alternatePhone')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono"
            />
            {errors.alternatePhone && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.alternatePhone.message}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address (Default Login ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="printhub@gmail.com"
              {...register('email')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
            />
            {errors.email && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              GST Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 18AABCU9603R1ZM"
              {...register('gstNumber')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none font-mono uppercase"
            />
            {errors.gstNumber && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.gstNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Password Setup */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          <span>Account Security Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Create your password"
              {...register('password')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
            />
            {errors.password && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              {...register('confirmPassword')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-purple-600 focus:bg-white outline-none"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] font-bold text-rose-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
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
          <span>Back to Welcome</span>
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Continue to Bank Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
