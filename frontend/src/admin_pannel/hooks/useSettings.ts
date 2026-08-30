import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  SettingsTab,
  PlatformSettingsState,
  GeneralSettingsFormValues,
  ContactInfoFormValues,
  EmailSettingsFormValues,
  SystemPreferencesFormValues,
  SessionSettingsFormValues
} from '../types/settings.types';
import { INITIAL_SETTINGS_MOCK } from '../data/settings.mock';

export const useSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [settings, setSettings] = useState<PlatformSettingsState>(INITIAL_SETTINGS_MOCK);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const { isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 40));
      return INITIAL_SETTINGS_MOCK;
    },
    staleTime: 60000
  });


  const handleSaveGeneral = (newGeneral: GeneralSettingsFormValues) => {
    setSettings((prev) => ({ ...prev, general: newGeneral }));
    showToast('General settings saved successfully!');
  };

  const handleSaveContact = (newContact: ContactInfoFormValues) => {
    setSettings((prev) => ({ ...prev, contact: newContact }));
    showToast('Contact information updated successfully!');
  };

  const handleSaveEmail = (newEmail: EmailSettingsFormValues) => {
    setSettings((prev) => ({ ...prev, email: newEmail }));
    showToast('Email preferences updated successfully!');
  };

  const handleSaveSystemPreferences = (newPrefs: SystemPreferencesFormValues) => {
    setSettings((prev) => ({ ...prev, systemPreferences: newPrefs }));
    showToast('System preferences saved successfully!');
  };

  const handleSaveSession = (newSession: SessionSettingsFormValues) => {
    setSettings((prev) => ({ ...prev, session: newSession }));
    showToast('Session configuration saved successfully!');
  };

  const handleClearCache = () => {
    if (confirm('Clear platform temporary cache and buffers?')) {
      showToast('Cache cleared successfully!');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Reset all platform settings to original defaults?')) {
      setSettings(INITIAL_SETTINGS_MOCK);
      showToast('Settings reset to defaults.');
    }
  };

  const handleDeleteData = () => {
    if (confirm('WARNING: Are you sure you want to trigger data purge? This action cannot be undone.')) {
      alert('Action logged to security audit trail.');
    }
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    isLoading,
    toastMessage,
    handleSaveGeneral,
    handleSaveContact,
    handleSaveEmail,
    handleSaveSystemPreferences,
    handleSaveSession,
    handleClearCache,
    handleResetSettings,
    handleDeleteData
  };
};
