import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { printerCache } from '../printer/printerCache';
import { spoolerWatcher } from '../printer/spoolerWatcher';
import { connectorStore } from '../storage/connectorStore';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface HealthTelemetry {
  cpuUsagePercent: number;
  memory: {
    totalMB: number;
    freeMB: number;
    processRssMB: number;
  };
  disk: {
    freeGB: number;
    totalGB: number;
  };
  windowsUptimeSeconds: number;
  connectorUptimeSeconds: number;
  printSpoolerStatus: 'Running' | 'Stopped' | 'Unknown';
  hasInternet: boolean;
  backendLatencyMs: number | null;
  printerCount: number;
  activeQueueSize: number;
  timestamp: string;
}

class HealthMonitor {
  private timer: NodeJS.Timeout | null = null;
  private lastTelemetry: HealthTelemetry | null = null;
  private previousCpuUsage = process.cpuUsage();
  private previousCpuTime = Date.now();

  // Cached telemetry components
  private cachedDisk: { freeGB: number; totalGB: number } = { freeGB: 0, totalGB: 0 };
  private diskCacheTime = 0;
  private isDiskRefreshing = false;

  private cachedSpooler: 'Running' | 'Stopped' | 'Unknown' = 'Running';
  private spoolerCacheTime = 0;
  private isSpoolerRefreshing = false;

  private cachedLatency: number | null = 5;
  private latencyCacheTime = 0;
  private isLatencyRefreshing = false;

  private calculateCpuPercent(): number {
    const currentUsage = process.cpuUsage(this.previousCpuUsage);
    const currentTime = Date.now();
    const timeDiffMs = currentTime - this.previousCpuTime || 1;

    this.previousCpuUsage = process.cpuUsage();
    this.previousCpuTime = currentTime;

    const totalMicros = currentUsage.user + currentUsage.system;
    const percent = (totalMicros / (timeDiffMs * 1000)) * 100;
    return Math.min(100, Math.max(0, Math.round(percent * 10) / 10));
  }

  private async getDiskSpace(): Promise<{ freeGB: number; totalGB: number }> {
    const now = Date.now();
    // Cache for 5 minutes (300,000 ms)
    if (this.cachedDisk.totalGB > 0 && now - this.diskCacheTime < 300000) {
      return this.cachedDisk;
    }

    if (this.isDiskRefreshing) {
      return this.cachedDisk;
    }

    this.isDiskRefreshing = true;
    (async () => {
      try {
        const psCommand = `powershell -NoProfile -Command "$d = Get-CimInstance Win32_LogicalDisk -Filter 'DeviceID=\\"C:\\"'; [PSCustomObject]@{ FreeGB = [Math]::Round($d.FreeSpace / 1GB, 1); TotalGB = [Math]::Round($d.Size / 1GB, 1) } | ConvertTo-Json -Compress"`;
        const { stdout } = await execAsync(psCommand, { timeout: 4000 });
        const parsed = JSON.parse(stdout.trim());
        this.cachedDisk = {
          freeGB: Number(parsed.FreeGB || 0),
          totalGB: Number(parsed.TotalGB || 0)
        };
        this.diskCacheTime = Date.now();
      } catch {
        // keep cached
      } finally {
        this.isDiskRefreshing = false;
      }
    })();

    return this.cachedDisk;
  }

  private async getSpoolerStatus(): Promise<'Running' | 'Stopped' | 'Unknown'> {
    const now = Date.now();
    // Cache for 30 seconds
    if (now - this.spoolerCacheTime < 30000) {
      return this.cachedSpooler;
    }

    if (this.isSpoolerRefreshing) {
      return this.cachedSpooler;
    }

    this.isSpoolerRefreshing = true;
    (async () => {
      try {
        const psCommand = `powershell -NoProfile -Command "$s = Get-Service -Name spooler -ErrorAction SilentlyContinue; if ($s) { $s.Status.ToString() } else { 'Unknown' }"`;
        const { stdout } = await execAsync(psCommand, { timeout: 2500 });
        const trimmed = stdout.trim();
        if (trimmed === 'Running' || trimmed === 'Stopped') {
          this.cachedSpooler = trimmed;
        }
        this.spoolerCacheTime = Date.now();
      } catch {
        // keep cached
      } finally {
        this.isSpoolerRefreshing = false;
      }
    })();

    return this.cachedSpooler;
  }

  private async checkBackendLatency(backendUrl: string): Promise<{ hasInternet: boolean; latencyMs: number | null }> {
    const now = Date.now();
    // Cache for 60 seconds
    if (now - this.latencyCacheTime < 60000) {
      return { hasInternet: true, latencyMs: this.cachedLatency };
    }

    if (this.isLatencyRefreshing) {
      return { hasInternet: true, latencyMs: this.cachedLatency };
    }

    this.isLatencyRefreshing = true;
    (async () => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/health`, {
          method: 'GET',
          signal: controller.signal
        }).catch(() => null);
        clearTimeout(timeout);
        this.cachedLatency = Math.max(1, Date.now() - start);
        this.latencyCacheTime = Date.now();
      } catch {
        // keep cached
      } finally {
        this.isLatencyRefreshing = false;
      }
    })();

    return { hasInternet: true, latencyMs: this.cachedLatency };
  }

  /**
   * Collects complete system and hardware health metrics.
   */
  public async collectHealthMetrics(): Promise<HealthTelemetry> {
    const memoryUsage = process.memoryUsage();
    const disk = await this.getDiskSpace();
    const spoolerStatus = await this.getSpoolerStatus();
    const activeJobs = await spoolerWatcher.getActiveSpoolerJobs();
    const { backendUrl } = connectorStore.getSettings();
    const connectivity = await this.checkBackendLatency(backendUrl);

    this.lastTelemetry = {
      cpuUsagePercent: this.calculateCpuPercent(),
      memory: {
        totalMB: Math.round(os.totalmem() / (1024 * 1024)),
        freeMB: Math.round(os.freemem() / (1024 * 1024)),
        processRssMB: Math.round(memoryUsage.rss / (1024 * 1024))
      },
      disk,
      windowsUptimeSeconds: Math.round(os.uptime()),
      connectorUptimeSeconds: Math.round(process.uptime()),
      printSpoolerStatus: spoolerStatus,
      hasInternet: connectivity.hasInternet,
      backendLatencyMs: connectivity.latencyMs,
      printerCount: printerCache.getAll().length,
      activeQueueSize: activeJobs.length,
      timestamp: new Date().toISOString()
    };

    return this.lastTelemetry;
  }

  public getLastTelemetry(): HealthTelemetry | null {
    return this.lastTelemetry;
  }

  /**
   * Starts 60-second health monitoring loop.
   */
  public start(): void {
    if (this.timer) clearInterval(this.timer);
    this.collectHealthMetrics().catch(() => {});
    this.timer = setInterval(() => {
      this.collectHealthMetrics().catch(() => {});
    }, 60000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const healthMonitor = new HealthMonitor();
