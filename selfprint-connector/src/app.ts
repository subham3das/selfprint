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
    // 2. Structured Lifecycle Log: Service started
    logger.info(`[Service started] SelfPrint Hardware Bridge Service started (PID: ${process.pid})`);

    // 3. Start Minimal Local REST API (Port 4500) immediately so /health is instantly alive
    startLocalApiServer();

    // 4. Perform Crash Recovery from previous session
    await crashRecovery.performRecovery();

    // 5. Connect Secure WebSocket Bridge to SelfPrint Backend
    initSocket();

    // 6. Start Device Heartbeat Beacon (Every 15s)
    startHeartbeat();

    // 7. Start Health Telemetry Monitor (Every 60s)
    healthMonitor.start();

    // 8. Start Update Architecture Version Checker (Hourly)
    updateChecker.start();

    // 9. Start Windows System Tray Companion
    trayManager.start();

    // 10. Start Local Hardware Printer Detection & Watcher asynchronously in background
    syncService.start().catch((err) => {
      logger.error('Error starting printer synchronization service:', err);
    });

    // 11. Silent Background State
    logger.info('Hardware Bridge running silently in background. Awaiting print commands...');
  } catch (error) {
    logger.error('Error during Hardware Bridge startup:', error);
    logger.info('Bridge will continue running and auto-recover...');
  }
}

// Start daemon
bootstrap();
