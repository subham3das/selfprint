import { Routes, Route, Navigate } from 'react-router-dom';
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
  PrinterSetupPage,
  StoreAuthGuard
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
  AdminLoginPage,
  AdminActivatePage,
  AdminProtectedRoute,
  Admin403Page,
  PermissionProvider
} from '@/admin_pannel';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Store Partner Auth & Onboarding Routes (Public) */}
      <Route path="/store/login" element={<StoreLoginPage />} />
      <Route path="/store/onboarding" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/welcome" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/details" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/bank" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/review" element={<StoreOnboardingPage />} />
      <Route path="/store/onboarding/success" element={<StoreOnboardingPage />} />

      {/* Protected Store Panel Routes (Requires Valid Authenticated Store Session) */}
      <Route element={<StoreAuthGuard />}>
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/store/dashboard" element={<StoreDashboard />} />
        <Route path="/store/queue" element={<QueuePage />} />
        <Route path="/store/que" element={<QueuePage />} />
        <Route path="/store/history" element={<TransactionHistoryPage />} />
        <Route path="/store/transactions" element={<TransactionHistoryPage />} />
        <Route path="/store/qr" element={<QRGenerationPage />} />
        <Route path="/store/settings" element={<SettingsPage />} />
        <Route path="/store/printer-setup" element={<PrinterSetupPage />} />
      </Route>

      {/* Convenience Top-Level Routes */}
      <Route path="/dashboard" element={<Navigate to="/store/dashboard" replace />} />
      <Route path="/user" element={<Navigate to="/upload" replace />} />
      <Route path="/user/*" element={<Navigate to="/upload" replace />} />

      {/* Customer User Panel Routes (Direct QR Scan Flow - Zero Login) */}
      <Route path="/store/:storeId" element={<UserUploadPage />} />
      <Route path="/store/:storeId/upload" element={<UserUploadPage />} />
      <Route path="/store/:storeId/print" element={<UserUploadPage />} />
      <Route path="/store/:storeId/progress" element={<UserProgressPage />} />
      <Route path="/upload" element={<UserUploadPage />} />
      <Route path="/upload/:storeId" element={<UserUploadPage />} />
      <Route path="/u/:storeId" element={<UserUploadPage />} />
      <Route path="/qr/:token" element={<UserUploadPage />} />
      <Route path="/print" element={<UserUploadPage />} />
      <Route path="/progress" element={<UserProgressPage />} />
      <Route path="/print/progress" element={<UserProgressPage />} />

      {/* Admin Panel Public Login & Activation Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/activate" element={<AdminActivatePage />} />
      <Route path="/admin/activate/:token" element={<AdminActivatePage />} />


      {/* Admin Panel RBAC Protected Routes (Wrapped in PermissionProvider & AdminProtectedRoute) */}
      <Route
        path="/admin/*"
        element={
          <PermissionProvider>
            <Routes>
              {/* 403 Forbidden Error Page */}
              <Route path="403" element={<Admin403Page />} />

              {/* Protected Sub-Modules */}
              <Route
                path=""
                element={
                  <AdminProtectedRoute module="dashboard">
                    <AdminDashboardPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <AdminProtectedRoute module="dashboard">
                    <AdminDashboardPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="stores"
                element={
                  <AdminProtectedRoute module="stores">
                    <AdminStoresPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="store"
                element={
                  <AdminProtectedRoute module="stores">
                    <AdminStoresPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <AdminProtectedRoute module="users">
                    <AdminUsersPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="user"
                element={
                  <AdminProtectedRoute module="users">
                    <AdminUsersPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="transactions"
                element={
                  <AdminProtectedRoute module="transactions">
                    <AdminTransactionsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="transaction"
                element={
                  <AdminProtectedRoute module="transactions">
                    <AdminTransactionsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="revenue"
                element={
                  <AdminProtectedRoute module="revenue">
                    <AdminRevenuePage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="printers"
                element={
                  <AdminProtectedRoute module="printers">
                    <AdminPrintersPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="printer"
                element={
                  <AdminProtectedRoute module="printers">
                    <AdminPrintersPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <AdminProtectedRoute module="analytics">
                    <AdminAnalyticsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="support"
                element={
                  <AdminProtectedRoute module="support">
                    <AdminSupportPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="access"
                element={
                  <AdminProtectedRoute module="access">
                    <AdminAccessControlPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="access-control"
                element={
                  <AdminProtectedRoute module="access">
                    <AdminAccessControlPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <AdminProtectedRoute module="audit">
                    <AdminAuditLogsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <AdminProtectedRoute module="audit">
                    <AdminAuditLogsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <AdminProtectedRoute module="settings">
                    <AdminSettingsPage />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="setting"
                element={
                  <AdminProtectedRoute module="settings">
                    <AdminSettingsPage />
                  </AdminProtectedRoute>
                }
              />

              {/* Unknown admin route fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PermissionProvider>
        }
      />

      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
