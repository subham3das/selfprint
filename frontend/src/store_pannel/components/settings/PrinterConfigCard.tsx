import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PrinterSettingsConfig } from '../../types/settings.types';

interface PrinterConfigCardProps {
  printer: PrinterSettingsConfig;
  onSave: (updated: PrinterSettingsConfig) => void;
}

export const PrinterConfigCard: React.FC<PrinterConfigCardProps> = ({
  printer,
  onSave
}) => {
  const [formData, setFormData] = useState<PrinterSettingsConfig>(printer);
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
          Printer Settings
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
          Configure your printer and default preferences
        </p>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4 text-xs">
          {/* 3 Dropdown Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Select Printer */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Select Printer
              </label>
              <select
                value={formData.selectedPrinter}
                onChange={(e) =>
                  setFormData({ ...formData, selectedPrinter: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
              >
                <option value="HP LaserJet 1020">HP LaserJet 1020</option>
                <option value="Canon LBP 2900B">Canon LBP 2900B</option>
                <option value="Epson L3250 Color">Epson L3250 Color</option>
                <option value="Brother DCP-L2541DW">Brother DCP-L2541DW</option>
              </select>
            </div>

            {/* Default Paper Size */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Default Paper Size
              </label>
              <select
                value={formData.defaultPaperSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPaperSize: e.target.value as 'A4' | 'A3' | 'Letter' | 'Legal'
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            {/* Default Print Type */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Default Print Type
              </label>
              <select
                value={formData.defaultPrintType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPrintType: e.target.value as 'Black & White' | 'Color'
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-medium text-slate-800 outline-none transition-all bg-white"
              >
                <option value="Black & White">Black &amp; White</option>
                <option value="Color">Color</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 space-y-3">
            {/* Auto Start */}
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-slate-700">
                Auto Start Print After Payment
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    autoStartAfterPayment: !formData.autoStartAfterPayment
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.autoStartAfterPayment
                    ? 'bg-indigo-600'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.autoStartAfterPayment
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Double-sided */}
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-slate-700">
                Double-sided Printing (Default)
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    doubleSidedDefault: !formData.doubleSidedDefault
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.doubleSidedDefault
                    ? 'bg-indigo-600'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.doubleSidedDefault
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Paper Save Mode */}
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-slate-700">
                Paper Save Mode
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    paperSaveMode: !formData.paperSaveMode
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.paperSaveMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.paperSaveMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
