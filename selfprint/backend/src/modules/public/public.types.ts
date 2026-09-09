export type PublicStoreStatusReason =
  | 'EXPIRED_QR'
  | 'INVALID_QR'
  | 'STORE_INACTIVE'
  | 'STORE_CLOSED'
  | 'NO_PRINTER'
  | 'PRINTER_OFFLINE'
  | 'READY';

export interface PublicStorePricing {
  bwA4Price: number;
  bwA3Price: number;
  colorA4Price: number;
  colorA3Price: number;
  extraCopyA4Price: number;
  extraCopyA3Price: number;
  minimumOrderPrice: number;
  serviceCharge: number;
  duplexDiscount: number;
  emergencyPrintCharge: number;
}

export interface PublicStoreDetails {
  id: string;
  storeCode: string;
  name: string;
  ownerName: string;
  city: string;
  state: string;
  address: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  uploadLimitMb: number;
  welcomeMessage: string;
  upiId?: string;
  isAcceptingPrints: boolean;
  hardwareStatus: {
    state: 'READY' | 'OFFLINE' | 'NO_PRINTER' | 'CLOSED';
    message: string;
    printerName?: string;
    printerModel?: string;
  };
}

export interface CalculatePriceInput {
  storeId: string;
  totalPages: number;
  copies: number;
  colorMode: 'bw' | 'color' | 'Black & White' | 'Color';
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  duplex: 'Single' | 'Double';
  pageConfigs?: Record<number, { pageNum: number; mode: 'bw' | 'color'; isSelected: boolean }>;
}

export interface PriceCalculationResult {
  bwPagesCount: number;
  colorPagesCount: number;
  selectedPagesCount: number;
  totalBillablePages: number;
  copies: number;
  pricePerPage: number;
  bwSubtotal: number;
  colorSubtotal: number;
  duplexDiscountAmount: number;
  subtotal: number;
  serviceCharge: number;
  gstAmount: number;
  totalAmount: number;
}
