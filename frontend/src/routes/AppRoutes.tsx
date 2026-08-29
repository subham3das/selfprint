import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { HomePage, NotFoundPage } from '@/pages';
import {
  StoreDashboard,
  QRGenerationPage,
  QueuePage,
  TransactionHistoryPage,
  SettingsPage
} from '@/store_pannel';
import { UserUploadPage, UserProgressPage } from '@/user_pannel';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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





      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

