import { Router } from 'express';
import { connectorController } from './connector.controller';

export const connectorRouter = Router();

// Store generates pairing code (SP-XXXXXX, 10 min)
connectorRouter.post('/generate-code', (req, res) => connectorController.generatePairingCode(req, res));
connectorRouter.post('/pairing-code', (req, res) => connectorController.generatePairingCode(req, res));

// Desktop pairs using pairing code
connectorRouter.post('/pair', (req, res) => connectorController.pairConnector(req, res));

// Desktop verifies existing device token on startup
connectorRouter.post('/verify-token', (req, res) => connectorController.verifyDeviceToken(req, res));

// Store checks connector status & alive heartbeat
connectorRouter.get('/status', (req, res) => connectorController.getConnectorStatus(req, res));

// Desktop sends 10s heartbeat
connectorRouter.post('/heartbeat', (req, res) => connectorController.recordHeartbeat(req, res));

// Store & Website downloads Windows desktop installer
connectorRouter.get('/installer-info', (req, res) => connectorController.getInstallerInfo(req, res));
connectorRouter.get('/download', (req, res) => connectorController.downloadInstaller(req, res));

// Remote command dispatch
connectorRouter.post('/command', (req, res) => connectorController.dispatchRemoteCommand(req, res));

// Unpair / revoke connector
connectorRouter.delete('/unpair', (req, res) => connectorController.unpairConnector(req, res));
connectorRouter.post('/unpair', (req, res) => connectorController.unpairConnector(req, res));
connectorRouter.delete('/:id', (req, res) => connectorController.unpairConnector(req, res));

export default connectorRouter;
