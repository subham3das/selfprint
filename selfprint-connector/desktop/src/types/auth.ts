export interface StoreAccount {
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
  status: string;
  isVerified: boolean;
  storeImage?: string;
  logo?: string;
}

export interface StoreAuthSession {
  token: string;
  email: string;
  ownerName: string;
  rememberMe: boolean;
  selectedStore?: StoreAccount;
}

export type AuthStage = 'CHECKING_AUTH' | 'LOGIN' | 'STORE_SELECTION' | 'PAIRING' | 'AUTHENTICATED';
