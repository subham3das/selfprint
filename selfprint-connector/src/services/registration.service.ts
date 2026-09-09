import { connectorStore } from '../storage/connectorStore';
import { logger } from '../utils/logger';

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  data?: {
    deviceToken: string;
    connectorId: string;
    machineId: string;
    heartbeatInterval?: number;
    scanInterval?: number;
    websocketURL?: string;
  };
}

export class RegistrationService {
  /**
   * Ensures the connector has a valid device authentication token with the SelfPrint Cloud.
   */
  public async ensureRegistered(): Promise<boolean> {
    const data = connectorStore.getData();
    const identity = connectorStore.getIdentity();

    if (connectorStore.isRegistered()) {
      logger.info('Device Token found. Proceeding with authenticated session.');
      return true;
    }

    logger.info('No Device Token found. Performing first-time device registration with Backend...');

    const payload = {
      connectorId: data.connectorId,
      machineId: data.machineId,
      hostname: identity.hostname,
      osVersion: identity.osVersion,
      windowsUser: identity.windowsUser,
      connectorVersion: identity.connectorVersion
    };

    const url = `${data.connectorSettings.backendUrl.replace(/\/$/, '')}/api/v1/connectors/register`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `SelfPrintConnector/${identity.connectorVersion}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.warn(`Registration endpoint returned status ${response.status}: ${errorText}`);
        return false;
      }

      const result = (await response.json()) as RegistrationResponse;

      if (result.success && result.data && result.data.deviceToken) {
        connectorStore.setDeviceToken(result.data.deviceToken);

        // Update intervals if returned by backend
        if (result.data.heartbeatInterval || result.data.scanInterval || result.data.websocketURL) {
          connectorStore.updateSettings({
            heartbeatIntervalMs: result.data.heartbeatInterval || data.connectorSettings.heartbeatIntervalMs,
            scanIntervalMs: result.data.scanInterval || data.connectorSettings.scanIntervalMs,
            backendUrl: result.data.websocketURL || data.connectorSettings.backendUrl
          });
        }

        logger.info(`Device registered successfully! (Connector ID: ${result.data.connectorId})`);
        return true;
      } else {
        logger.error('Registration failed: Invalid response format from backend.');
        return false;
      }
    } catch (error) {
      logger.debug(`Backend registration unreachable at ${url}: ${error instanceof Error ? error.message : String(error)}`);
      logger.info('Connector will proceed in self-healing mode and retry registration on next cycle.');
      return false;
    }
  }
}

export const registrationService = new RegistrationService();
