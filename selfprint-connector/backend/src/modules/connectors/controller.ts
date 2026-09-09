import { ConnectorService, connectorService } from './service';
import { connectorAuditService } from './audit.service';
import { sendCommandToConnector, dispatchNotificationBridge } from './socket';
import { ConnectorValidator } from './validator';

export class ConnectorController {
  constructor(private service: ConnectorService = connectorService) {}

  /**
   * Public Registration API: POST /api/v1/connectors/register
   */
  public register = async (req: any, res: any): Promise<void> => {
    try {
      const validation = ConnectorValidator.validateRegister(req.body);
      if (!validation.isValid || !validation.value) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const result = await this.service.registerConnector(validation.value, String(clientIp));

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      });
    }
  };

  /**
   * Authenticated Heartbeat API: POST /api/v1/connectors/heartbeat
   */
  public heartbeat = async (req: any, res: any): Promise<void> => {
    try {
      const validation = ConnectorValidator.validateHeartbeat(req.body);
      if (!validation.isValid || !validation.value) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
      const result = await this.service.processHeartbeat(validation.value, clientIp ? String(clientIp) : undefined);

      if (result.success) {
        res.status(200).json({ success: true, message: 'Heartbeat acknowledged' });
      } else {
        res.status(404).json({ success: false, error: 'Connector not found or inactive' });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      });
    }
  };

  /**
   * Authenticated Printer Sync API: POST /api/v1/connectors/printers/sync
   */
  public syncPrinters = async (req: any, res: any): Promise<void> => {
    try {
      const validation = ConnectorValidator.validatePrinterSync(req.body);
      if (!validation.isValid || !validation.value) {
        res.status(400).json({ success: false, error: validation.error });
        return;
      }

      const result = await this.service.syncPrinters(validation.value);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: `Synchronized ${result.count} printer(s) successfully`,
          count: result.count
        });
      } else {
        res.status(404).json({ success: false, error: 'Connector not found or inactive' });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      });
    }
  };

  /**
   * Store Dashboard: List Connectors for Store: GET /api/v1/stores/:storeId/connectors
   */
  public getStoreConnectors = async (req: any, res: any): Promise<void> => {
    try {
      const { storeId } = req.params;
      const result = await this.service.listConnectors({ storeId });
      res.status(200).json({ success: true, data: result.connectors, count: result.total });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Store Dashboard: Execute Remote Printer & Hardware Command
   * POST /api/v1/stores/:storeId/connectors/:id/command
   */
  public executeStoreCommand = async (req: any, res: any): Promise<void> => {
    try {
      const { storeId, id } = req.params;
      const { command, payload } = req.body;

      const connector = await this.service.getConnectorById(id);
      if (!connector) {
        res.status(404).json({ success: false, error: 'Connector not found' });
        return;
      }

      // Store Ownership Validation
      if (connector.storeId !== storeId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: Connector is not assigned to this store.'
        });
        return;
      }

      const allowedCommands = [
        'refresh_printers',
        'restart_connector',
        'restart_spooler',
        'pause_printer',
        'resume_printer',
        'test_print',
        'refresh_status',
        'cancel_job',
        'print_pdf',
        'update_config'
      ];

      if (!allowedCommands.includes(command)) {
        res.status(400).json({
          success: false,
          error: `Invalid command. Allowed: ${allowedCommands.join(', ')}`
        });
        return;
      }

      const performedBy = req.user?.id || req.headers['x-user-id'] || 'STORE_ADMIN';
      const dispatchResult = await sendCommandToConnector(connector.connectorId, command, payload, performedBy);

      res.status(dispatchResult.success ? 200 : 500).json(dispatchResult);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Store Dashboard: Run & Fetch Diagnostics
   * GET /api/v1/stores/:storeId/connectors/:id/diagnostics
   */
  public getStoreConnectorDiagnostics = async (req: any, res: any): Promise<void> => {
    try {
      const { storeId, id } = req.params;

      const connector = await this.service.getConnectorById(id);
      if (!connector) {
        res.status(404).json({ success: false, error: 'Connector not found' });
        return;
      }

      // Store Ownership Validation
      if (connector.storeId !== storeId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: Connector is not assigned to this store.'
        });
        return;
      }

      const performedBy = req.user?.id || req.headers['x-user-id'] || 'STORE_ADMIN';
      const diagnostics = await this.service.generateDiagnosticReport(connector.connectorId, performedBy);

      res.status(200).json({ success: true, data: diagnostics });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Store Dashboard: Send Notification Bridge
   * POST /api/v1/stores/:storeId/connectors/:id/notify
   */
  public sendStoreNotification = async (req: any, res: any): Promise<void> => {
    try {
      const { storeId, id } = req.params;
      const { title, message, severity } = req.body;

      if (!title || !message) {
        res.status(400).json({ success: false, error: 'Title and message are required.' });
        return;
      }

      const connector = await this.service.getConnectorById(id);
      if (!connector || connector.storeId !== storeId) {
        res.status(404).json({ success: false, error: 'Connector not found or not assigned to this store.' });
        return;
      }

      const performedBy = req.user?.id || 'STORE_ADMIN';
      const dispatched = await dispatchNotificationBridge(
        connector.connectorId,
        storeId,
        { title, message, severity: severity || 'info' },
        performedBy
      );

      res.status(dispatched ? 200 : 500).json({
        success: dispatched,
        message: dispatched ? 'Notification dispatched to Store & Desktop.' : 'Dispatch failed'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: GET /api/v1/connectors
   */
  public listConnectors = async (req: any, res: any): Promise<void> => {
    try {
      const { status, storeId, search, page, limit } = req.query;
      const result = await this.service.listConnectors({
        status: status as any,
        storeId: storeId as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50
      });

      res.status(200).json({
        success: true,
        data: result.connectors,
        total: result.total
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      });
    }
  };

  /**
   * Admin API: GET /api/v1/connectors/:id
   */
  public getConnector = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const connector = await this.service.getConnectorById(id);
      if (!connector) {
        res.status(404).json({ success: false, error: 'Connector not found' });
        return;
      }

      res.status(200).json({ success: true, data: connector });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: PATCH /api/v1/connectors/:id/store
   */
  public updateStore = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const { storeId } = req.body;
      const performedBy = req.user?.id || req.headers['x-admin-user'] || 'ADMIN';

      const success = await this.service.assignStore(id, storeId || null, performedBy);
      if (success) {
        res.status(200).json({
          success: true,
          message: storeId ? `Assigned to store [${storeId}]` : 'Unassigned from store'
        });
      } else {
        res.status(404).json({ success: false, error: 'Connector not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: PATCH /api/v1/connectors/:id/status
   */
  public updateStatus = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['ONLINE', 'OFFLINE', 'ERROR'].includes(status)) {
        res.status(400).json({ success: false, error: 'Status must be ONLINE, OFFLINE, or ERROR.' });
        return;
      }

      const performedBy = req.user?.id || req.headers['x-admin-user'] || 'ADMIN';
      const success = await this.service.updateStatus(id, status, performedBy);

      if (success) {
        res.status(200).json({ success: true, message: `Status updated to ${status}` });
      } else {
        res.status(404).json({ success: false, error: 'Connector not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: DELETE /api/v1/connectors/:id
   */
  public deleteConnector = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const performedBy = req.user?.id || req.headers['x-admin-user'] || 'ADMIN';
      const success = await this.service.deleteConnector(id, performedBy);

      if (success) {
        res.status(200).json({ success: true, message: 'Connector removed successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Connector not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: GET /api/v1/connectors/:id/printers
   */
  public getPrinters = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const printers = await this.service.getConnectorPrinters(id);
      res.status(200).json({ success: true, data: printers, count: printers.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: POST /api/v1/connectors/:id/command
   */
  public sendCommand = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const { command, payload } = req.body;
      const performedBy = req.user?.id || req.headers['x-admin-user'] || 'ADMIN';

      const result = await sendCommandToConnector(id, command, payload, performedBy);
      res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };

  /**
   * Admin API: GET /api/v1/connectors/:id/audit-logs
   */
  public getAuditLogs = async (req: any, res: any): Promise<void> => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await connectorAuditService.getLogsByConnector(id, limit);
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  };
}

export const connectorController = new ConnectorController();
