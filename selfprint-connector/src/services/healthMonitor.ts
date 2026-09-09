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
    try {
      const psCommand = `powershell -NoProfile -Command "$d = Get-CimInstance Win32_LogicalDisk -Filter 'DeviceID=\"C:\"'; [PSCustomObject]@{ FreeGB = [Math]::Round($d.FreeSpace / 1GB, 1); TotalGB = [Math]::Round($d.Size / 1GB, 1) } | ConvertTo-Json -Compress"`;
      const { stdout } = await execAsync(psCommand, { timeout: 3000 });
      const parsed = JSON.parse(stdout.trim());
      return {
        freeGB: Number(parsed.FreeGB || 0),
        totalGB: Number(parsed.TotalGB || 0)
      };
    } catch {
      return { freeGB: 0, totalGB: 0 };
    }
  }

  private async getSpoolerStatus(): Promise<'Running' | 'Stopped' | 'Unknown'> {
    try {
      const psCommand = `powershell -NoProfile -Command "$s = Get-Service -Name spooler -ErrorAction SilentlyContinue; if ($s) { $s.Status.ToString() } else { 'Unknown' }"`;
      const { stdout } = await execAsync(psCommand, { timeout: 2000 });
      const trimmed = stdout.trim();
      if (trimmed === 'Running') return 'Running';
      if (trimmed === 'Stopped') return 'Stopped';
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private async checkBackendLatency(backendUrl: string): Promise<{ hasInternet: boolean; latencyMs: number | null }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/v1/connectors/heartbeat`, {
        method: 'HEAD',
        signal: controller.signal
      }).catch(() => null);
      clearTimeout(timeout);

      const latencyMs = Date.now() - start;
      return {
        hasInternet: true,
        latencyMs: res ? latencyMs : null
      };
    } catch {
      return {
        hasInternet: false,
        latencyMs: null
      };
    }
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
