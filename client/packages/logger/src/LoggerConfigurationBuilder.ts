import type { LoggerConfiguration, Transport } from "./types";
import { LogLevel } from "./types";

/**
 * Builder pattern for creating LoggerConfiguration objects.
 * Provides a fluent API for configuration setup.
 */
export class LoggerConfigurationBuilder {
  private config: Partial<LoggerConfiguration> = {
    level: LogLevel.INFO,
    levels: {},
    transports: [],
  };

  /**
   * Set the root log level
   */
  withLevel(level: LogLevel): this {
    this.config.level = level;
    return this;
  }

  /**
   * Add a hierarchical level override
   */
  withLoggerLevel(loggerName: string, level: LogLevel): this {
    if (!this.config.levels) {
      this.config.levels = {};
    }
    this.config.levels[loggerName] = level;
    return this;
  }

  /**
   * Add multiple logger level overrides
   */
  withLoggerLevels(levels: Record<string, LogLevel>): this {
    this.config.levels = { ...this.config.levels, ...levels };
    return this;
  }

  /**
   * Add a transport
   */
  withTransport(transport: Transport): this {
    if (!this.config.transports) {
      this.config.transports = [];
    }
    this.config.transports = [...this.config.transports, transport];
    return this;
  }

  /**
   * Add multiple transports
   */
  withTransports(transports: Transport[]): this {
    this.config.transports = [...(this.config.transports || []), ...transports];
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): LoggerConfiguration {
    if (!this.config.transports?.length) {
      throw new Error("At least one transport must be configured");
    }

    return {
      level: this.config.level!,
      levels: this.config.levels,
      transports: this.config.transports,
    };
  }

  /**
   * Create a development configuration with common settings
   */
  static development(): LoggerConfigurationBuilder {
    return new LoggerConfigurationBuilder()
      .withLevel(LogLevel.DEBUG);
  }

  /**
   * Create a production configuration with common settings
   */
  static production(): LoggerConfigurationBuilder {
    return new LoggerConfigurationBuilder()
      .withLevel(LogLevel.INFO);
  }
}
