import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { PricingSettingsConfig } from '../../types/settings.types';

interface PricingConfigCardProps {
  pricing: PricingSettingsConfig;
  onSave: (updated: PricingSettingsConfig) => void;
}

export const PricingConfigCard: React.FC<PricingConfigCardProps> = ({
  pricing,
  onSave
}) => {
  const [formData, setFormData] = useState<PricingSettingsConfig>(pricing);
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
          Pricing
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
          Set your print prices
        </p>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
          {/* Pricing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                  <th className="py-2.5 px-2">Print Type</th>
                  <th className="py-2.5 px-2">A4 (Per Page)</th>
                  <th className="py-2.5 px-2">A3 (Per Page)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Black & White */}
                <tr>
                  <td className="py-3 px-2 font-bold text-slate-800">
                    Black &amp; White
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.bwA4Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bwA4Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.bwA3Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bwA3Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                </tr>

                {/* Color */}
                <tr>
                  <td className="py-3 px-2 font-bold text-slate-800">Color</td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.colorA4Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            colorA4Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.colorA3Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            colorA3Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                </tr>

                {/* Extra Copy */}
                <tr>
                  <td className="py-3 px-2 font-bold text-slate-800">
                    Extra Copy (Same Page)
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.extraCopyA4Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            extraCopyA4Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative w-28">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.extraCopyA3Price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            extraCopyA3Price: parseFloat(e.target.value) || 0
                          })
                        }
                        className="w-full pl-6 pr-2 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Info Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-700">
            <Info className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>These prices will be applied to all new print jobs.</span>
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
