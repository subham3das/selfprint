import { useRuntimeStore } from '../stores/useRuntimeStore';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { QRCodeCard } from '../components/qr/QRCodeCard';
import { QRSettingsCard } from '../components/qr/QRSettingsCard';
import { QRTemplatesGallery } from '../components/qr/QRTemplatesGallery';
import { QRHistoryTable } from '../components/qr/QRHistoryTable';
import { QRPosterModal } from '../components/qr/QRPosterModal';
import { TestQRModal } from '../components/qr/TestQRModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { PrinterStatusInfo, SummaryBreakdown } from '../types/dashboard.types';
import { useStoreSession } from '../hooks/useStoreSession';
import { useStoreDashboard } from '../hooks/useStoreDashboard';
import { useStoreQR } from '../hooks/useStoreQR';
import { QRConfig, QRTemplateType, QRHistoryItem } from '../types/qr.types';

const defaultSummary: SummaryBreakdown = {
  totalJobs: 0,
  completed: 0,
  completedPercent: 0,
  printing: 0,
  printingPercent: 0,
  waiting: 0,
  waitingPercent: 0,
  failed: 0,
  failedPercent: 0,
  totalRevenue: '₹0.00'
};

export const QRGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const storeInfo = useStoreSession();

  // Layout & Navigation State
  const [activeNav, setActiveNav] = useState('qr');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const runtime = useRuntimeStore();
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 1. Live Store Dashboard Overview
  const { dashboardData } = useStoreDashboard();

  // 2. Live Store QR from MongoDB
  const {
    config: serverConfig,
    history,
    updateConfig,
    regenerateQR,
    deleteHistory,
    refetchHistory,
    refetchConfig,
    isRegenerating
  } = useStoreQR();

  const storeCode = storeInfo.storeCode || 'SP1001';
  const initialLocalConfig: QRConfig = {
    storeName: storeInfo.name || 'My Print Store',
    branchName: storeInfo.location || 'Main Branch',
    storeLocation: storeInfo.location || 'Store Location',
    storeId: storeCode,
    storeUrl: `${window.location.origin}/store/${storeCode}`,
    primaryColor: '#6366F1',
    secondaryColor: '#1E293B',
    uploadLimitMb: 50,
    expiry: 'No Expiry',
    version: 1,
    welcomeMessage: 'Scan to upload documents instantly & pick up your high quality prints!',
    template: 'default'
  };

  const [config, setConfig] = useState<QRConfig>(initialLocalConfig);
  const [posterModalConfig, setPosterModalConfig] = useState<QRConfig>(initialLocalConfig);

  // Sync server config when loaded
  useEffect(() => {
    if (serverConfig) {
      const liveUrl = `${window.location.origin}/store/${serverConfig.storeId || storeCode}?qr=${serverConfig.qrToken || ''}`;
      const updated = {
        ...serverConfig,
        storeUrl: liveUrl
      };
      setConfig(updated);
      setPosterModalConfig(updated);
    }
  }, [serverConfig, storeCode]);

  const handleNavChange = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'dashboard') {
      navigate('/store');
    } else if (navId === 'queue') {
      navigate('/store/queue');
    } else if (navId === 'history') {
      navigate('/store/history');
    } else if (navId === 'qr') {
      navigate('/store/qr');
    } else if (navId === 'settings') {
      navigate('/store/settings');
    }
  };

  const handleConfigChange = (updated: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetConfig = () => {
    const defaults: Partial<QRConfig> = {
      primaryColor: '#6366F1',
      secondaryColor: '#1E293B',
      template: 'default',
      uploadLimitMb: 50,
      expiry: 'No Expiry',
      logoUrl: undefined
    };
    setConfig((prev) => ({ ...prev, ...defaults }));
    updateConfig(defaults);
  };

  const handleSaveConfig = async () => {
    try {
      await updateConfig({
        storeName: config.storeName,
        storeLocation: config.storeLocation,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        uploadLimitMb: config.uploadLimitMb,
        welcomeMessage: config.welcomeMessage,
        expiry: config.expiry,
        logoUrl: config.logoUrl,
        template: config.template
      });
      await refetchHistory();
    } catch (err) {
      console.error('Failed to save QR configuration:', err);
    }
  };

  const handleRegenerateQR = async () => {
    try {
      const updated = await regenerateQR();
      if (updated) {
        const liveUrl = `${window.location.origin}/store/${updated.storeId || storeCode}?qr=${updated.qrToken || ''}`;
        const newConf = {
          ...updated,
          storeUrl: liveUrl
        };
        setConfig(newConf);
        setPosterModalConfig(newConf);
        await Promise.all([refetchHistory(), refetchConfig()]);
      }
    } catch (err) {
      console.error('Failed to regenerate QR:', err);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await deleteHistory(id);
      await refetchHistory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete the currently active QR code.');
    }
  };

  const handleOpenActivePoster = () => {
    setPosterModalConfig(config);
    setIsPosterModalOpen(true);
  };

  const handleDownloadHistoryItem = (item: QRHistoryItem) => {
    setPosterModalConfig({
      ...config,
      storeName: item.name,
      storeLocation: item.location,
      storeUrl: item.url,
      expiry: item.expiry,
      version: item.version
    });
    setIsPosterModalOpen(true);
  };

  // Real backend printer status
  const rawPrinter = dashboardData?.printer;
  const isPrinterVirtual = Boolean(
    (rawPrinter as any)?.isVirtual ||
    rawPrinter?.name?.toLowerCase().includes('virtual') ||
    rawPrinter?.name?.toLowerCase().includes('print to pdf')
  );
  const isPrinterConfigured = Boolean(
    runtime.testMode
      ? isPrinterVirtual
      : (dashboardData?.store?.printerConfigured && rawPrinter?.name && rawPrinter.name !== 'No printer configured' && !isPrinterVirtual)
  );
  const isPrinterOnline =
    isPrinterConfigured &&
    Boolean(
      rawPrinter &&
      rawPrinter.name &&
      rawPrinter.name !== 'No printer connected' &&
      rawPrinter.name !== 'No printer configured' &&
      (rawPrinter.isOnline || rawPrinter.printerStatus === 'Ready' || rawPrinter.printerStatus === 'Printing')
    );

  const printerStatusInfo: PrinterStatusInfo = isPrinterConfigured && rawPrinter
    ? {
        name: rawPrinter.name || 'Store Printer',
        model: rawPrinter.model || 'LaserJet',
        isOnline: isPrinterOnline,
        isConfigured: true,
        connectionStatus: isPrinterOnline ? 'Connected' : 'Disconnected',
        printerStatus: rawPrinter.printerStatus || 'Ready',
        paperSize: 'A4',
        tonerPercentage: rawPrinter.tonerPercentage ?? 0,
        paperPercentage: rawPrinter.paperPercentage ?? 0
      }
    : {
        name: 'No printer configured',
        model: 'Not Configured',
        isOnline: false,
        isConfigured: false,
        connectionStatus: 'Disconnected',
        printerStatus: 'Not Configured',
        paperSize: 'A4',
        tonerPercentage: 0
      };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={storeInfo}
        summary={dashboardData?.summary ?? defaultSummary}
        printerStatus={printerStatusInfo}
        isPrinterConfigured={isPrinterConfigured}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onOpenQRModal={handleOpenActivePoster}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Top Header */}
          <Header
            title="QR Code & Kiosk"
            subtitle="Manage customer upload QR and standee poster"
            storeInfo={storeInfo}
            isPrinterOnline={isPrinterOnline}
            isPrinterConfigured={isPrinterConfigured}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={handleOpenActivePoster}
          />

          {/* Top Section: Your Store QR Code (Left) + QR Code Settings & Customization (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 flex flex-col">
              <QRCodeCard
                config={config}
                onOpenPreview={handleOpenActivePoster}
                onDownload={handleOpenActivePoster}
                onPrint={handleOpenActivePoster}
                onTestQR={() => setIsTestModalOpen(true)}
              />
            </div>
            <div className="lg:col-span-8 flex flex-col">
              <QRSettingsCard
                config={config}
                onChange={handleConfigChange}
                onReset={handleResetConfig}
                onSave={handleSaveConfig}
              />
            </div>
          </div>

          {/* Middle Section: QR Code Templates */}
          <QRTemplatesGallery
            selectedTemplate={config.template}
            onSelectTemplate={(templateId: QRTemplateType) => {
              handleConfigChange({ template: templateId });
              updateConfig({ template: templateId });
            }}
            storeUrl={config.storeUrl}
          />

          {/* Bottom Section: QR Code History */}
          <QRHistoryTable
            history={history}
            onRegenerate={handleRegenerateQR}
            onDownloadItem={handleDownloadHistoryItem}
            onPrintItem={handleDownloadHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            isRegenerating={isRegenerating}
          />
        </div>
      </main>

      {/* Interactive Modals */}
      <QRPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        config={posterModalConfig}
      />

      <TestQRModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        config={config}
      />

      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        printer={printerStatusInfo}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
      />
    </div>
  );
};

export default QRGenerationPage;
