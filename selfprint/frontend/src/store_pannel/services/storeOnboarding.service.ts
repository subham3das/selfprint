import { apiClient } from '@/lib/axios';
import {
  CompleteStoreOnboardingData,
  StoreRegistrationResponse,
  BankDetailsFormValues
} from '../types/storeOnboarding.types';

export const storeOnboardingService = {
  /**
   * Submit and validate Step 2 Bank Details with backend API
   */
  async submitBankDetails(
    bankDetails: BankDetailsFormValues
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>('/store/onboarding/bank-details', bankDetails);
    return response.data;
  },

  /**
   * Retrieve current onboarding status
   */
  async getOnboardingStatus(): Promise<{
    success: boolean;
    message?: string;
    data?: any;
  }> {
    const response = await apiClient.get('/store/onboarding/status');
    return response.data;
  },
  /**
   * Register store via backend API in MongoDB
   */
  async registerStore(
    data: CompleteStoreOnboardingData
  ): Promise<StoreRegistrationResponse> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: {
        storeId: string;
        storeCode: string;
        storeName: string;
        ownerName: string;
        email: string;
        phone: string;
        qrToken: string;
        storeToken: string;
      };
    }>('/store/onboard', data);

    const resData = response.data.data;

    // Cache session token and store profile
    try {
      localStorage.setItem('selfprint_store_token', resData.storeToken);
      localStorage.setItem(
        'selfprint_registered_store',
        JSON.stringify({
          storeId: resData.storeId,
          storeCode: resData.storeCode,
          storeName: resData.storeName,
          ownerName: resData.ownerName,
          email: resData.email,
          phone: resData.phone
        })
      );
    } catch (err) {
      console.warn('LocalStorage access warning:', err);
    }

    return {
      success: true,
      storeId: resData.storeCode || resData.storeId,
      storeName: resData.storeName,
      qrToken: resData.qrToken,
      storeToken: resData.storeToken,
      message: response.data.message || 'Store partner registered successfully.'
    };
  }
};

export default storeOnboardingService;
