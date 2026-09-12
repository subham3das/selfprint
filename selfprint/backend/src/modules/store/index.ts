import { Router } from 'express';
import { dashboardRouter } from './dashboard';
import { historyRouter } from './history';
import { settingsRouter } from './settings';
import { qrRouter } from '../qr';
import { storeController } from './store.controller';
import { storeOnboardingSchema, storeLoginSchema, bankDetailsSchema } from './store.validation';
import { validateRequest } from '../../validators';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadSingleImage } from '../../uploads/multer.config';

const storeRouter = Router();

// Store Partner Onboarding Step 2: Validate & Record Bank Details
storeRouter.post(
  '/onboarding/bank-details',
  validateRequest(bankDetailsSchema),
  storeController.validateBankDetails
);
storeRouter.post(
  '/bank-details',
  validateRequest(bankDetailsSchema),
  storeController.validateBankDetails
);

// Store Partner Onboarding Status
storeRouter.get('/onboarding/status', storeController.getOnboardingStatus);

// Store Partner Onboarding Complete (MongoDB + Default Settings + Bank Details + QR Link)
storeRouter.post(
  '/onboard',
  validateRequest(storeOnboardingSchema),
  storeController.onboard
);

// Store Partner Login (MongoDB + bcrypt + JWT)
storeRouter.post(
  '/login',
  validateRequest(storeLoginSchema),
  storeController.login
);

// Store Profile (Authenticated)
storeRouter.get('/me', authenticate, storeController.getProfile);

// Get All Stores Owned by Authenticated User (Authenticated)
storeRouter.get('/my-stores', authenticate, storeController.getMyStores);

// Update First Login Flag & Printer Configured State (Authenticated)
storeRouter.patch('/first-login-completed', authenticate, storeController.completeFirstLogin);

// Direct Cloudinary Asset Upload for Store Branding / Photos
storeRouter.post(
  '/upload-asset',
  uploadSingleImage('image'),
  storeController.uploadAsset
);

// Store Dashboard Sub-module
storeRouter.use('/dashboard', dashboardRouter);

// Store History Sub-module
storeRouter.use('/history', historyRouter);

// Store Settings Sub-module
storeRouter.use('/settings', settingsRouter);

// Store QR Sub-module
storeRouter.use('/qr', qrRouter);

export default storeRouter;
export { storeRouter };
export * from './dashboard';
export * from './history';
export * from './settings';
export * from '../qr';
export * from './store.types';
export * from './store.service';
export * from './store.repository';
export * from './store.controller';
