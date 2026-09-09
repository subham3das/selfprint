import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SettingsTab,
  PlatformSettingsState,
  GeneralSettingsFormValues,
  ContactInfoFormValues,
  EmailSettingsFormValues,
  SystemPreferencesFormValues,
  SessionSettingsFormValues,
  SettingsSectionKey
} from '../types/settings.types';
import { adminSettingsService } from '../services/settings.service';
import { getSocket } from '@/lib/socket';

const DEFAULT_SETTINGS_FALLBACK: PlatformSettingsState = {
  general: {
    platformName: 'Self Print Platform',
    platformTagline: 'Automated Cloud Printing Ecosystem',
    timeZone: 'Asia/Kolkata (IST +5:30)',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'English (US)'
  },
  contact: {
    supportEmail: 'support@selfprint.com',
    supportPhone: '+91 (0361) 234-5678',
    companyAddress: 'Tech Hub Guwahati, G.S. Road, Guwahati 781005'
  },
  email: {
    fromEmail: 'noreply@selfprint.com',
    fromName: 'Self Print Notifications',
    emailProvider: 'SendGrid Web API',
    enableEmailNotifications: true
  },
  systemPreferences: {
    allowNewStoreRegistration: true,
    autoApproveStores: false,
    maintenanceMode: false,
    enableCaptcha: false,
    defaultStoreStatus: 'Pending'
  },
  session: {
    sessionTimeout: '8 Hours',
    rememberMeDuration: '30 Days',
    maxLoginAttempts: 5,
    lockoutDuration: '15 Minutes'
  },
  systemOverview: {
    platformVersion: 'v2.4.0-prod',
    environment: 'Production (AWS ap-south-1)',
    databaseStatus: 'Connected',
    storageUsedPercent: 28,
    activeUsers: 1,
    totalStores: 1,
    totalPrinters: 1
  },
  integrations: [
    {
      id: 'int-razorpay',
      name: 'Razorpay Gateway',
      category: 'Payment',
      iconType: 'razorpay',
      status: 'Connected'
    },
    {
      id: 'int-sendgrid',
      name: 'SendGrid Email API',
      category: 'Communication',
      iconType: 'sendgrid',
      status: 'Connected'
    },
    {
      id: 'int-firebase',
      name: 'Firebase Push Messaging',
      category: 'Communication',
      iconType: 'firebase',
      status: 'Connected'
    },
    {
      id: 'int-cloudinary',
      name: 'Cloudinary CDN Asset Storage',
      category: 'Storage',
      iconType: 'cloudinary',
      status: 'Connected'
    }
  ]
};

export const useSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Real Settings from MongoDB
  const {
    data: settings = DEFAULT_SETTINGS_FALLBACK,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<PlatformSettingsState>({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminSettingsService.fetchSettings(),
    staleTime: 30000
  });

  // 2. Real-Time Socket Invalidation on Settings Change
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleSettingsUpdated = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      };

      socket.on('SETTINGS_UPDATED', handleSettingsUpdated);
      return () => {
        socket.off('SETTINGS_UPDATED', handleSettingsUpdated);
      };
    } catch {
      // Socket offline
    }
  }, [queryClient]);

  // 3. Mutate Section Handler with Optimistic UI
  const updateSectionMutation = useMutation({
    mutationFn: async ({ section, data }: { section: SettingsSectionKey; data: any }) => {
      return adminSettingsService.updateSection(section, data);
    },
    onMutate: async ({ section, data }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-platform-settings'] });
      const previousSettings = queryClient.getQueryData<PlatformSettingsState>(['admin-platform-settings']);

      queryClient.setQueryData<PlatformSettingsState>(['admin-platform-settings'], (old) => {
        if (!old) return DEFAULT_SETTINGS_FALLBACK;
        return {
          ...old,
          [section]: {
            ...(old as any)[section],
            ...data
          }
        };
      });

      return { previousSettings };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['admin-platform-settings'], context.previousSettings);
      }
      showToast('Failed to save settings. Reverted changes.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
    }
  });

  const handleSaveGeneral = async (newGeneral: GeneralSettingsFormValues) => {
    await updateSectionMutation.mutateAsync({ section: 'general', data: newGeneral });
    showToast('General platform identity saved to database.');
  };

  const handleSaveContact = async (newContact: ContactInfoFormValues) => {
    await updateSectionMutation.mutateAsync({ section: 'contact', data: newContact });
    showToast('Support & business contact info updated.');
  };

  const handleSaveEmail = async (newEmail: EmailSettingsFormValues) => {
    await updateSectionMutation.mutateAsync({ section: 'email', data: newEmail });
    showToast('Email preferences & dispatch policies updated.');
  };

  const handleSaveSystemPreferences = async (newPrefs: SystemPreferencesFormValues) => {
    await updateSectionMutation.mutateAsync({ section: 'systemPreferences', data: newPrefs });
    showToast('Store & platform registration policies saved.');
  };

  const handleSaveSession = async (newSession: SessionSettingsFormValues) => {
    await updateSectionMutation.mutateAsync({ section: 'session', data: newSession });
    showToast('Session timeout & security lockout policies saved.');
  };

  const handleTestIntegration = async (provider: string) => {
    try {
      showToast(`Testing connection to ${provider}...`);
      const res = await adminSettingsService.testIntegration(provider);
      showToast(`${provider} verified successfully (${res.latencyMs}ms)!`);
      refetch();
    } catch {
      showToast(`Connection to ${provider} failed.`);
    }
  };

  const handleTestEmail = async (recipient: string = 'admin@selfprint.com') => {
    try {
      showToast('Dispatching test verification email...');
      const res = await adminSettingsService.testEmail(recipient);
      showToast(res.message || 'Test email dispatched successfully.');
    } catch {
      showToast('Failed to dispatch test email.');
    }
  };

  const handleTriggerBackup = async () => {
    try {
      showToast('Creating database snapshot archive...');
      const res = await adminSettingsService.triggerBackup();
      showToast(`Database backup created: ${res.backupId} (${res.sizeMb} MB)`);
      refetch();
    } catch {
      showToast('Failed to create database snapshot.');
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear platform temporary cache, buffers, and Redis keys?')) {
      try {
        await adminSettingsService.dangerAction('clear_cache');
        showToast('Platform cache purged successfully.');
      } catch {
        showToast('Failed to clear cache.');
      }
    }
  };

  const handleResetSettings = async () => {
    if (confirm('WARNING: Reset all platform settings to original factory defaults?')) {
      try {
        await adminSettingsService.dangerAction('reset_settings');
        showToast('Platform settings reset to factory defaults.');
        refetch();
      } catch {
        showToast('Failed to reset settings.');
      }
    }
  };

  const handleDeleteData = async () => {
    if (confirm('WARNING: Are you sure you want to purge test records? This action cannot be undone.')) {
      try {
        await adminSettingsService.dangerAction('purge_test_data');
        showToast('Test records purged and recorded to audit log.');
      } catch {
        showToast('Failed to purge test data.');
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    settings,
    isLoading,
    isSaving: updateSectionMutation.isPending,
    isError,
    error,
    toastMessage,
    refetch,
    handleSaveGeneral,
    handleSaveContact,
    handleSaveEmail,
    handleSaveSystemPreferences,
    handleSaveSession,
    handleTestIntegration,
    handleTestEmail,
    handleTriggerBackup,
    handleClearCache,
    handleResetSettings,
    handleDeleteData
  };
};

export default useSettings;
