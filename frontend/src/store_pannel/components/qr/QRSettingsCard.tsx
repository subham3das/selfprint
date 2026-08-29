import React, { useRef, useState } from 'react';
import {
  Store,
  MapPin,
  FileText,
  Clock,
  Upload,
  Check,
  Save,
  RotateCcw,
  X
} from 'lucide-react';
import { QRConfig } from '../../types/qr.types';

interface QRSettingsCardProps {
  config: QRConfig;
  onChange: (updated: Partial<QRConfig>) => void;
  onReset: () => void;
  onSave: () => void;
}

export const QRSettingsCard: React.FC<QRSettingsCardProps> = ({
  config,
  onChange,
  onReset,
  onSave
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size exceeds 1MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              QR Code Settings
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Customize print store details and visual branding
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* 2-Column Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5">
          {/* Left Column: Store Details */}
          <div className="space-y-4">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Store Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={config.storeName}
                  onChange={(e) => onChange({ storeName: e.target.value })}
                  placeholder="e.g. Demo Print Store"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Store Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Store Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={config.storeLocation}
                  onChange={(e) => onChange({ storeLocation: e.target.value })}
                  placeholder="e.g. Koramangala, Bengaluru"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Upload Limit */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Limit (MB)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.uploadLimitMb}
                  onChange={(e) =>
                    onChange({ uploadLimitMb: parseInt(e.target.value, 10) || 20 })
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Maximum file size allowed for upload
              </p>
            </div>

            {/* Expiry (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Expiry (Optional)
              </label>
              <div className="relative">
                <select
                  value={config.expiry}
                  onChange={(e) => onChange({ expiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-medium text-slate-800 outline-none transition-all appearance-none bg-white pr-8"
                >
                  <option value="No Expiry">No Expiry</option>
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="1 Year">1 Year</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Set expiry for QR code (optional)
              </p>
            </div>
          </div>

          {/* Right Column: Customization */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Customization
            </h3>

            {/* Primary Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-200 shadow-inner shrink-0 relative overflow-hidden cursor-pointer"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => onChange({ primaryColor: e.target.value })}
                    className="absolute -inset-2 opacity-0 cursor-pointer w-12 h-12"
                  />
                </div>
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-mono font-medium text-slate-800 outline-none uppercase"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-200 shadow-inner shrink-0 relative overflow-hidden cursor-pointer"
                  style={{ backgroundColor: config.secondaryColor }}
                >
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => onChange({ secondaryColor: e.target.value })}
                    className="absolute -inset-2 opacity-0 cursor-pointer w-12 h-12"
                  />
                </div>
                <input
                  type="text"
                  value={config.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-mono font-medium text-slate-800 outline-none uppercase"
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Logo (Optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {config.logoUrl ? (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={config.logoUrl}
                      alt="Uploaded Store Logo"
                      className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Custom Logo Active</p>
                      <p className="text-[11px] text-slate-400">Embedded in center of QR</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onChange({ logoUrl: undefined })}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20 text-center group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center shadow-sm transition-colors mb-2">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Upload Logo
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG up to 1MB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Footer */}
      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Permanent Store ID: <strong className="text-slate-700 font-mono">{config.storeId}</strong>
        </span>
        <button
          onClick={handleSaveClick}
          className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99]"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
