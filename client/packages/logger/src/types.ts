/**
 * Log levels with numeric values for efficient comparison.
 * Higher numeric values indicate higher severity.
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * Mapping of log levels to their string representations for display purposes
 */
export const LOG_LEVEL_NAMES = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
} as const;

/**
 * Branded type for logger names to provide type safety
 */
export type LoggerName = string & { readonly __brand: unique symbol };

/**
 * Represents a single log entry with all necessary information.
 */
export interface LogEntry {
  /** Timestamp when the log entry was created */
  timestamp: Date;
  /** Log level of this entry */
  level: LogLevel;
  /** Name of the logger that created this entry */
  loggerName: LoggerName;
  /** Primary log message */
  message: string;
  /** Additional arguments passed to the log method */
  args: unknown[];
}

/**
 * Interface for log output destinations (transports).
 * Transports are responsible for formatting and outputting log entries.
 */
export interface Transport {
  /**
   * Process and output a log entry.
   * @param entry The log entry to process
   */
  log(entry: LogEntry): void;
}

/**
 * Configuration interface for the LogManager.
 * Defines the root log level, hierarchical level overrides, and transports.
 */
export interface LoggerConfiguration {
  /** Root log level applied to all loggers unless overridden */
  level: LogLevel;
  /** Optional hierarchical level overrides using dot-notation logger names */
  levels?: Record<string, LogLevel>;
  /** Array of transports that will receive log entries */
  transports: readonly Transport[];
}

/**
 * Utility type for log method signatures
 */
export type LogMethod = (message: string, ...args: unknown[]) => void;

/**
 * Utility type for creating logger name from string
 */
export const createLoggerName = (name: string): LoggerName => name as LoggerName;
