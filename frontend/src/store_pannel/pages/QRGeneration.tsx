import React, { useState } from 'react';
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
import {
  mockStoreInfo,
  mockPrinterStatus,
  mockSummaryBreakdown
} from '../data/dashboardData';
import { initialQRConfig, initialQRHistory } from '../data/qrData';
import { QRConfig, QRTemplateType, QRHistoryItem } from '../types/qr.types';

export const QRGenerationPage: React.FC = () => {
  const navigate = useNavigate();

  // QR State
  const [config, setConfig] = useState<QRConfig>(initialQRConfig);
  const [history, setHistory] = useState<QRHistoryItem[]>(initialQRHistory);

  // Layout & Navigation State
  const [activeNav, setActiveNav] = useState('qr');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
    setConfig(initialQRConfig);
  };

  const handleSaveConfig = () => {
    // Add entry to history
    const newHistoryItem: QRHistoryItem = {
      id: `qrh-${Date.now()}`,
      name: `${config.storeName} (${config.template})`,
      location: config.storeLocation,
      createdOn: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      expiry: config.expiry,
      status: 'Active',
      url: config.storeUrl,
      downloadsCount: 1
    };
    setHistory((prev) => [newHistoryItem, ...prev]);
  };

  const handleRegenerateQR = () => {
    handleSaveConfig();
    alert('QR code updated and added to history!');
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        storeInfo={mockStoreInfo}
        summary={mockSummaryBreakdown}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onOpenQRModal={() => setIsPosterModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Top Header */}
          <Header
            storeInfo={mockStoreInfo}
            isPrinterOnline={mockPrinterStatus.isOnline}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenQRModal={() => setIsPosterModalOpen(true)}
          />

          {/* Top Section: Your Store QR Code (Left) + QR Code Settings & Customization (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4 flex flex-col">
              <QRCodeCard
                config={config}
                onOpenPreview={() => setIsPosterModalOpen(true)}
                onDownload={() => setIsPosterModalOpen(true)}
                onPrint={() => setIsPosterModalOpen(true)}
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
            onSelectTemplate={(templateId: QRTemplateType) =>
              handleConfigChange({ template: templateId })
            }
            storeUrl={config.storeUrl}
          />

          {/* Bottom Section: QR Code History */}
          <QRHistoryTable
            history={history}
            onRegenerate={handleRegenerateQR}
            onDownloadItem={() => setIsPosterModalOpen(true)}
            onPrintItem={() => setIsPosterModalOpen(true)}
            onDeleteItem={handleDeleteHistoryItem}
          />
        </div>
      </main>

      {/* Interactive Modals */}
      <QRPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        config={config}
      />

      <TestQRModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        config={config}
      />

      <PrinterSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        printer={mockPrinterStatus}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
      />
    </div>
  );
};

export default QRGenerationPage;
