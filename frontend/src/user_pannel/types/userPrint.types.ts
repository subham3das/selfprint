export type PrintColorMode = 'Black & White' | 'Color';
export type PrintPaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type PrintOrientation = 'Portrait' | 'Landscape';
export type PrintDuplexMode = 'Single' | 'Double';
export type PrintPagesSelection = 'All' | 'Custom';

export interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  extension: string;
  totalPages: number;
  previewUrl?: string;
}

export interface UserPrintJobConfig {
  copies: number;
  colorMode: PrintColorMode;
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  duplex: PrintDuplexMode;
  pageSelection: PrintPagesSelection;
  customRange: string;
  selectedPagesCount: number;
}

export interface StoreKioskInfo {
  storeId: string;
  storeName: string;
  branchName: string;
  isPrinterOnline: boolean;
  bwA4Price: number;
  bwA3Price: number;
  colorA4Price: number;
  colorA3Price: number;
  serviceCharge: number;
  upiId: string;
}

export interface UserPriceSummary {
  pricePerPage: number;
  selectedPagesCount: number;
  totalBillablePages: number;
  copies: number;
  subtotal: number;
  serviceCharge: number;
  totalAmount: number;
}
