import React, { useState } from 'react';
import { X, Bell, Check, Volume2, Mail, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationSettingsConfig } from '../../types/settings.types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationSettingsConfig;
  onSave: (updated: NotificationSettingsConfig) => void;
}

export const NotificationSettingsModal: React.FC<
  NotificationSettingsModalProps
> = ({ isOpen, onClose, notifications, onSave }) => {
  const [formData, setFormData] =
    useState<NotificationSettingsConfig>(notifications);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Notification Settings
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Manage alerts, sound chimes &amp; emails
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3.5 text-xs">
            {/* Sound on New Job */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Sound on New Job
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Play audio chime when a customer sends print job
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    soundOnNewJob: !formData.soundOnNewJob
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.soundOnNewJob ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.soundOnNewJob
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Browser Notifications */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Browser Push Notifications
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Show desktop banners even when tab is in background
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    browserNotifications: !formData.browserNotifications
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.browserNotifications
                    ? 'bg-indigo-600'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.browserNotifications
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Daily Financial Summary Email
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Send end-of-day revenue summary to store email
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    emailNotifications: !formData.emailNotifications
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.emailNotifications
                    ? 'bg-indigo-600'
                    : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.emailNotifications
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Low Paper Alert */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-slate-800">
                  Low Paper &amp; Toner Telemetry Alerts
                </p>
                <p className="text-[11px] text-slate-400">
                  Notify when tray capacity drops below 15%
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    lowPaperAlert: !formData.lowPaperAlert
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.lowPaperAlert ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.lowPaperAlert
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/70">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Notification Settings</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
