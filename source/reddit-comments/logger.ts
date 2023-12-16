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

  public async resetInstance(): Promise<void> {
    await this.checkEnableLoggerStatus();
  }

  private async checkEnableLoggerStatus(): Promise<void> {
    try {
      // these db functions must not use logger, not created yet
      const db = await openDatabase();
      const { enableLogger } = await getSettings(db);

      this.enableLogger = enableLogger;
    } catch (error) {
      console.error('Error checking enableLogger from db status:', error);
    }
  }

  private log(level: LogLevel, ...args: any[]): void {
    if (!this.enableLogger) {
      return;
    }
    const [message, ...restArgs] = args;
    const timestamp = formatDateForLogger(new Date());
    const logString = `[${timestamp}] [${this.logLevels[level]}]: ${message}`;

    if (level === 'INFO') console.info(logString, ...restArgs);
    if (level === 'WARN') console.warn(logString, ...restArgs);
    if (level === 'ERROR') console.error(logString, ...restArgs);
  }

  public info(...args: any[]): void {
    this.log(this.logLevels.INFO, ...args);
  }

  public warn(...args: any[]): void {
    this.log(this.logLevels.WARN, ...args);
  }

  public error(...args: any[]): void {
    this.log(this.logLevels.ERROR, ...args);
  }
}

const logger = Logger.getInstance();

export default logger;

// Example Usage:
// logger.info('This is an information message.');
// logger.warn('This is a warning message.');
// logger.error('This is an error message.');
