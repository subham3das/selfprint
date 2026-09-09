import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeQRService, QRAnalyticsData } from '../services/storeQR.service';
import { QRConfig, QRHistoryItem } from '../types/qr.types';

export const useStoreQR = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('selfprint_store_token');
  const isEnabled = Boolean(token);

  // 1. QR Configuration Query
  const configQuery = useQuery<QRConfig>({
    queryKey: ['storeQRConfig'],
    queryFn: () => storeQRService.fetchQRConfig(),
    enabled: isEnabled,
    staleTime: 10000
  });

  // 2. QR History Query
  const historyQuery = useQuery<QRHistoryItem[]>({
    queryKey: ['storeQRHistory'],
    queryFn: () => storeQRService.fetchQRHistory(),
    enabled: isEnabled,
    staleTime: 10000
  });

  // 3. QR Analytics Query
  const analyticsQuery = useQuery<QRAnalyticsData>({
    queryKey: ['storeQRAnalytics'],
    queryFn: () => storeQRService.fetchQRAnalytics(),
    enabled: isEnabled,
    staleTime: 15000
  });

  // 4. Update QR Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: (updated: Partial<QRConfig>) => storeQRService.updateQRConfig(updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQRConfig'] });
      queryClient.invalidateQueries({ queryKey: ['storeQRHistory'] });
    }
  });

  // 5. Regenerate QR Mutation
  const regenerateMutation = useMutation({
    mutationFn: () => storeQRService.regenerateQR(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQRConfig'] });
      queryClient.invalidateQueries({ queryKey: ['storeQRHistory'] });
    }
  });

  // 6. Delete History Mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => storeQRService.deleteQRHistory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQRHistory'] });
    }
  });

  return {
    config: configQuery.data,
    history: historyQuery.data || [],
    analytics: analyticsQuery.data,
    isLoading: configQuery.isLoading || historyQuery.isLoading,
    isFetching: configQuery.isFetching,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,
    regenerateQR: regenerateMutation.mutateAsync,
    isRegenerating: regenerateMutation.isPending,
    deleteHistory: deleteHistoryMutation.mutateAsync,
    refetchConfig: configQuery.refetch,
    refetchHistory: historyQuery.refetch
  };
};
