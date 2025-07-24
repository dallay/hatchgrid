import type {LoggerConfiguration} from "~/types";
import type {Logger, LogLevel} from "vite";

/**
 * Encapsulates logger system state management
 */
export class LoggerState {
  private config: LoggerConfiguration | null = null;
  private readonly loggers = new Map<string, Logger>();
  private readonly levelCache = new Map<string, LogLevel>();
  private readonly cacheConfig = {
    maxLoggers: 1000,
    maxLevelCache: 500,
  };

  getConfig(): LoggerConfiguration | null {
    return this.config;
  }

  setConfig(config: LoggerConfiguration): void {
    this.config = config;
    this.levelCache.clear(); // Invalidate cache on config change
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getLogger(name: string): Logger | undefined {
    return this.loggers.get(name);
  }

  setLogger(name: string, logger: Logger): void {
    this.enforceLoggerCacheLimit();
    this.loggers.set(name, logger);
  }

  getCachedLevel(name: string): LogLevel | undefined {
    return this.levelCache.get(name);
  }

  setCachedLevel(name: string, level: LogLevel): void {
    this.enforceLevelCacheLimit();
    this.levelCache.set(name, level);
  }

  clearCaches(): void {
    this.levelCache.clear();
  }

  reset(): void {
    this.config = null;
    this.loggers.clear();
    this.levelCache.clear();
  }

  getCacheStats() {
    return {
      loggerCacheSize: this.loggers.size,
      levelCacheSize: this.levelCache.size,
    } as const;
  }

  private enforceLoggerCacheLimit(): void {
    if (this.loggers.size >= this.cacheConfig.maxLoggers) {
      const firstKey = this.loggers.keys().next().value;
      if (firstKey) {
        this.loggers.delete(firstKey);
      }
    }
  }

  private enforceLevelCacheLimit(): void {
    if (this.levelCache.size >= this.cacheConfig.maxLevelCache) {
      const firstKey = this.levelCache.keys().next().value;
      if (firstKey) {
        this.levelCache.delete(firstKey);
      }
    }
  }
}
