import type { LogEntry, LoggerName, LogLevel } from "./types.js";
import { createLoggerName, LogLevel as LogLevelEnum } from "./types.js";

/**
 * Interface for LogManager to avoid circular dependencies
 */
interface ILogManager {
  processLog(entry: LogEntry): void;
}

/**
 * Logger class provides level-specific logging methods.
 * Each logger instance has an immutable name and delegates log processing to LogManager.
 *
 * This improved version uses dependency injection for better testability and maintainability.
 */
export class Logger {
  /**
   * Immutable logger name used for hierarchical configuration and identification.
   */
  public readonly name: LoggerName;

  /**
   * Optional LogManager instance for processing log entries.
   * When null, the logger operates in graceful degradation mode.
   */
  private logManager: ILogManager | null = null;

  /**
   * Creates a new Logger instance with the specified name.
   * @param name The logger name, typically using dot-notation for hierarchy
   */
  constructor(name: string) {
    this.name = createLoggerName(name);
  }

  /**
   * Set the LogManager instance for this logger.
   * This method allows for dependency injection and better testability.
   * @param logManager The LogManager instance to use for processing log entries
   */
  public setLogManager(logManager: ILogManager | null): void {
    this.logManager = logManager;
  }

  /**
   * Log a TRACE level message.
   * TRACE is the lowest severity level, typically used for detailed diagnostic information.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public trace(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.TRACE, message, args);
  }

  /**
   * Log a DEBUG level message.
   * DEBUG is used for diagnostic information useful during development.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.DEBUG, message, args);
  }

  /**
   * Log an INFO level message.
   * INFO is used for general informational messages about application flow.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.INFO, message, args);
  }

  /**
   * Log a WARN level message.
   * WARN is used for potentially harmful situations that don't prevent operation.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.WARN, message, args);
  }

  /**
   * Log an ERROR level message.
   * ERROR is used for error events that might still allow the application to continue.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.ERROR, message, args);
  }

  /**
   * Log a FATAL level message.
   * FATAL is the highest severity level, used for severe errors that may cause termination.
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  public fatal(message: string, ...args: unknown[]): void {
    this.log(LogLevelEnum.FATAL, message, args);
  }

  /**
   * Private method that creates a LogEntry and delegates to LogManager for processing.
   * This method is responsible for creating the log entry with proper timestamp and
   * routing it to the LogManager for level checking and transport routing.
   * @param level The log level for this entry
   * @param message The log message
   * @param args Additional arguments to include in the log entry
   */
  private log(level: LogLevel, message: string, args: unknown[]): void {
    // Early return if no LogManager is available (graceful degradation)
    if (!this.logManager) {
      return;
    }

    // Create the log entry with current timestamp
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      loggerName: this.name,
      message,
      args,
    };

    // Delegate to LogManager for processing with error handling
    try {
      this.logManager.processLog(entry);
    } catch {
      // Graceful degradation: if LogManager throws an error,
      // silently ignore to prevent application crashes
      // This follows the requirement for graceful degradation
    }
  }
}
