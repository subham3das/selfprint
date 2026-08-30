import {
  CompleteStoreOnboardingData,
  StoreRegistrationResponse
} from '../types/storeOnboarding.types';

export const storeOnboardingService = {
  async registerStore(
    data: CompleteStoreOnboardingData
  ): Promise<StoreRegistrationResponse> {
    // Simulate network latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const generatedStoreId = `STR-${Date.now().toString().slice(-4)}`;
    const qrToken = `qr_live_${Date.now()}`;
    const storeToken = `tok_store_${generatedStoreId}_${Date.now()}`;

    // Store in localStorage for instant access in store panel
    try {
      const storeProfile = {
        storeId: generatedStoreId,
        storeName: data.storeDetails.storeName,
        ownerName: data.storeDetails.ownerName,
        email: data.storeDetails.email,
        phone: data.storeDetails.phone,
        address: `${data.storeDetails.storeAddress}, ${data.storeDetails.city}, ${data.storeDetails.state} - ${data.storeDetails.pinCode}`,
        city: data.storeDetails.city,
        state: data.storeDetails.state,
        pinCode: data.storeDetails.pinCode,
        storeImage: data.storeDetails.storeImage,
        bankName: data.bankDetails.bankName,
        accountNumber: data.bankDetails.accountNumber,
        ifscCode: data.bankDetails.ifscCode,
        token: storeToken,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('selfprint_registered_store', JSON.stringify(storeProfile));
      localStorage.setItem('selfprint_store_token', storeToken);
    } catch (err) {
      console.warn('LocalStorage error during store registration:', err);
    }

    return {
      success: true,
      storeId: generatedStoreId,
      storeName: data.storeDetails.storeName,
      qrToken,
      storeToken,
      message: 'Store partner registered successfully.'
    };
  }
};
