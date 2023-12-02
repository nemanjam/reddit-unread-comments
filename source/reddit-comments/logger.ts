import { getSettings } from './database/models/settings';
import { openDatabase } from './database/schema';
import { formatDateForLogger } from './datetime';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private static instance: Logger;
  private enableLogger: boolean = true;

  private logLevels: Record<LogLevel, LogLevel> = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  };

  private constructor() {
    this.checkEnableLoggerStatus();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async checkEnableLoggerStatus(): Promise<void> {
    try {
      const db = await openDatabase();
      const { enableLogger } = await getSettings(db);

      this.enableLogger = enableLogger;
    } catch (error) {
      console.error('Error checking enableLogger from db status:', error);
    }
  }

  private log(level: LogLevel, message: string): void {
    if (!this.enableLogger) {
      return;
    }

    const timestamp = formatDateForLogger(new Date());
    const logString = `[${timestamp}] [${this.logLevels[level]}]: ${message}`;

    if (level === 'INFO') console.log(logString);
    if (level === 'WARN') console.warn(logString);
    if (level === 'ERROR') console.error(logString);
  }

  public info(message: string): void {
    this.log(this.logLevels.INFO, message);
  }

  public warn(message: string): void {
    this.log(this.logLevels.WARN, message);
  }

  public error(message: string): void {
    this.log(this.logLevels.ERROR, message);
  }
}

export const logger = Logger.getInstance();

// Example Usage:
// logger.info('This is an information message.');
// logger.warn('This is a warning message.');
// logger.error('This is an error message.');
