import { rotatingLogger } from './rotatingLogger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private logLevel: LogLevel = 'info';

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    rotatingLogger.setLogLevel(level);
  }

  public info(message: string): void {
    rotatingLogger.write('connector', 'INFO', message);
  }

  public warn(message: string, error?: unknown): void {
    let details = '';
    if (error instanceof Error) {
      details = ` - ${error.message}`;
    } else if (error) {
      details = ` - ${String(error)}`;
    }
    rotatingLogger.write('connector', 'WARN', message + details);
  }

  public error(message: string, error?: unknown): void {
    let errorDetails = '';
    if (error instanceof Error) {
      errorDetails = ` - ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
    } else if (error) {
      errorDetails = ` - ${String(error)}`;
    }
    rotatingLogger.write('connector', 'ERROR', message + errorDetails);
  }

  public debug(message: string, error?: unknown): void {
    let details = '';
    if (error instanceof Error) {
      details = ` - ${error.message}`;
    } else if (error) {
      details = ` - ${String(error)}`;
    }
    rotatingLogger.write('connector', 'DEBUG', message + details);
  }
}

export const logger = new Logger();
