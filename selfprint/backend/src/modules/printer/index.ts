import { Router } from 'express';
import { printerController } from './printer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireActiveStore } from '../../middlewares/storeProtection.middleware';
import { validateRequest } from '../../validators/validateRequest';
import {
  savePrinterSchema,
  pairHostSchema,
  hostHeartbeatSchema,
  updatePrinterStatusSchema
} from './printer.validation';

const printerRouter = Router();

// Store Printers Management (Protected by requireActiveStore)
printerRouter.get('/store', authenticate, requireActiveStore, printerController.getStorePrinters);
printerRouter.post('/save', authenticate, requireActiveStore, validateRequest(savePrinterSchema), printerController.savePrinter);
printerRouter.patch('/:id/status', authenticate, requireActiveStore, validateRequest(updatePrinterStatusSchema), printerController.updatePrinterStatus);
printerRouter.delete('/:id', authenticate, requireActiveStore, printerController.deletePrinter);

// Host Bridge Pairing & Heartbeat Telemetry & Physical Printer Sync
printerRouter.post('/sync', printerController.syncPrinters);
printerRouter.post('/host/pair', authenticate, requireActiveStore, validateRequest(pairHostSchema), printerController.pairHost);
printerRouter.post('/host/heartbeat', authenticate, requireActiveStore, validateRequest(hostHeartbeatSchema), printerController.processHeartbeat);

export default printerRouter;
export { printerRouter, printerRouter as printerModuleRouter };
