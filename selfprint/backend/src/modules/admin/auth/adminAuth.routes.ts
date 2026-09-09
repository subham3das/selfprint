import { Router } from 'express';
import { adminAuthController } from './adminAuth.controller';
import { validateRequest } from '../../../validators/validateRequest';
import { adminLoginSchema } from './adminAuth.validation';
import { authenticate } from '../../../middlewares/auth.middleware';

const router = Router();

/**
 * Public Admin Login Endpoint
 * POST /api/v1/admin/auth/login
 */
router.post(
  '/login',
  validateRequest(adminLoginSchema),
  adminAuthController.login
);

/**
 * Public Google Admin Authentication Endpoint
 * POST / GET /api/v1/admin/auth/google
 */
router.post(
  '/google',
  adminAuthController.googleLogin
);
router.get(
  '/google',
  adminAuthController.googleLogin
);

/**
 * Public Invitation Verification & Activation Endpoints
 * GET /api/v1/admin/auth/activate/:token
 * GET /api/v1/admin/auth/verify-invitation/:token
 * POST /api/v1/admin/auth/activate-google
 */
router.get(
  '/activate/:token',
  adminAuthController.verifyInvitation
);
router.get(
  '/verify-invitation/:token',
  adminAuthController.verifyInvitation
);
router.get(
  '/verify-invitation',
  adminAuthController.verifyInvitation
);
router.post(
  '/activate-google',
  adminAuthController.activateGoogle
);



/**
 * Protected Profile Endpoint
 * GET /api/v1/admin/auth/me
 */
router.get(
  '/me',
  authenticate,
  adminAuthController.getMe
);

/**
 * Protected Logout Endpoint
 * POST /api/v1/admin/auth/logout
 */
router.post(
  '/logout',
  authenticate,
  adminAuthController.logout
);

export default router;
