import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeQueueService, FetchQueueParams, FetchQueueResponse } from '../services/storeQueue.service';
import { QueueJobStatus } from '../types/queue.types';
import { getSocket } from '@/lib/socket';

export const useStoreQueue = (params?: FetchQueueParams) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('selfprint_store_token');
  const isEnabled = Boolean(token);

  const queryKey = ['storeQueue', params];

  // 1. Live Queue Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery<FetchQueueResponse>({
    queryKey,
    queryFn: () => storeQueueService.fetchQueue(params),
    enabled: isEnabled,
    staleTime: 2000
  });

  // 2. Real-Time Socket.io Connection to Store Room
  useEffect(() => {
    const socket = getSocket();

    const handleNewJob = () => {
      queryClient.invalidateQueries({ queryKey: ['storeQueue'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    };

    socket.on('NEW_PRINT_JOB', handleNewJob);
    socket.on('JOB_STATUS_UPDATED', handleNewJob);

    return () => {
      socket.off('NEW_PRINT_JOB', handleNewJob);
      socket.off('JOB_STATUS_UPDATED', handleNewJob);
    };
  }, [queryClient]);

  // 3. Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: QueueJobStatus }) =>
      storeQueueService.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQueue'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    }
  });

  // 4. Delete Job Mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => storeQueueService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQueue'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    }
  });

  // 5. Clear Completed Mutation
  const clearCompletedMutation = useMutation({
    mutationFn: () => storeQueueService.clearCompleted(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeQueue'] });
      queryClient.invalidateQueries({ queryKey: ['storeDashboard'] });
    }
  });

  return {
    jobs: data?.jobs || [],
    total: data?.total || 0,
    pagination: data?.pagination || {
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: 0,
      totalPages: 1
    },
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteJob: deleteJobMutation.mutateAsync,
    clearCompleted: clearCompletedMutation.mutateAsync,
    isMutating:
      updateStatusMutation.isPending ||
      deleteJobMutation.isPending ||
      clearCompletedMutation.isPending
  };
};
