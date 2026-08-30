export type OnboardingStep =
  | 'welcome'
  | 'store_details'
  | 'bank_details'
  | 'review'
  | 'success';

export interface StoreDetailsFormValues {
  storeName: string;
  ownerName: string;
  storeAddress: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  gstNumber?: string;
  storeImage: string;
  password: string;
  confirmPassword: string;
}

export interface BankDetailsFormValues {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId?: string;
  chequeImage?: string;
  passbookImage?: string;
}

export interface CompleteStoreOnboardingData {
  storeDetails: StoreDetailsFormValues;
  bankDetails: BankDetailsFormValues;
  confirmed: boolean;
}

export interface StoreRegistrationResponse {
  success: boolean;
  storeId: string;
  storeName: string;
  qrToken: string;
  storeToken: string;
  message?: string;
}
