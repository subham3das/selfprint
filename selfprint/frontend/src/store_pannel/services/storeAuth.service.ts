import { apiClient } from '@/lib/axios';
import { StoreLoginResponse, StoreAuthUser } from '../types/storeAuth.types';

export const storeAuthService = {
  /**
   * Authenticate Store Login against live MongoDB
   */
  async login(emailOrPhone: string, password: string): Promise<StoreLoginResponse> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        token: string;
        store: {
          id: string;
          storeCode: string;
          storeName: string;
          ownerName: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          storeImage?: string;
          logo?: string;
          status: string;
          isVerified: boolean;
        };
      };
    }>('/store/login', {
      emailOrPhone,
      password
    });

    const { token, store } = response.data.data;

    // Persist JWT and active store profile in localStorage
    try {
      localStorage.setItem('selfprint_store_token', token);
      localStorage.setItem('selfprint_registered_store', JSON.stringify(store));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    return {
      success: true,
      token,
      store: {
        storeId: store.id || store.storeCode,
        storeName: store.storeName,
        ownerName: store.ownerName,
        email: store.email,
        phone: store.phone,
        address: store.address,
        city: store.city,
        state: store.state,
        token
      },
      message: response.data.message
    };
  },

  /**
   * Retrieve active store session token
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem('selfprint_store_token');
    } catch {
      return null;
    }
  },

  /**
   * Retrieve active store cached profile
   */
  getStoredStore(): StoreAuthUser | null {
    try {
      const data = localStorage.getItem('selfprint_registered_store');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear store session
   */
  logout(): void {
    try {
      localStorage.removeItem('selfprint_store_token');
      localStorage.removeItem('selfprint_registered_store');
    } catch (err) {
      console.warn('LocalStorage logout error:', err);
    }
  }
};

export default storeAuthService;
