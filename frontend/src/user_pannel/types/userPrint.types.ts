export type PrintColorMode = 'Black & White' | 'Color';
export type PrintPaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type PrintOrientation = 'Portrait' | 'Landscape';
export type PrintDuplexMode = 'Single' | 'Double';
export type PrintPagesSelection = 'All' | 'Custom';
export type PageColorChoice = 'bw' | 'color';

export interface PagePrintConfig {
  pageNum: number;
  mode: PageColorChoice;
  isSelected: boolean;
}

export interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  extension: string;
  totalPages: number;
  previewUrl?: string;
  rawFile?: File;
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
  selectedPages: number[];
  pageConfigs?: Record<number, PagePrintConfig>;
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
  bwPagesCount: number;
  colorPagesCount: number;
  selectedPagesCount: number;
  totalBillablePages: number;
  copies: number;
  bwSubtotal: number;
  colorSubtotal: number;
  subtotal: number;
  serviceCharge: number;
  totalAmount: number;
}
