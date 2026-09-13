import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Loader2, Store as StoreIcon, QrCode } from 'lucide-react';
import { UserHeader } from '../components/UserHeader';
import { DocumentUploadZone } from '../components/DocumentUploadZone';
import { PrintSettingsCard } from '../components/PrintSettingsCard';
import { PriceCalculationCard } from '../components/PriceCalculationCard';
import { PaperSizeModal } from '../components/PaperSizeModal';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { PaymentReviewModal } from '../components/PaymentReviewModal';
import { userPublicService, PublicStoreResponse } from '../services/userPublic.service';
import { getSocket } from '@/lib/socket';
import {
  UploadedFileInfo,
  UserPrintJobConfig,
  UserPriceSummary,
  PrintPaperSize,
  PagePrintConfig,
  StoreKioskInfo
} from '../types/userPrint.types';

const defaultPriceSummary: UserPriceSummary = {
  pricePerPage: 2.0,
  bwPagesCount: 0,
  colorPagesCount: 0,
  selectedPagesCount: 0,
  totalBillablePages: 0,
  copies: 1,
  bwSubtotal: 0,
  colorSubtotal: 0,
  subtotal: 0,
  serviceCharge: 0,
  totalAmount: 0
};

const initialUserPrintConfig: UserPrintJobConfig = {
  copies: 1,
  colorMode: 'Black & White',
  paperSize: 'A4',
  orientation: 'Portrait',
  duplex: 'Single',
  pageSelection: 'All',
  customRange: '',
  selectedPagesCount: 0,
  selectedPages: []
};

