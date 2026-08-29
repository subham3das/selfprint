import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import {
  SettingsNavCard,
  SettingsCategoryId
} from '../components/settings/SettingsNavCard';
import { StoreInfoCard } from '../components/settings/StoreInfoCard';
import { StoreBrandingCard } from '../components/settings/StoreBrandingCard';
import { PrinterConfigCard } from '../components/settings/PrinterConfigCard';
import { PricingConfigCard } from '../components/settings/PricingConfigCard';
import { PaymentSettingsCard } from '../components/settings/PaymentSettingsCard';
import { PreferencesCard } from '../components/settings/PreferencesCard';
import { ReceiptSettingsModal } from '../components/settings/ReceiptSettingsModal';
import { NotificationSettingsModal } from '../components/settings/NotificationSettingsModal';
import { AboutStoreModal } from '../components/settings/AboutStoreModal';
import { PrinterSettingsModal } from '../components/PrinterSettingsModal';
import { QRPosterModal } from '../components/qr/QRPosterModal';
import {
  mockStoreInfo,
  mockPrinterStatus,
  mockSummaryBreakdown
} from '../data/dashboardData';
import { initialQRConfig } from '../data/qrData';
import {
  initialStoreSettings,
  getSharedStoreSettings,
  updateSharedStoreSettings
} from '../data/settingsData';
import {
  StoreFullSettings,
  StoreGeneralInfo,
  PrinterSettingsConfig,
  PricingSettingsConfig,
  PaymentSettingsConfig,
  PreferencesSettingsConfig,
  NotificationSettingsConfig
} from '../types/settings.types';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Settings State
  const [settings, setSettings] = useState<StoreFullSettings>(
    getSharedStoreSettings() || initialStoreSettings
  );
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategoryId>('store');

  // Sidebar & Layout State
  const [activeNav, setActiveNav] = useState('settings');
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isPrinterSettingsModalOpen, setIsPrinterSettingsModalOpen] =
    useState(false);
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
      alert('Backup exported: store_config_SP10239.json saved to local storage.');
    }
  };

  // Section Save Handlers
  const handleSaveGeneral = (updated: StoreGeneralInfo) => {
    setSettings((prev) => {
      const next = { ...prev, general: updated };
      updateSharedStoreSettings(next);
      return next;
    });
  };

  const handleSavePrinter = (updated: PrinterSettingsConfig) => {
    setSettings((prev) => {
      const next = { ...prev, printer: updated };
      updateSharedStoreSettings(next);
      return next;
    });
  };

  const handleSavePricing = (updated: PricingSettingsConfig) => {
    setSettings((prev) => {
      const next = { ...prev, pricing: updated };
      updateSharedStoreSettings(next);
      return next;
    });
  };

  const handleSavePayment = (updated: PaymentSettingsConfig) => {
    setSettings((prev) => {
      const next = { ...prev, payment: updated };
      updateSharedStoreSettings(next);
      return next;
    });
  };

  const handleSavePreferences = (updated: PreferencesSettingsConfig) => {
    setSettings((prev) => {
      const next = { ...prev, preferences: updated };
      updateSharedStoreSettings(next);
      return next;
    });
  };

  const handleSaveNotifications = (updated: NotificationSettingsConfig) => {
    setSettings((prev) => {
      const next = { ...prev, notifications: updated };
      updateSharedStoreSettings(next);
      return next;
    });
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
            storeInfo={mockStoreInfo}
            isPrinterOnline={mockPrinterStatus.isOnline}
            isPaused={isPaused}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenSettingsModal={() => setIsPrinterSettingsModalOpen(true)}
            onOpenQRModal={() => setIsQRPosterModalOpen(true)}
          />

          {/* Main 3-Column Masonry Grid Matching Reference Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Column 1 (Left 3.5 cols): Category List & Printer Settings */}
            <div className="lg:col-span-4 space-y-6">
              <SettingsNavCard
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
              />

              <PrinterConfigCard
                printer={settings.printer}
                onSave={handleSavePrinter}
              />
            </div>

            {/* Column 2 (Center 4.5 cols): Store Settings & Pricing */}
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
                storeName={settings.general.storeName}
                storeLocation={settings.general.storeLocation}
                onOpenQRStandeeModal={() => setIsQRPosterModalOpen(true)}
              />

              <PaymentSettingsCard
                payment={settings.payment}
                onSave={handleSavePayment}
              />
            </div>
          </div>

          {/* Bottom Row: Full Width Preferences Card */}
          <PreferencesCard
            preferences={settings.preferences}
            onSave={handleSavePreferences}
          />

          {/* Page Footer Matching Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-200/60 pb-8">
            <p>&copy; 2024 Self Print Store Panel. All rights reserved.</p>
            <p className="font-mono mt-1 sm:mt-0">Version 1.0.0</p>
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
      />

      <PrinterSettingsModal
        isOpen={isPrinterSettingsModalOpen}
        onClose={() => setIsPrinterSettingsModalOpen(false)}
        printer={mockPrinterStatus}
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
