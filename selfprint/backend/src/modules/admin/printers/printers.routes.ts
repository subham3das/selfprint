import { Router } from 'express';
import { adminPrintersController } from './printers.controller';
import { authenticate } from '../../../middlewares/auth.middleware';
import { authorize } from '../../../middlewares/permission.middleware';

const adminPrintersRouter = Router();

/**
 * @route   GET /api/v1/admin/printers/stats
 * @desc    Fetch 6 hardware KPI metric cards
 */
adminPrintersRouter.get(
  '/stats',
  authenticate,
  authorize('printers', 'view'),
  adminPrintersController.getStats
);

/**
 * @route   GET /api/v1/admin/printers/filters
 * @desc    Fetch dynamic stores, cities, and brand filter options
 */
adminPrintersRouter.get(
  '/filters',
  authenticate,
  authorize('printers', 'view'),
  adminPrintersController.getFilters
);

/**
 * @route   GET /api/v1/admin/printers
 * @desc    Fetch paginated, searchable, and filtered printers
 */
adminPrintersRouter.get(
  '/',
  authenticate,
  authorize('printers', 'view'),
  adminPrintersController.getPrinters
);

/**
 * @route   GET /api/v1/admin/printers/:id
 * @desc    Fetch single printer details with recent job log
 */
adminPrintersRouter.get(
  '/:id',
  authenticate,
  authorize('printers', 'view'),
  adminPrintersController.getPrinterById
);

/**
 * @route   POST /api/v1/admin/printers
 * @desc    Register a new printer device under a store
 */
adminPrintersRouter.post(
  '/',
  authenticate,
  authorize('printers', 'create'),
  adminPrintersController.registerPrinter
);

/**
 * @route   PUT /api/v1/admin/printers/:id
 * @desc    Update printer settings, location, status, or capabilities
 */
adminPrintersRouter.put(
  '/:id',
  authenticate,
  authorize('printers', 'edit'),
  adminPrintersController.updatePrinter
);

/**
 * @route   DELETE /api/v1/admin/printers/:id
 * @desc    Delete/unregister printer device
 */
adminPrintersRouter.delete(
  '/:id',
  authenticate,
  authorize('printers', 'delete'),
  adminPrintersController.deletePrinter
);

/**
 * @route   POST /api/v1/admin/printers/:id/restart
 * @desc    Dispatch hardware reboot command via WebSocket
 */
adminPrintersRouter.post(
  '/:id/restart',
  authenticate,
  authorize('printers', 'manage'),
  adminPrintersController.restartPrinter
);

/**
 * @route   POST /api/v1/admin/printers/:id/test-print
 * @desc    Dispatch hardware diagnostic test print job
 */
adminPrintersRouter.post(
  '/:id/test-print',
  authenticate,
  authorize('printers', 'manage'),
  adminPrintersController.testPrint
);

/**
 * @route   POST /api/v1/admin/printers/:id/toggle-pause
 * @desc    Toggle printer status between ONLINE and PAUSED
 */
adminPrintersRouter.post(
  '/:id/toggle-pause',
  authenticate,
  authorize('printers', 'approve'),
  adminPrintersController.togglePause
);

export default adminPrintersRouter;
export { adminPrintersRouter };
