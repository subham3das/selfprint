import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  storeSettingsService,
  SystemInfo
} from '../services/storeSettings.service';
import {
  StoreFullSettings,
  StoreGeneralInfo,
  PricingSettingsConfig,
  PaymentSettingsConfig,
  PrinterSettingsConfig,
  PreferencesSettingsConfig,
  NotificationSettingsConfig
} from '../types/settings.types';

export const useStoreSettings = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('selfprint_store_token');
  const isEnabled = Boolean(token);

  // 1. Full Settings Query
  const settingsQuery = useQuery<StoreFullSettings>({
    queryKey: ['storeFullSettings'],
    queryFn: () => storeSettingsService.fetchFullSettings(),
    enabled: isEnabled,
    staleTime: 10000
  });

  // 2. System Diagnostics Query
  const systemInfoQuery = useQuery<SystemInfo>({
    queryKey: ['storeSystemInfo'],
    queryFn: () => storeSettingsService.fetchSystemInfo(),
    enabled: isEnabled,
    staleTime: 30000
  });

  // Invalidate queries helper
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['storeFullSettings'] });
    queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    queryClient.invalidateQueries({ queryKey: ['storeQRConfig'] });
  };

  // Section Mutations
  const updateGeneralMutation = useMutation({
    mutationFn: (general: Partial<StoreGeneralInfo>) =>
      storeSettingsService.updateGeneralSettings(general),
    onSuccess: invalidate
  });

  const updatePricingMutation = useMutation({
    mutationFn: (pricing: Partial<PricingSettingsConfig>) =>
      storeSettingsService.updatePricingSettings(pricing),
    onSuccess: invalidate
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (payment: Partial<PaymentSettingsConfig>) =>
      storeSettingsService.updatePaymentSettings(payment),
    onSuccess: invalidate
  });

  const updatePrinterMutation = useMutation({
    mutationFn: (printer: Partial<PrinterSettingsConfig>) =>
      storeSettingsService.updatePrinterSettings(printer),
    onSuccess: invalidate
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: Partial<PreferencesSettingsConfig>) =>
      storeSettingsService.updatePreferencesSettings(preferences),
    onSuccess: invalidate
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: (notifications: Partial<NotificationSettingsConfig>) =>
      storeSettingsService.updateNotificationSettings(notifications),
    onSuccess: invalidate
  });

  const updateReceiptMutation = useMutation({
    mutationFn: (receipt: any) =>
      storeSettingsService.updateReceiptSettings(receipt),
    onSuccess: invalidate
  });

  const restoreBackupMutation = useMutation({
    mutationFn: (backupData: any) =>
      storeSettingsService.restoreBackup(backupData),
    onSuccess: invalidate
  });

  return {
    settings: settingsQuery.data,
    systemInfo: systemInfoQuery.data,
    isLoading: settingsQuery.isLoading,
    isFetching: settingsQuery.isFetching,
    refetchSettings: settingsQuery.refetch,
    updateGeneral: updateGeneralMutation.mutateAsync,
    updatePricing: updatePricingMutation.mutateAsync,
    updatePayment: updatePaymentMutation.mutateAsync,
    updatePrinter: updatePrinterMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    updateNotifications: updateNotificationsMutation.mutateAsync,
    updateReceipt: updateReceiptMutation.mutateAsync,
    exportBackup: storeSettingsService.exportBackup,
    restoreBackup: restoreBackupMutation.mutateAsync,
    isSaving:
      updateGeneralMutation.isPending ||
      updatePricingMutation.isPending ||
      updatePaymentMutation.isPending ||
      updatePrinterMutation.isPending ||
      updatePreferencesMutation.isPending ||
      updateNotificationsMutation.isPending
  };
};
