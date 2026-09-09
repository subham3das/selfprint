export interface StoreAuthUser {
  storeId: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  token: string;
}

export interface StoreLoginRequestPayload {
  email: string;
  password: string;
}

export interface StoreLoginResponse {
  success: boolean;
  token?: string;
  store?: StoreAuthUser;
  message?: string;
}
