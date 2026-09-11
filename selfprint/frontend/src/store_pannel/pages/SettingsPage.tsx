import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import {
  SettingsNavCard,
  SettingsCategoryId
} from '../components/settings/SettingsNavCard';
import { StoreInfoCard } from '../components/settings/StoreInfoCard';
import { StoreBrandingCard } from '../components/settings/StoreBrandingCard';
import { PrinterConfigCard } from '../components/settings/PrinterConfigCard';
import { PrinterConnectorSettingsCard } from '../components/settings/PrinterConnectorSettingsCard';
import { PricingConfigCard } from '../components/settings/PricingConfigCard';
import { PaymentSettingsCard } from '../components/settings/PaymentSettingsCard';
import { PreferencesCard } from '../components/settings/PreferencesCard';
import { ReceiptSettingsModal } from '../components/settings/ReceiptSettingsModal';
import { NotificationSettingsModal } from '../components/settings/NotificationSettingsModal';
import { AboutStoreModal } from '../components/settings/AboutStoreModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { QRPosterModal } from '../components/qr/QRPosterModal';
import { PrinterStatusInfo, SummaryBreakdown } from '../types/dashboard.types';
import { useStoreSession } from '../hooks/useStoreSession';
import { useStoreDashboard } from '../hooks/useStoreDashboard';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { initialQRConfig } from '../data/qrData';
import { emptyStoreSettings } from '../data/settingsData';
import {
  StoreGeneralInfo,
  PrinterSettingsConfig,
  PricingSettingsConfig,
  PaymentSettingsConfig,
  PreferencesSettingsConfig,
  NotificationSettingsConfig
} from '../types/settings.types';

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

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const storeInfo = useStoreSession();

  // 1. Live Store Settings from MongoDB
  const {
    settings: serverSettings,
    systemInfo,
    updateGeneral,
    updatePricing,
    updatePayment,
    updatePrinter,
    updatePreferences,
    updateNotifications,
    exportBackup
  } = useStoreSettings();

  // 2. Live Dashboard Data
  const { dashboardData } = useStoreDashboard();

  const settings = serverSettings || emptyStoreSettings;
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as SettingsCategoryId) || 'store';
  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>(initialCategory);

  // Sidebar & Layout State
  const [activeNav, setActiveNav] = useState('settings');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isPrinterSettingsModalOpen, setIsPrinterSettingsModalOpen] = useState(false);
  const [isQRPosterModalOpen, setIsQRPosterModalOpen] = useState(false);

  // Nav Handlers
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

  const handleSelectCategory = (catId: SettingsCategoryId) => {
    setActiveCategory(catId);
    if (catId === 'receipt') {
      setIsReceiptModalOpen(true);
    } else if (catId === 'notifications') {
      setIsNotificationModalOpen(true);
    } else if (catId === 'about') {
      setIsAboutModalOpen(true);
    } else if (catId === 'backup') {
      exportBackup();
    }
  };

  // Section Save Handlers backed by MongoDB mutations
  const handleSaveGeneral = async (updated: StoreGeneralInfo) => {
    try {
      await updateGeneral(updated);
    } catch (err) {
      console.error('Failed to update general settings:', err);
    }
  };

  const handleSavePrinter = async (updated: PrinterSettingsConfig) => {
    try {
      await updatePrinter(updated);
    } catch (err) {
      console.error('Failed to update printer settings:', err);
    }
  };

  const handleSavePricing = async (updated: PricingSettingsConfig) => {
    try {
      await updatePricing(updated);
    } catch (err) {
      console.error('Failed to update pricing settings:', err);
    }
  };

  const handleSavePayment = async (updated: PaymentSettingsConfig) => {
    try {
      await updatePayment(updated);
    } catch (err) {
      console.error('Failed to update payment settings:', err);
    }
  };

  const handleSavePreferences = async (updated: PreferencesSettingsConfig) => {
    try {
      await updatePreferences(updated);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  const handleSaveNotifications = async (updated: NotificationSettingsConfig) => {
    try {
      await updateNotifications(updated);
    } catch (err) {
      console.error('Failed to update notifications:', err);
    }
  };

  // Real backend printer status
  const isPrinterConfigured = dashboardData?.store?.printerConfigured ?? false;
  const rawPrinter = dashboardData?.printer;
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
        onOpenQRModal={() => setIsQRPosterModalOpen(true)}
        onOpenSettingsModal={() => setIsPrinterSettingsModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Header */}
          <Header
            title="Settings"
            subtitle="Manage your store, printer and preferences"
            storeInfo={storeInfo}
            isPrinterOnline={isPrinterOnline}
            isPrinterConfigured={isPrinterConfigured}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsPrinterSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRPosterModalOpen(true)}
          />

          {/* Main 3-Column Masonry Grid Matching Reference Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1 (Left 4 cols): Category List & Printer Settings */}
            <div className="lg:col-span-4 space-y-6">
              <SettingsNavCard
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
              />

              {activeCategory !== 'connector' && (
                <PrinterConfigCard
                  printer={settings.printer}
                  onSave={handleSavePrinter}
                />
              )}
            </div>

            {activeCategory === 'connector' ? (
              /* Dedicated Printer Connector View */
              <div className="lg:col-span-8 space-y-6">
                <PrinterConnectorSettingsCard />
              </div>
            ) : (
              <>
                {/* Column 2 (Center 4 cols): Store Settings & Pricing */}
                <div className="lg:col-span-4 space-y-6">
                  <StoreInfoCard
                    general={settings.general}
                    onSave={handleSaveGeneral}
                  />

                  <PricingConfigCard
                    pricing={settings.pricing}
                    onSave={handleSavePricing}
                  />
                </div>

                {/* Column 3 (Right 4 cols): Branding/QR & Payment Settings */}
                <div className="lg:col-span-4 space-y-6">
                  <StoreBrandingCard
                    storeName={settings.general.storeName || storeInfo.name}
                    storeLocation={settings.general.storeLocation || storeInfo.location}
                    onOpenQRStandeeModal={() => setIsQRPosterModalOpen(true)}
                  />

                  <PaymentSettingsCard
                    payment={settings.payment}
                    onSave={handleSavePayment}
                  />
                </div>
              </>
            )}
          </div>

          {/* Bottom Row: Full Width Preferences Card */}
          <PreferencesCard
            preferences={settings.preferences}
            onSave={handleSavePreferences}
          />

          {/* Page Footer Matching Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-200/60 pb-8">
            <p>&copy; 2026 Self Print Store Panel. All rights reserved.</p>
            <p className="font-mono mt-1 sm:mt-0">
              Version {systemInfo?.backendVersion || '1.0.0'}
            </p>
          </div>
        </div>
      </main>

      {/* Interactive Modal Dialogs */}
      <ReceiptSettingsModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={settings.notifications}
        onSave={handleSaveNotifications}
      />

      <AboutStoreModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        storeId={storeInfo.storeCode || 'SP1001'}
        systemInfo={systemInfo}
      />

      <PrinterSettingsModal
        isOpen={isPrinterSettingsModalOpen}
        onClose={() => setIsPrinterSettingsModalOpen(false)}
        printer={printerStatusInfo}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((prev) => !prev)}
      />

      <QRPosterModal
        isOpen={isQRPosterModalOpen}
        onClose={() => setIsQRPosterModalOpen(false)}
        config={initialQRConfig}
      />
    </div>
  );
};

export default SettingsPage;
