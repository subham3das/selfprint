import { connectorController } from './controller';
import { connectorService } from './service';

/**
 * Authentication middleware for Connector REST API endpoints.
 */
export function requireConnectorAuth(req: any, res: any, next: any): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing device token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const verification = connectorService.verifyDeviceToken(token);

  if (!verification.isValid || !verification.connectorId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired device token' });
    return;
  }

  req.connector = {
    connectorId: verification.connectorId,
    machineId: verification.machineId
  };

  next();
}

/**
 * Mounts all Connector Management & Store Integration REST routes on Express.
 */
export function registerConnectorRoutes(router: any): any {
  // 1. Public Registration Endpoint on boot
  router.post('/api/v1/connectors/register', connectorController.register);

  // 2. Authenticated Connector Communication Endpoints
  router.post('/api/v1/connectors/heartbeat', requireConnectorAuth, connectorController.heartbeat);
  router.post('/api/v1/connectors/printers/sync', requireConnectorAuth, connectorController.syncPrinters);

  // 3. Store Dashboard Integration Endpoints
  router.get('/api/v1/stores/:storeId/connectors', connectorController.getStoreConnectors);
  router.post('/api/v1/stores/:storeId/connectors/:id/command', connectorController.executeStoreCommand);
  router.get('/api/v1/stores/:storeId/connectors/:id/diagnostics', connectorController.getStoreConnectorDiagnostics);
  router.post('/api/v1/stores/:storeId/connectors/:id/notify', connectorController.sendStoreNotification);

  // 4. Admin Management Endpoints
  router.get('/api/v1/connectors', connectorController.listConnectors);
  router.get('/api/v1/connectors/:id', connectorController.getConnector);
  router.patch('/api/v1/connectors/:id/store', connectorController.updateStore);
  router.patch('/api/v1/connectors/:id/status', connectorController.updateStatus);
  router.delete('/api/v1/connectors/:id', connectorController.deleteConnector);
  router.get('/api/v1/connectors/:id/printers', connectorController.getPrinters);
  router.post('/api/v1/connectors/:id/command', connectorController.sendCommand);
  router.get('/api/v1/connectors/:id/audit-logs', connectorController.getAuditLogs);

  // Legacy route aliases
  router.get('/connectors', connectorController.listConnectors);
  router.get('/connectors/:id', connectorController.getConnector);
  router.patch('/connectors/:id/store', connectorController.updateStore);
  router.patch('/connectors/:id/status', connectorController.updateStatus);
  router.delete('/connectors/:id', connectorController.deleteConnector);
  router.get('/connectors/:id/printers', connectorController.getPrinters);

  return router;
}

export { registerConnectorRoutes as routes };
