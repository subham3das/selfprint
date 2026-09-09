import { connectorStore } from './storage/connectorStore';
import { registrationService } from './services/registration.service';
import { logger } from './utils/logger';
import { syncService } from './services/sync.service';
import { startLocalApiServer, stopLocalApiServer } from './api/routes';
import { initSocket, disconnectSocket } from './websocket/socket';
import { startHeartbeat, stopHeartbeat } from './services/heartbeat';
import { healthMonitor } from './services/healthMonitor';
import { crashRecovery } from './recovery/crashRecovery';
import { updateChecker } from './update/updateChecker';
import { trayManager } from './tray/trayManager';

/**
 * Global Process Error Traps.
 * Ensures background daemon never terminates unexpectedly.
 */
process.on('uncaughtException', (err: Error) => {
  logger.error('Unhandled Exception caught:', err);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection caught:', reason);
});

/**
 * Graceful Shutdown Handler
 */
function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down SelfPrint Hardware Bridge cleanly...`);
    trayManager.stop();
    updateChecker.stop();
    healthMonitor.stop();
    stopHeartbeat();
    syncService.stop();
    stopLocalApiServer();
    disconnectSocket();
    logger.info('Hardware Bridge stopped cleanly.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Main Application Bootstrapper
 */
async function bootstrap(): Promise<void> {
  setupGracefulShutdown();

  const identity = connectorStore.getIdentity();

  // 1. Header Banner
  logger.info('==================================================');
  logger.info(`SelfPrint Connector (Hardware Bridge) v${identity.connectorVersion}`);
  logger.info(`Connector ID: [ ${identity.connectorId} ]`);
  logger.info(`Machine ID:   [ ${identity.machineId} ]`);
  logger.info(`Hostname:     [ ${identity.hostname} ]`);
  logger.info(`Windows User: [ ${identity.windowsUser} ]`);
  logger.info('==================================================');

  try {
    // 2. Perform Crash Recovery from previous session
    await crashRecovery.performRecovery();

    // 3. Ensure Device Registration & Obtain JWT Token
    await registrationService.ensureRegistered();

    // 4. Start Local Hardware Printer Detection & 30s Watcher
    await syncService.start();

    // 5. Start Minimal Local REST API (Port 4500)
    startLocalApiServer();

    // 6. Connect Secure WebSocket Bridge to SelfPrint Backend
    initSocket();

    // 7. Start Device Heartbeat Beacon (Every 15s)
    startHeartbeat();

    // 8. Start Health Telemetry Monitor (Every 60s)
    healthMonitor.start();

    // 9. Start Update Architecture Version Checker (Hourly)
    updateChecker.start();

    // 10. Start Windows System Tray Companion
    trayManager.start();

    // 11. Silent Background State
    logger.info('Hardware Bridge running silently in background. Awaiting print commands...');
  } catch (error) {
    logger.error('Error during Hardware Bridge startup:', error);
    logger.info('Bridge will continue running and auto-recover...');
  }
}

// Start daemon
bootstrap();
