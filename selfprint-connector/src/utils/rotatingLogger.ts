import fs from 'fs';
import path from 'path';
import { systemPaths } from './paths';

export type LogChannel = 'connector' | 'print' | 'printer';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40
};

export class RotatingLogger {
  private logDir: string;
  private maxFileSizeBytes = 10 * 1024 * 1024; // 10MB
  private maxRetentionDays = 30;
  private currentLogLevel: LogLevel = 'INFO';

  constructor() {
    this.logDir = systemPaths.getLogsDir();
    this.ensureDirectory();
    this.cleanOldLogs();
    // Run cleanup once every 24 hours
    setInterval(() => this.cleanOldLogs(), 24 * 60 * 60 * 1000);
  }

  public setLogLevel(level: string): void {
    const upper = level.toUpperCase() as LogLevel;
    if (upper in LOG_LEVEL_SEVERITY) {
      this.currentLogLevel = upper;
      this.write('connector', 'INFO', `Active log level updated to [${upper}]`);
    }
  }

  public getLogLevel(): LogLevel {
    return this.currentLogLevel;
  }

  private shouldLog(level: string): boolean {
    const upper = level.toUpperCase() as LogLevel;
    const severity = LOG_LEVEL_SEVERITY[upper] || 20;
    const currentSeverity = LOG_LEVEL_SEVERITY[this.currentLogLevel] || 20;
    return severity >= currentSeverity;
  }

  private ensureDirectory(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create logs directory:', err);
    }
  }

  private getDateString(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${this.getDateString()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  private getLogFilePath(channel: LogChannel): string {
    const dateStr = this.getDateString();
    return path.join(this.logDir, `${channel}-${dateStr}.log`);
  }

  public write(channel: LogChannel, level: string, message: string): void {
    if (!this.shouldLog(level)) return;

    try {
      this.ensureDirectory();
      const filePath = this.getLogFilePath(channel);

      // Check size rotation (10MB)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size >= this.maxFileSizeBytes) {
          const timestamp = new Date().getTime();
          const rotated = path.join(this.logDir, `${channel}-${this.getDateString()}_${timestamp}.log`);
          fs.renameSync(filePath, rotated);
        }
      }

      const formattedLine = `[${this.getTimestamp()}] [${level}] ${message}\n`;
      fs.appendFileSync(filePath, formattedLine, 'utf8');

      // Also maintain legacy connector.log/printer.log/print.log for convenience
      const legacyPath = path.join(this.logDir, `${channel}.log`);
      fs.appendFileSync(legacyPath, formattedLine, 'utf8');

      console.log(`[${channel.toUpperCase()}] [${level}] ${message}`);
    } catch (err) {
      console.error(`Failed to write to ${channel} log:`, err);
    }
  }

  /**
   * Automatically purges log files older than 30 days.
   */
  public cleanOldLogs(): void {
    try {
      if (!fs.existsSync(this.logDir)) return;
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAgeMs = this.maxRetentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log(`[LOG_CLEANUP] Deleted archived log older than 30 days: ${file}`);
        }
      }
    } catch {
      // Non-fatal
    }
  }
}

export const rotatingLogger = new RotatingLogger();
