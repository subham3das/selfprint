import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { UserHeader } from '../components/UserHeader';
import { DocumentUploadZone } from '../components/DocumentUploadZone';
import { PrintSettingsCard } from '../components/PrintSettingsCard';
import { PriceCalculationCard } from '../components/PriceCalculationCard';
import { PagesSelectorModal } from '../components/PagesSelectorModal';
import { PaperSizeModal } from '../components/PaperSizeModal';
import { PaymentReviewModal } from '../components/PaymentReviewModal';
import {
  mockStoreKioskInfo,
  initialMockFile,
  initialUserPrintConfig
} from '../data/userMockData';
import {
  UploadedFileInfo,
  UserPrintJobConfig,
  UserPriceSummary,
  PrintPagesSelection,
  PrintPaperSize
} from '../types/userPrint.types';

export const UserUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId?: string }>();

  // Store kiosk info (override storeId if param provided)
  const storeInfo = useMemo(() => {
    return {
      ...mockStoreKioskInfo,
      storeId: storeId || mockStoreKioskInfo.storeId
    };
  }, [storeId]);

  // State
  const [file, setFile] = useState<UploadedFileInfo | null>(initialMockFile);
  const [config, setConfig] = useState<UserPrintJobConfig>(
    initialUserPrintConfig
  );

  // Modals
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Live Price Calculation
  const priceSummary: UserPriceSummary = useMemo(() => {
    const isColor = config.colorMode === 'Color';
    const isA3 = config.paperSize === 'A3';

    let rate = 2.0;
    if (isColor && isA3) rate = storeInfo.colorA3Price;
    else if (isColor) rate = storeInfo.colorA4Price;
    else if (isA3) rate = storeInfo.bwA3Price;
    else rate = storeInfo.bwA4Price;

    const pages = file ? config.selectedPagesCount : 0;
    const totalPages = pages * config.copies;
    const subtotal = totalPages * rate;
    const serviceCharge = storeInfo.serviceCharge;
    const totalAmount = subtotal + serviceCharge;

    return {
      pricePerPage: rate,
      selectedPagesCount: pages,
      totalBillablePages: totalPages,
      copies: config.copies,
      subtotal,
      serviceCharge,
      totalAmount
    };
  }, [config, file, storeInfo]);

  // Handlers
  const handleConfigChange = (updated: Partial<UserPrintJobConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleFileSelect = (newFile: UploadedFileInfo) => {
    setFile(newFile);
    setConfig((prev) => ({
      ...prev,
      pageSelection: 'All',
      customRange: `1-${newFile.totalPages}`,
      selectedPagesCount: newFile.totalPages
    }));
  };

  const handleFileRemove = () => {
    setFile(null);
    setConfig((prev) => ({
      ...prev,
      selectedPagesCount: 0
    }));
  };

  const handleSavePagesSelection = (
    selection: PrintPagesSelection,
    customRange: string,
    count: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      pageSelection: selection,
      customRange,
      selectedPagesCount: count
    }));
  };

  const handleSelectPaperSize = (size: PrintPaperSize) => {
    setConfig((prev) => ({
      ...prev,
      paperSize: size
    }));
  };

  return (
    <div className="h-[100dvh] w-full bg-[#F8FAFC] flex flex-col justify-center items-center font-sans antialiased text-slate-900 overflow-hidden md:p-4">
      {/* Mobile-first kiosk container matching user_ui.png */}
      <div className="w-full max-w-md bg-white md:rounded-[32px] md:border md:border-slate-200/80 md:shadow-2xl md:shadow-indigo-500/5 h-full md:h-[92vh] md:max-h-[880px] flex flex-col relative overflow-hidden">
        {/* Scrollable Form Content */}
        <div className="flex-1 w-full px-4 sm:px-6 pt-3 sm:pt-4 pb-6 space-y-3.5 sm:space-y-4 overflow-y-auto overscroll-contain">
          {/* Header */}
          <UserHeader
            store={storeInfo}
            onBack={() => navigate(-1)}
          />

          {/* Document Upload Zone */}
          <DocumentUploadZone
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
          />

          {/* Print Settings Card */}
          <PrintSettingsCard
            file={file}
            config={config}
            onChangeConfig={handleConfigChange}
            onOpenPagesModal={() => setIsPagesModalOpen(true)}
            onOpenPaperModal={() => setIsPaperModalOpen(true)}
          />

          {/* Price Calculation Card */}
          <PriceCalculationCard summary={priceSummary} />
        </div>

        {/* Permanently Pinned Sticky Bottom Pay & Print Action Bar */}
        <div className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:rounded-b-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={!file}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
          >
            <span>
              Pay &amp; Print ₹{priceSummary.totalAmount.toFixed(2)}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Modal Sheets */}
      <PagesSelectorModal
        isOpen={isPagesModalOpen}
        onClose={() => setIsPagesModalOpen(false)}
        file={file}
        config={config}
        onSave={handleSavePagesSelection}
      />

      <PaperSizeModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        selectedSize={config.paperSize}
        onSelect={handleSelectPaperSize}
      />

      <PaymentReviewModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        file={file}
        config={config}
        summary={priceSummary}
        store={storeInfo}
      />
    </div>
  );
};

export default UserUploadPage;
