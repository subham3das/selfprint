import { z } from 'zod';

export const updateGeneralSettingsSchema = z.object({
  storeName: z.string().min(2).optional(),
  branchName: z.string().optional(),
  storeOwnerName: z.string().min(2).optional(),
  storePhone: z.string().min(10).optional(),
  storeEmail: z.string().email().optional(),
  storeLocation: z.string().optional(),
  storeAddress: z.string().optional(),
  gstNumber: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  timezone: z.string().optional(),
  logoUrl: z.string().optional()
});

export const updatePricingSettingsSchema = z.object({
  bwA4Price: z.number().nonnegative().optional(),
  bwA3Price: z.number().nonnegative().optional(),
  colorA4Price: z.number().nonnegative().optional(),
  colorA3Price: z.number().nonnegative().optional(),
  extraCopyA4Price: z.number().nonnegative().optional(),
  extraCopyA3Price: z.number().nonnegative().optional(),
  minimumOrderPrice: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  duplexDiscount: z.number().nonnegative().optional(),
  emergencyPrintCharge: z.number().nonnegative().optional()
});

export const updatePaymentSettingsSchema = z.object({
  upiId: z.string().optional(),
  merchantName: z.string().optional(),
  paymentGateway: z.enum(['Direct UPI', 'Razorpay', 'PhonePe', 'Cashfree']).optional(),
  autoPaymentVerification: z.boolean().optional(),
  autoStartPrintingAfterPayment: z.boolean().optional(),
  cashAccepted: z.boolean().optional()
});

export const updatePrinterSettingsSchema = z.object({
  selectedPrinter: z.string().optional(),
  printerModel: z.string().optional(),
  defaultPaperSize: z.enum(['A4', 'A3', 'Letter', 'Legal']).optional(),
  defaultPrintType: z.enum(['Black & White', 'Color']).optional(),
  autoStartAfterPayment: z.boolean().optional(),
  doubleSidedDefault: z.boolean().optional(),
  paperSaveMode: z.boolean().optional(),
  isPaused: z.boolean().optional()
});

export const updatePreferencesSettingsSchema = z.object({
  autoRefreshInterval: z.enum(['5 Seconds', '10 Seconds', '30 Seconds', '60 Seconds']).optional(),
  theme: z.enum(['Light', 'Dark', 'System']).optional(),
  language: z.enum(['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu']).optional(),
  showLowStockAlerts: z.boolean().optional(),
  showRevenueOnDashboard: z.boolean().optional()
});

export const updateNotificationSettingsSchema = z.object({
  soundOnNewJob: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  lowPaperAlert: z.boolean().optional(),
  lowInkAlert: z.boolean().optional(),
  printerOfflineAlert: z.boolean().optional()
});

export const updateReceiptSettingsSchema = z.object({
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  invoicePrefix: z.string().optional(),
  notes: z.string().optional(),
  autoPrint: z.boolean().optional(),
  paperWidth: z.string().optional(),
  showTaxBreakdown: z.boolean().optional()
});
