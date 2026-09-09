export interface StoreOnboardingDto {
  storeDetails: {
    storeName: string;
    ownerName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    password: string;
    confirmPassword?: string;
    storeAddress: string;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    gstNumber?: string;
    storeImage?: string;
    logo?: string;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    confirmAccountNumber?: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    upiId?: string;
  };
  confirmed?: boolean;
}

export interface StoreRegistrationResultDto {
  storeId: string;
  storeCode: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  qrToken: string;
  storeToken: string;
  isFirstLogin: boolean;
  printerConfigured: boolean;
  message: string;
}

export interface StoreLoginDto {
  emailOrPhone: string;
  password: string;
}

export interface StoreAuthResponseDto {
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
    isFirstLogin: boolean;
    printerConfigured: boolean;
  };
}
