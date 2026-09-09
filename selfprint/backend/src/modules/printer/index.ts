import { Router } from 'express';
import { printerController } from './printer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../validators/validateRequest';
import {
  savePrinterSchema,
  pairHostSchema,
  hostHeartbeatSchema,
  updatePrinterStatusSchema
} from './printer.validation';

const printerRouter = Router();

// Store Printers Management
printerRouter.get('/store', authenticate, printerController.getStorePrinters);
printerRouter.post('/save', authenticate, validateRequest(savePrinterSchema), printerController.savePrinter);
printerRouter.patch('/:id/status', authenticate, validateRequest(updatePrinterStatusSchema), printerController.updatePrinterStatus);
printerRouter.delete('/:id', authenticate, printerController.deletePrinter);

// Host Bridge Pairing & Heartbeat Telemetry
printerRouter.post('/host/pair', authenticate, validateRequest(pairHostSchema), printerController.pairHost);
printerRouter.post('/host/heartbeat', authenticate, validateRequest(hostHeartbeatSchema), printerController.processHeartbeat);

export default printerRouter;
export { printerRouter, printerRouter as printerModuleRouter };

