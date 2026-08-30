import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { UserHeader } from '../components/UserHeader';
import { DocumentUploadZone } from '../components/DocumentUploadZone';
import { PrintSettingsCard } from '../components/PrintSettingsCard';
import { PriceCalculationCard } from '../components/PriceCalculationCard';
import { PaperSizeModal } from '../components/PaperSizeModal';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
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
  PrintPaperSize,
  PagePrintConfig
} from '../types/userPrint.types';

export const UserUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId?: string }>();

  // Store kiosk info
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
  const [pageConfigs, setPageConfigs] = useState<Record<number, PagePrintConfig>>(
    initialUserPrintConfig.pageConfigs || {}
  );

  // Modals
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Selected Pages Array derived from pageConfigs
  const selectedPagesList = useMemo(() => {
    return Object.values(pageConfigs)
      .filter((cfg) => cfg.isSelected)
      .map((cfg) => cfg.pageNum)
      .sort((a, b) => a - b);
  }, [pageConfigs]);

  // Counts of B&W vs Color
  const { bwCount, colorCount } = useMemo(() => {
    let bw = 0;
    let clr = 0;
    Object.values(pageConfigs).forEach((cfg) => {
      if (cfg.isSelected) {
        if (cfg.mode === 'color') clr++;
        else bw++;
      }
    });
    return { bwCount: bw, colorCount: clr };
  }, [pageConfigs]);

  // Live Price Calculation
  const priceSummary: UserPriceSummary = useMemo(() => {
    const isA3 = config.paperSize === 'A3';

    const bwRate = isA3 ? storeInfo.bwA3Price : storeInfo.bwA4Price;
    const colorRate = isA3 ? storeInfo.colorA3Price : storeInfo.colorA4Price;

    const totalSelected = bwCount + colorCount;
    const totalBillable = totalSelected * config.copies;

    const bwSubtotal = bwCount * bwRate * config.copies;
    const colorSubtotal = colorCount * colorRate * config.copies;
    const subtotal = bwSubtotal + colorSubtotal;
    const serviceCharge = totalBillable > 0 ? storeInfo.serviceCharge : 0;
    const totalAmount = subtotal + serviceCharge;

    const avgPricePerPage = totalSelected > 0 ? subtotal / totalBillable : bwRate;

    return {
      pricePerPage: avgPricePerPage,
      bwPagesCount: bwCount,
      colorPagesCount: colorCount,
      selectedPagesCount: totalSelected,
      totalBillablePages: totalBillable,
      copies: config.copies,
      bwSubtotal,
      colorSubtotal,
      subtotal,
      serviceCharge,
      totalAmount
    };
  }, [config, bwCount, colorCount, storeInfo]);

  // Handlers for File Upload
  const handleFileSelect = (newFile: UploadedFileInfo) => {
    setFile(newFile);
    const newConfigs: Record<number, PagePrintConfig> = {};
    for (let i = 1; i <= newFile.totalPages; i++) {
      newConfigs[i] = {
        pageNum: i,
        mode: config.colorMode === 'Color' ? 'color' : 'bw',
        isSelected: true
      };
    }
    setPageConfigs(newConfigs);
    setConfig((prev) => ({
      ...prev,
      selectedPagesCount: newFile.totalPages,
      selectedPages: Array.from({ length: newFile.totalPages }, (_, i) => i + 1),
      pageConfigs: newConfigs
    }));
  };

  const handleFileRemove = () => {
    setFile(null);
    setPageConfigs({});
    setConfig((prev) => ({
      ...prev,
      selectedPagesCount: 0,
      selectedPages: [],
      pageConfigs: {}
    }));
  };

  // Global Config Change (e.g. Color Mode toggle)
  const handleConfigChange = (updated: Partial<UserPrintJobConfig>) => {
    if (updated.colorMode && updated.colorMode !== config.colorMode) {
      const newMode = updated.colorMode === 'Color' ? 'color' : 'bw';
      setPageConfigs((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          const num = Number(k);
          next[num] = { ...next[num], mode: newMode };
        });
        return next;
      });
    }
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  // Apply Changes from Full PDF Preview Modal
  const handleApplyPdfSelection = (
    updatedConfigs: Record<number, PagePrintConfig>,
    updatedCopies: number
  ) => {
    setPageConfigs(updatedConfigs);
    const activePages = Object.values(updatedConfigs)
      .filter((c) => c.isSelected)
      .map((c) => c.pageNum);

    setConfig((prev) => ({
      ...prev,
      copies: updatedCopies,
      selectedPagesCount: activePages.length,
      selectedPages: activePages,
      pageConfigs: updatedConfigs
    }));
  };

  const handleSelectPaperSize = (size: PrintPaperSize) => {
    setConfig((prev) => ({
      ...prev,
      paperSize: size
    }));
  };

  const isActionDisabled = !file || (bwCount === 0 && colorCount === 0);

  const pagesSummaryBadge = useMemo(() => {
    if (!file) return '';
    if (bwCount > 0 && colorCount > 0) {
      return `${bwCount} B&W, ${colorCount} Color`;
    }
    if (colorCount > 0) return `${colorCount} Color`;
    return `${bwCount} B&W`;
  }, [file, bwCount, colorCount]);

  return (
    <div className="h-[100dvh] w-full bg-[#F8FAFC] flex flex-col justify-center items-center font-sans antialiased text-slate-900 overflow-hidden md:p-4">
      {/* Mobile-first kiosk container */}
      <div className="w-full max-w-md bg-white md:rounded-[32px] md:border md:border-slate-200/80 md:shadow-2xl md:shadow-indigo-500/5 h-full md:h-[92vh] md:max-h-[880px] flex flex-col relative overflow-hidden">
        {/* Scrollable Form Content */}
        <div className="flex-1 w-full px-4 sm:px-6 pt-3 sm:pt-4 pb-6 space-y-3.5 sm:space-y-4 overflow-y-auto overscroll-contain">
          {/* Header */}
          <UserHeader
            store={storeInfo}
            onBack={() => navigate(-1)}
          />

          {/* Document Upload Zone with Tap to Preview Trigger */}
          <DocumentUploadZone
            file={file}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onOpenPreview={() => setIsPdfPreviewOpen(true)}
            pageSummaryBadge={pagesSummaryBadge}
          />

          {/* Print Settings Card */}
          <PrintSettingsCard
            file={file}
            config={config}
            onChangeConfig={handleConfigChange}
            onOpenPagesModal={() => setIsPdfPreviewOpen(true)}
            onOpenPaperModal={() => setIsPaperModalOpen(true)}
            pagesSummaryLabel={pagesSummaryBadge ? `${priceSummary.selectedPagesCount} Pages (${pagesSummaryBadge})` : undefined}
          />

          {/* Price Calculation Card */}
          <PriceCalculationCard summary={priceSummary} />
        </div>

        {/* Permanently Pinned Sticky Bottom Pay & Print Action Bar */}
        <div className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:rounded-b-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isActionDisabled}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
          >
            <span>
              {isActionDisabled && file
                ? 'Select pages to print'
                : `Pay & Print ₹${priceSummary.totalAmount.toFixed(2)}`}
            </span>
            {!isActionDisabled && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Full PDF Preview & Page Customizer Modal (Split View, 90% Screen) */}
      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        file={file}
        store={storeInfo}
        initialPageConfigs={pageConfigs}
        initialCopies={config.copies}
        onApply={handleApplyPdfSelection}
      />

      {/* Paper Size Modal Sheet */}
      <PaperSizeModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        selectedSize={config.paperSize}
        onSelect={handleSelectPaperSize}
      />

      {/* Payment Modal */}
      <PaymentReviewModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        file={file}
        config={{ ...config, selectedPagesCount: selectedPagesList.length, selectedPages: selectedPagesList }}
        summary={priceSummary}
        store={storeInfo}
      />
    </div>
  );
};

export default UserUploadPage;
