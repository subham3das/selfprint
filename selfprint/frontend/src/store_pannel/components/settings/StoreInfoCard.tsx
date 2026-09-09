import React, { useState } from 'react';
import { Store, MapPin, Phone, Clock, User, Check } from 'lucide-react';
import { StoreGeneralInfo } from '../../types/settings.types';

interface StoreInfoCardProps {
  general: StoreGeneralInfo;
  onSave: (updated: StoreGeneralInfo) => void;
}

export const StoreInfoCard: React.FC<StoreInfoCardProps> = ({
  general,
  onSave
}) => {
  const [formData, setFormData] = useState<StoreGeneralInfo>(general);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Store Settings
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
          Update your store information
        </p>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Store Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Store Owner Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Store Owner Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.storeOwnerName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storeOwnerName: e.target.value
                    })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Location */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Store Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.storeLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, storeLocation: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Store Phone */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Store Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={formData.storePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, storePhone: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Business Hours
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Opening Time</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.openingTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openingTime: e.target.value
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Closing Time</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.closingTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        closingTime: e.target.value
                      })
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Store Address */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Store Address
            </label>
            <textarea
              rows={3}
              value={formData.storeAddress}
              onChange={(e) =>
                setFormData({ ...formData, storeAddress: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all resize-none"
              required
            />
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
