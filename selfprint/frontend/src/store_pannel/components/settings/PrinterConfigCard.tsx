import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestModeToggle = () => {
    if (!formData.testMode) {
      // Prompt confirmation before turning ON
      setShowConfirmModal(true);
    } else {
      // Directly turn OFF
      const updated = { ...formData, testMode: false };
      setFormData(updated);
      onSave(updated);
    }
  };

  const confirmEnableTestMode = () => {
    const updated = { ...formData, testMode: true };
    setFormData(updated);
    onSave(updated);
    setShowConfirmModal(false);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Printer Settings
              {formData.testMode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  🟡 TEST MODE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Configure your printer, virtual test mode, and hardware preferences
            </p>
          </div>
        </div>

        {formData.testMode && (
          <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Virtual Test Mode is Active:</span> The connector detects virtual Windows printers (such as <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">Microsoft Print to PDF</code>). Print jobs are saved automatically to <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">Documents/SelfPrint/Test Prints</code>.
            </div>
          </div>
        )}

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
                <option value="No Printer Selected">No Printer Selected</option>
                {formData.testMode && (
                  <option value="Microsoft Print to PDF">Microsoft Print to PDF (Virtual)</option>
                )}
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
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">
                    Enable Test Mode (Virtual Printer)
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                    Sandbox
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Allow testing print pipelines with virtual Windows printers without physical hardware
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestModeToggle}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.testMode ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.testMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto Start */}
            <div className="flex items-center justify-between py-1 px-1">
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
            <div className="flex items-center justify-between py-1 px-1">
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
            <div className="flex items-center justify-between py-1 px-1">
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

      {/* Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enable Virtual Test Mode?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You are switching to <strong>Virtual Test Mode</strong>. In this mode, Microsoft Print to PDF will be used to simulate print jobs, and generated files are automatically saved to:
              </p>
              <div className="mt-2.5 p-2 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-800 font-semibold break-all">
                Documents \ SelfPrint \ Test Prints
              </div>
              <p className="text-xs text-amber-800 font-medium mt-2.5">
                ⚠️ Never send real customer production orders in Test Mode. Remember to disable Test Mode before going live.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEnableTestMode}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-colors"
              >
                Continue &amp; Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
