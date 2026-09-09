import { connectorService } from './service';

export class ConnectorWatchdog {
  private timer: NodeJS.Timeout | null = null;
  private ioInstance: any = null;

  /**
   * Attaches the Socket.IO instance to broadcast offline alerts.
   */
  public attachSocketIO(io: any): void {
    this.ioInstance = io;
  }

  /**
   * Executes a single watchdog check cycle:
   * Finds connectors where lastHeartbeat > 60 seconds, marks status OFFLINE, and emits connector_offline.
   */
  public async runCheck(): Promise<number> {
    try {
      const result = await connectorService.checkStaleConnectors();
      if (result.modifiedCount > 0 && this.ioInstance) {
        for (const connector of result.offlineConnectors) {
          // 1. Emit to global admin room
          this.ioInstance.emit('connector_offline', {
            connectorId: connector.connectorId,
            machineId: connector.machineId,
            hostname: connector.hostname,
            storeId: connector.storeId,
            lastHeartbeat: connector.lastHeartbeat,
            timestamp: new Date().toISOString()
          });

          // 2. Emit to specific store room if assigned
          if (connector.storeId) {
            this.ioInstance.to(`store:${connector.storeId}`).emit('store_connector_offline', {
              connectorId: connector.connectorId,
              storeId: connector.storeId,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      return result.modifiedCount;
    } catch (err) {
      console.error('[ConnectorWatchdog] Error executing watchdog check:', err);
      return 0;
    }
  }

  /**
   * Starts the 60-second watchdog loop.
   */
  public start(intervalMs = 60000): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.runCheck().catch(() => {});
    }, intervalMs);
    console.log(`[ConnectorWatchdog] Stale connector watchdog active (Interval: ${intervalMs / 1000}s).`);
  }

  /**
   * Stops the watchdog timer.
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const connectorWatchdog = new ConnectorWatchdog();