export const UserUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeId, token } = useParams<{ storeId?: string; token?: string }>();
  const [searchParams] = useSearchParams();
  const qrParam = searchParams.get('qr') || undefined;

  const resolvedIdentifier = qrParam || token || storeId || 'DEFAULT';

  // Live store state
  const [publicData, setPublicData] = useState<PublicStoreResponse | null>(null);
  const [errorType, setErrorType] = useState<'EXPIRED_QR' | 'INVALID_QR' | 'STORE_INACTIVE' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Print Job & Upload State
  const [file, setFile] = useState<UploadedFileInfo | null>(null);
  const [config, setConfig] = useState<UserPrintJobConfig>(initialUserPrintConfig);
  const [pageConfigs, setPageConfigs] = useState<Record<number, PagePrintConfig>>({});
  const [priceSummary, setPriceSummary] = useState<UserPriceSummary>(defaultPriceSummary);

  // Modals
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 1. Fetch Store and validate QR on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      setIsLoadingStore(true);
      try {
        const data = await userPublicService.fetchStorePublic(resolvedIdentifier, qrParam);
        if (isMounted) {
          if (!data || data.available === false) {
            const reason = data?.statusReason || 'EXPIRED_QR';
            setErrorType(reason === 'INVALID_QR' ? 'INVALID_QR' : reason === 'STORE_INACTIVE' ? 'STORE_INACTIVE' : 'EXPIRED_QR');
            setErrorMessage(data?.message || 'This QR Code is no longer valid. Please scan the latest Store QR.');
          } else {
            setPublicData(data);
            setErrorType(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          const statusReason = err.response?.data?.statusReason;
          if (statusReason === 'INVALID_QR') {
            setErrorType('INVALID_QR');
            setErrorMessage('Invalid QR Code. Please scan a valid store QR.');
          } else if (statusReason === 'STORE_INACTIVE') {
            setErrorType('STORE_INACTIVE');
            setErrorMessage('This store is currently unavailable or inactive.');
          } else if (err.response?.status === 403 || statusReason === 'EXPIRED_QR') {
            setErrorType('EXPIRED_QR');
            setErrorMessage('This QR Code is no longer valid. Please scan the latest Store QR.');
          } else {
            // If fallback available, load default state
            setErrorType(null);
          }
        }
      } finally {
        if (isMounted) setIsLoadingStore(false);
      }
    };

    fetchStore();

    try {
      const socket = getSocket();
      if (socket) {
        const handleTestModeChange = () => {
          console.log('[UploadPage] store:testModeChanged received. Refetching store status...');
          fetchStore();
        };
        socket.on('store:testModeChanged', handleTestModeChange);
        socket.on('test_mode_changed', handleTestModeChange);
        socket.on('printers_updated', handleTestModeChange);

        return () => {
          isMounted = false;
          socket.off('store:testModeChanged', handleTestModeChange);
          socket.off('test_mode_changed', handleTestModeChange);
          socket.off('printers_updated', handleTestModeChange);
        };
      }
    } catch {}

    return () => {
      isMounted = false;
    };
  }, [resolvedIdentifier, qrParam]);

  const isPrinterOnline = Boolean(publicData?.printer?.online ?? true);

  // Derived Store Kiosk Info
  const storeInfo: StoreKioskInfo = useMemo(() => {
    if (publicData?.store) {
      const s = publicData.store;
      const p = publicData.pricing;
      return {
        storeId: s.storeCode || s.id || 'SP1001',
        storeName: s.name || 'SelfPrint Store',
        branchName: s.city || s.location || 'Main Branch',
        isPrinterOnline,
        bwA4Price: p?.bwA4Price ?? 2.0,
        bwA3Price: p?.bwA3Price ?? 4.0,
        colorA4Price: p?.colorA4Price ?? 6.0,
        colorA3Price: p?.colorA3Price ?? 12.0,
        serviceCharge: p?.serviceCharge ?? 0.0,
        upiId: publicData?.payment?.upiId || `${(s.storeCode || 'sp1001').toLowerCase()}@upi`
      };
    }
    return {
      storeId: storeId || 'SP1001',
      storeName: 'SelfPrint Kiosk',
      branchName: 'Main Store',
      isPrinterOnline,
      bwA4Price: 2.0,
      bwA3Price: 4.0,
      colorA4Price: 6.0,
      colorA3Price: 12.0,
      serviceCharge: 0.0,
      upiId: 'merchant@upi'
    };
  }, [publicData, isPrinterOnline, storeId]);

  // Derived selected pages list
  const selectedPagesList = useMemo(() => {
    return Object.values(pageConfigs)
      .filter((cfg) => cfg.isSelected)
      .map((cfg) => cfg.pageNum)
      .sort((a, b) => a - b);
  }, [pageConfigs]);

  // Server-Side Price Calculation (Zero Frontend Math)
  const recalculatePriceOnBackend = useCallback(
    async (
      currentFile: UploadedFileInfo | null,
      currentConfig: UserPrintJobConfig,
      currentPageConfigs: Record<number, PagePrintConfig>
    ) => {
      if (!currentFile) {
        setPriceSummary(defaultPriceSummary);
        return;
      }

      try {
        const calculated = await userPublicService.calculatePrice({
          storeId: publicData?.store?.id || storeInfo.storeId,
          totalPages: currentFile.totalPages,
          copies: currentConfig.copies,
          colorMode: currentConfig.colorMode,
          paperSize: currentConfig.paperSize,
          duplex: currentConfig.duplex,
          pageConfigs: currentPageConfigs
        });
        setPriceSummary(calculated);
      } catch (err) {
        console.error('Failed to calculate price on backend:', err);
      }
    },
    [publicData, storeInfo]
  );

  // Handlers
  const handleFileSelect = async (rawFile: File) => {
    if (!isPrinterOnline) {
      alert("This store's printer is currently offline. Printing is temporarily unavailable.");
      return;
    }

    if (publicData?.store?.uploadLimitMb) {
      const maxBytes = publicData.store.uploadLimitMb * 1024 * 1024;
      if (rawFile.size > maxBytes) {
        alert(`File size exceeds store limit of ${publicData.store.uploadLimitMb}MB.`);
        return;
      }
    }

    setIsUploadingFile(true);
    try {
      const uploadedInfo = await userPublicService.uploadDocument(rawFile);
      setFile(uploadedInfo);

      const initialPages: Record<number, PagePrintConfig> = {};
      for (let i = 1; i <= uploadedInfo.totalPages; i++) {
        initialPages[i] = {
          pageNum: i,
          mode: config.colorMode === 'Color' ? 'color' : 'bw',
          isSelected: true
        };
      }
      setPageConfigs(initialPages);
      setConfig((prev) => ({
        ...prev,
        selectedPagesCount: uploadedInfo.totalPages,
        selectedPages: Array.from({ length: uploadedInfo.totalPages }, (_, i) => i + 1),
        pageConfigs: initialPages
      }));

      await recalculatePriceOnBackend(uploadedInfo, config, initialPages);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setPageConfigs({});
    setConfig(initialUserPrintConfig);
    setPriceSummary(defaultPriceSummary);
  };

  const handleConfigChange = async (updated: Partial<UserPrintJobConfig>) => {
    const newConfig = { ...config, ...updated };
    let newPageConfigs = { ...pageConfigs };

    if (updated.colorMode && updated.colorMode !== config.colorMode) {
      const newMode = updated.colorMode === 'Color' ? 'color' : 'bw';
      Object.keys(newPageConfigs).forEach((key) => {
        const pageNum = parseInt(key, 10);
        newPageConfigs[pageNum] = {
          ...newPageConfigs[pageNum],
          mode: newMode
        };
      });
      newConfig.pageConfigs = newPageConfigs;
    }

    setConfig(newConfig);
    setPageConfigs(newPageConfigs);
    await recalculatePriceOnBackend(file, newConfig, newPageConfigs);
  };

  const handleApplyPdfSelection = async (
    updatedConfigs: Record<number, PagePrintConfig>,
    updatedCopies: number
  ) => {
    setPageConfigs(updatedConfigs);
    const activePages = Object.values(updatedConfigs)
      .filter((c) => c.isSelected)
      .map((c) => c.pageNum);

    const newConfig = {
      ...config,
      copies: updatedCopies,
      selectedPagesCount: activePages.length,
      selectedPages: activePages,
      pageConfigs: updatedConfigs
    };

    setConfig(newConfig);
    await recalculatePriceOnBackend(file, newConfig, updatedConfigs);
  };

  const handleSelectPaperSize = async (size: PrintPaperSize) => {
    const newConfig = {
      ...config,
      paperSize: size
    };
    setConfig(newConfig);
    await recalculatePriceOnBackend(file, newConfig, pageConfigs);
  };

  const isActionDisabled = !file || !isPrinterOnline || priceSummary.totalAmount <= 0 || isUploadingFile;

  const pagesSummaryBadge = useMemo(() => {
    if (!file) return '';
    if (priceSummary.bwPagesCount > 0 && priceSummary.colorPagesCount > 0) {
      return `${priceSummary.bwPagesCount} B&W, ${priceSummary.colorPagesCount} Color`;
    }
    if (priceSummary.colorPagesCount > 0) return `${priceSummary.colorPagesCount} Color`;
    return `${priceSummary.bwPagesCount} B&W`;
  }, [file, priceSummary]);

  // Loading State
  if (isLoadingStore) {
    return (
      <div className="h-[100dvh] w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Connecting to print kiosk...</p>
      </div>
    );
  }

  // Error State: Invalid QR
  if (errorType === 'INVALID_QR') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invalid QR Code</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Please scan a valid store QR code located on the counter or standee poster.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error State: Store Inactive
  if (errorType === 'STORE_INACTIVE') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Store Unavailable</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This print store is currently inactive or closed. Printing will resume during business hours.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error State: Expired QR
  if (errorType === 'EXPIRED_QR') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">QR Code Expired</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {errorMessage || 'This QR Code is no longer valid. Please scan the latest Store QR.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Professional Offline Warning Card when Printer is Offline */}
          {!isPrinterOnline && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Printer Temporarily Offline</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                The printer at this store is currently unavailable. You can browse pricing and document options, but printing will resume once the printer reconnects.
              </p>
            </div>
          )}

          {/* Document Upload Zone */}
          <DocumentUploadZone
            file={file}
            onFileSelect={(selectedFile: UploadedFileInfo) => {
              if (selectedFile.rawFile) {
                handleFileSelect(selectedFile.rawFile);
              }
            }}
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

          {/* Price Calculation Card (Live Backend-Calculated) */}
          <PriceCalculationCard summary={priceSummary} />
        </div>

        {/* Permanently Pinned Sticky Bottom Pay & Print Action Bar */}
        <div className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:rounded-b-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={isActionDisabled}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
          >
            {isUploadingFile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Document...</span>
              </>
            ) : !isPrinterOnline ? (
              <span>Printer Temporarily Offline</span>
            ) : (
              <>
                <span>
                  {!file
                    ? 'Upload document to proceed'
                    : `Pay & Print ₹${priceSummary.totalAmount.toFixed(2)}`}
                </span>
                {file && <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Full PDF Preview & Page Customizer Modal */}
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

      {/* Payment Modal with Razorpay Integration */}
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
