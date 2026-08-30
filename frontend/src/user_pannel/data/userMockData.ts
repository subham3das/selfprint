import {
  StoreKioskInfo,
  UploadedFileInfo,
  UserPrintJobConfig,
  PagePrintConfig
} from '../types/userPrint.types';

export const mockStoreKioskInfo: StoreKioskInfo = {
  storeId: 'SP10239',
  storeName: 'PrintHub Store',
  branchName: 'Main Branch',
  isPrinterOnline: true,
  bwA4Price: 2.0,
  bwA3Price: 4.0,
  colorA4Price: 10.0,
  colorA3Price: 15.0,
  serviceCharge: 0.0,
  upiId: 'printhub@upi'
};

export const initialMockFile: UploadedFileInfo = {
  id: 'file-notes-12',
  name: 'Notes.pdf',
  size: 1258291, // ~1.2 MB
  formattedSize: '1.2 MB',
  type: 'application/pdf',
  extension: 'pdf',
  totalPages: 12
};

const defaultPageConfigs: Record<number, PagePrintConfig> = {};
for (let i = 1; i <= 12; i++) {
  defaultPageConfigs[i] = {
    pageNum: i,
    mode: 'bw',
    isSelected: true
  };
}

export const initialUserPrintConfig: UserPrintJobConfig = {
  copies: 1,
  colorMode: 'Black & White',
  paperSize: 'A4',
  orientation: 'Portrait',
  duplex: 'Single',
  pageSelection: 'All',
  customRange: '1-12',
  selectedPagesCount: 12,
  selectedPages: Array.from({ length: 12 }, (_, i) => i + 1),
  pageConfigs: defaultPageConfigs
};
