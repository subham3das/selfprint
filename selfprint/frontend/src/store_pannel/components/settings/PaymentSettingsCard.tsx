import React, { useState } from 'react';
import { CreditCard, Upload, Check } from 'lucide-react';
import { PaymentSettingsConfig } from '../../types/settings.types';


interface PaymentSettingsCardProps {
  payment: PaymentSettingsConfig;
  onSave: (updated: PaymentSettingsConfig) => void;
}

export const PaymentSettingsCard: React.FC<PaymentSettingsCardProps> = ({
  payment,
  onSave
}) => {
  const [formData, setFormData] = useState<PaymentSettingsConfig>(payment);
  const [isSaved, setIsSaved] = useState(false);
  const [qrUploaded, setQrUploaded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUploadQr = () => {
    setQrUploaded(true);
    setTimeout(() => setQrUploaded(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Payment Settings
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
          Manage payment methods
        </p>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
          {/* UPI ID Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">UPI ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) =>
                  setFormData({ ...formData, upiId: e.target.value })
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              This UPI ID will be shown to customers for payment
            </p>
          </div>

          {/* UPI QR Code Dropzone */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              UPI QR Code
            </label>
            <div
              onClick={handleUploadQr}
              className="h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                <Upload className="w-4 h-4" />
                <span>
                  {qrUploaded ? 'QR Code Uploaded!' : 'Click to upload'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG up to 1MB
              </p>
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
