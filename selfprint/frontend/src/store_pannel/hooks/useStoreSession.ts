import { useMemo } from 'react';
import { storeAuthService } from '../services/storeAuth.service';
import { StoreInfo } from '../types/dashboard.types';

/**
 * Reads the cached authenticated store profile from localStorage.
 * Only call inside StoreAuthGuard-protected routes.
 */
export const useStoreSession = (): StoreInfo => {
  return useMemo(() => {
    const stored = storeAuthService.getStoredStore();

    if (!stored) {
      return {
        id: '',
        name: 'Store Partner',
        location: 'No location configured',
        storeCode: 'SP-0000',
        ownerName: '—',
        isOnline: false,
        isPaused: false
      };
    }

    return {
      id: stored.storeId || '',
      name: stored.storeName || 'Store Partner',
      location: [stored.city, stored.state].filter(Boolean).join(', ') || 'No location configured',
      storeCode: (stored as any).storeCode || 'SP-0000',
      ownerName: stored.ownerName || '—',
      isOnline: true,
      isPaused: false
    };
  }, []);
};

export default useStoreSession;
