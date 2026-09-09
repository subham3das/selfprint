import { apiClient } from '@/lib/axios';
import {
  UploadedFileInfo,
  UserPriceSummary,
  UserPrintJobConfig,
  PagePrintConfig
} from '../types/userPrint.types';

export interface PublicStoreResponse {
  available: boolean;
  statusReason?: 'EXPIRED_QR' | 'INVALID_QR' | 'STORE_INACTIVE' | 'STORE_CLOSED' | 'NO_PRINTER' | 'PRINTER_OFFLINE' | 'READY';
  message?: string;
  store: {
    id: string;
    storeId: string;
    storeCode: string;
    name: string;
    ownerName: string;
    city: string;
    state: string;
    location: string;
    address: string;
    logo?: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    uploadLimitMb: number;
    welcomeMessage: string;
    businessHours?: string;
    upiId?: string;
    isAcceptingPrints: boolean;
    hardwareStatus: {
      state: 'READY' | 'OFFLINE' | 'NO_PRINTER' | 'CLOSED';
      message: string;
      printerName?: string;
      printerModel?: string;
    };
  };
  printer: {
    connected: boolean;
    online: boolean;
    printerName: string;
    paperSize: string;
    supportsColor: boolean;
    status: string;
  };
  pricing: {
    bwPrice: number;
    colorPrice: number;
    extraCopyPrice: number;
    bwA4Price: number;
    bwA3Price: number;
    colorA4Price: number;
    colorA3Price: number;
    serviceCharge: number;
    duplexDiscount: number;
  };
  payment: {
    razorpayKey: string;
    upiId: string;
  };
  qr: {
    token: string;
    version: number;
    expiresAt: string;
    isActive: boolean;
  };
}

export interface CalculatePricePayload {
  storeId: string;
  totalPages: number;
  copies: number;
  colorMode: 'Black & White' | 'Color';
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  duplex: 'Single' | 'Double';
  pageConfigs?: Record<number, PagePrintConfig>;
}

export const userPublicService = {
  /**
   * Fetch public store configuration & real hardware availability
   */
  async fetchStorePublic(identifier: string, qrToken?: string): Promise<PublicStoreResponse> {
    const url = qrToken
      ? `/public/store/${identifier}?qr=${encodeURIComponent(qrToken)}`
      : `/public/store/${identifier}`;
    const res = await apiClient.get(url);
    return res.data?.data;
  },

  /**
   * Uploads file to backend for server-side page counting & validation
   */
  async uploadDocument(file: File): Promise<UploadedFileInfo> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post('/public/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data?.data?.file;
  },

  /**
   * Calculates prices on the backend (Zero frontend math)
   */
  async calculatePrice(payload: CalculatePricePayload): Promise<UserPriceSummary> {
    const res = await apiClient.post('/public/calculate-price', payload);
    return res.data?.data;
  },

  /**
   * Creates Razorpay Order
   */
  async createPaymentOrder(storeId: string, amount: number) {
    const res = await apiClient.post('/payments/razorpay/create-order', {
      storeId,
      amount
    });
    return res.data?.data;
  },

  /**
   * Verifies Razorpay payment & queues PrintJob transactionally
   */
  async verifyPayment(payload: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    storeId: string;
    customerName?: string;
    customerPhone?: string;
    file: UploadedFileInfo;
    config: UserPrintJobConfig;
    summary: UserPriceSummary;
  }) {
    const res = await apiClient.post('/payments/razorpay/verify', payload);
    return res.data?.data;
  },

  /**
   * Live queue tracking for customer progress page
   */
  async trackOrder(jobId: string) {
    const res = await apiClient.get(`/orders/${jobId}/track`);
    return res.data?.data;
  },

  /**
   * Download / view full receipt
   */
  async fetchReceipt(jobId: string) {
    const res = await apiClient.get(`/orders/${jobId}/receipt`);
    return res.data?.data?.receipt;
  }
};
