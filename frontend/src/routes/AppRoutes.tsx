import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { HomePage, NotFoundPage } from '@/pages';
import {
  StoreDashboard,
  QRGenerationPage,
  QueuePage,
  TransactionHistoryPage,
  SettingsPage,
  StoreOnboardingPage,
  StoreLoginPage,
  PrinterSetupPage
} from '@/store_pannel';
import { UserUploadPage, UserProgressPage } from '@/user_pannel';
import {
  AdminDashboardPage,
  AdminStoresPage,
  AdminUsersPage,
  AdminTransactionsPage,
  AdminRevenuePage,
  AdminPrintersPage,
  AdminSupportPage,
  AdminAnalyticsPage,
  AdminSettingsPage,
  AdminAccessControlPage,
  AdminAuditLogsPage,
  AdminLoginPage
} from '@/admin_pannel';


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Store Partner Auth & Onboarding Routes */}
      <Route path="/store/login" element={<StoreLoginPage />} />
      <Route path="/store/onboarding" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/welcome" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/details" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/bank" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/review" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/success" element={<StoreOnboardingPage />} />
      <Route path="/store/printer-setup" element={<PrinterSetupPage />} />

      {/* Store Panel Routes (Standalone Dashboard layout) */}
      <Route path="/store" element={<StoreDashboard />} />
      <Route path="/store/dashboard" element={<StoreDashboard />} />
      <Route path="/store/queue" element={<QueuePage />} />
      <Route path="/store/que" element={<QueuePage />} />
      <Route path="/store/history" element={<TransactionHistoryPage />} />
      <Route path="/store/transactions" element={<TransactionHistoryPage />} />
      <Route path="/store/qr" element={<QRGenerationPage />} />
      <Route path="/store/settings" element={<SettingsPage />} />



      {/* Customer User Panel Routes (Direct QR Scan Flow - Zero Login) */}
      <Route path="/store/:storeId" element={<UserUploadPage />} />
      <Route path="/store/:storeId/upload" element={<UserUploadPage />} />
      <Route path="/store/:storeId/progress" element={<UserProgressPage />} />
      <Route path="/upload" element={<UserUploadPage />} />
      <Route path="/print" element={<UserUploadPage />} />
      <Route path="/progress" element={<UserProgressPage />} />
      <Route path="/print/progress" element={<UserProgressPage />} />





      {/* Super Admin Panel Routes (Desktop First Management Platform) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/stores" element={<AdminStoresPage />} />
      <Route path="/admin/store" element={<AdminStoresPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/user" element={<AdminUsersPage />} />
      <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
      <Route path="/admin/transaction" element={<AdminTransactionsPage />} />
      <Route path="/admin/revenue" element={<AdminRevenuePage />} />
      <Route path="/admin/printers" element={<AdminPrintersPage />} />
      <Route path="/admin/printer" element={<AdminPrintersPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin/support" element={<AdminSupportPage />} />
      <Route path="/admin/access" element={<AdminAccessControlPage />} />
      <Route path="/admin/access-control" element={<AdminAccessControlPage />} />
      <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
      <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/admin/setting" element={<AdminSettingsPage />} />



      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};


export default AppRoutes;

