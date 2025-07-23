import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "./Logger.js";
import { LogManager } from "./LogManager.js";
import {
	type LogEntry,
	type LoggerConfiguration,
	LogLevel,
	type Transport,
} from "./types.js";

describe("LogManager", () => {
	// Mock transport for testing
	const mockTransport: Transport = {
		log: vi.fn(),
	};

	// Reset LogManager state before each test
	beforeEach(() => {
		LogManager.clearCaches();
		// Reset configuration to null
		LogManager.configure({
			level: LogLevel.INFO,
			transports: [],
		});
		vi.clearAllMocks();
	});

	describe("configuration management", () => {
		it("should accept LoggerConfiguration and store it", () => {
			const config: LoggerConfiguration = {
				level: LogLevel.DEBUG,
				levels: {
					api: LogLevel.WARN,
				},
				transports: [mockTransport],
			};

			LogManager.configure(config);

			expect(LogManager.isConfigured()).toBe(true);
			expect(LogManager.getConfiguration()).toEqual(config);
		});

		it("should clear level cache when configuration is updated", () => {
			// First configuration
			LogManager.configure({
				level: LogLevel.INFO,
				levels: { test: LogLevel.DEBUG },
				transports: [mockTransport],
			});

			// Get a logger to populate cache
			const logger = LogManager.getLogger("test.component");
			logger.debug("test message"); // This should log and populate the level cache
			expect(mockTransport.log).toHaveBeenCalledTimes(1);

			// Clear mock calls for clean slate
			vi.clearAllMocks();

			// Update configuration with stricter levels
			LogManager.configure({
				level: LogLevel.WARN,
				levels: { test: LogLevel.ERROR },
				transports: [mockTransport],
			});

			// The cache should be cleared and new configuration should take effect
			logger.info("info message"); // Should not log because effective level is now ERROR
			expect(mockTransport.log).not.toHaveBeenCalled();

			logger.error("error message"); // Should log because ERROR >= ERROR
			expect(mockTransport.log).toHaveBeenCalledTimes(1);
		});
	});

	describe("logger instance creation and caching", () => {
		beforeEach(() => {
			LogManager.configure({
				level: LogLevel.INFO,
				transports: [mockTransport],
			});
		});

		it("should create Logger instance for new name", () => {
			const logger = LogManager.getLogger("test.logger");

			expect(logger).toBeInstanceOf(Logger);
			expect(logger.name).toBe("test.logger");
		});

		it("should return same Logger instance for same name", () => {
			const logger1 = LogManager.getLogger("test.logger");
			const logger2 = LogManager.getLogger("test.logger");

			expect(logger1).toBe(logger2); // Same reference
		});

		it("should create different Logger instances for different names", () => {
			const logger1 = LogManager.getLogger("test.logger1");
			const logger2 = LogManager.getLogger("test.logger2");

			expect(logger1).not.toBe(logger2);
			expect(logger1.name).toBe("test.logger1");
			expect(logger2.name).toBe("test.logger2");
		});
	});

	describe("log processing and level checking", () => {
		beforeEach(() => {
			LogManager.configure({
				level: LogLevel.INFO,
				transports: [mockTransport],
			});
		});

		it("should process log entry when level is at or above effective level", () => {
			const logger = LogManager.getLogger("test");

			logger.info("info message");
			logger.warn("warn message");
			logger.error("error message");

			expect(mockTransport.log).toHaveBeenCalledTimes(3);
		});

		it("should skip log entry when level is below effective level", () => {
			const logger = LogManager.getLogger("test");

			logger.trace("trace message");
			logger.debug("debug message");

			expect(mockTransport.log).not.toHaveBeenCalled();
		});

		it("should route log entries to all configured transports", () => {
			const transport1: Transport = { log: vi.fn() };
			const transport2: Transport = { log: vi.fn() };

			LogManager.configure({
				level: LogLevel.INFO,
				transports: [transport1, transport2],
			});

			const logger = LogManager.getLogger("test");
			logger.info("test message");

			expect(transport1.log).toHaveBeenCalledTimes(1);
			expect(transport2.log).toHaveBeenCalledTimes(1);
		});

		it("should isolate transport errors and not affect other transports", () => {
			const workingTransport: Transport = { log: vi.fn() };
			const failingTransport: Transport = {
				log: vi.fn().mockImplementation(() => {
					throw new Error("Transport failed");
				}),
			};

			LogManager.configure({
				level: LogLevel.INFO,
				transports: [failingTransport, workingTransport],
			});

			// Mock console.error to avoid noise in test output
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const logger = LogManager.getLogger("test");
			logger.info("test message");

			// Working transport should still receive the log
			expect(workingTransport.log).toHaveBeenCalledTimes(1);
			// Error should be logged to console
			expect(consoleSpy).toHaveBeenCalledWith(
				"Logger transport error:",
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("hierarchical level resolution", () => {
		it("should use exact match when available", () => {
			LogManager.configure({
				level: LogLevel.INFO,
				levels: {
					"api.services.auth": LogLevel.DEBUG,
				},
				transports: [mockTransport],
			});

			const logger = LogManager.getLogger("api.services.auth");
			logger.debug("debug message");

			expect(mockTransport.log).toHaveBeenCalledTimes(1);
		});

		it("should inherit from parent loggers when specific config does not exist", () => {
			LogManager.configure({
				level: LogLevel.INFO,
				levels: {
					api: LogLevel.DEBUG,
					"api.services": LogLevel.WARN,
				},
				transports: [mockTransport],
			});

			// Should inherit from 'api.services' (WARN)
			const authLogger = LogManager.getLogger("api.services.auth");
			authLogger.debug("debug message"); // Should not log (DEBUG < WARN)
			authLogger.warn("warn message"); // Should log (WARN >= WARN)

			expect(mockTransport.log).toHaveBeenCalledTimes(1);

			// Should inherit from 'api' (DEBUG)
			const utilsLogger = LogManager.getLogger("api.utils");
			utilsLogger.debug("debug message"); // Should log (DEBUG >= DEBUG)

			expect(mockTransport.log).toHaveBeenCalledTimes(2);
		});

		it("should use root level when no hierarchy matches", () => {
			LogManager.configure({
				level: LogLevel.WARN,
				levels: {
					api: LogLevel.DEBUG,
				},
				transports: [mockTransport],
			});

			const logger = LogManager.getLogger("ui.components");
			logger.info("info message"); // Should not log (INFO < WARN)
			logger.warn("warn message"); // Should log (WARN >= WARN)

			expect(mockTransport.log).toHaveBeenCalledTimes(1);
		});

		it("should cache effective levels for performance", () => {
			LogManager.configure({
				level: LogLevel.INFO,
				levels: {
					api: LogLevel.DEBUG,
				},
				transports: [mockTransport],
			});

			const logger = LogManager.getLogger("api.services.auth");

			// First call should resolve and cache the level
			logger.debug("first message");

			// Second call should use cached level
			logger.debug("second message");

			expect(mockTransport.log).toHaveBeenCalledTimes(2);

			// Verify caching by checking that the same effective level is used
			// (This is implicit in the behavior - both debug messages should log)
		});
	});

	describe("graceful degradation", () => {
		it("should silently ignore log entries when not configured", () => {
			// Don't configure LogManager
			LogManager.configure({
				level: LogLevel.INFO,
				transports: [],
			});

			// Simulate unconfigured state
			const originalConfig = LogManager.getConfiguration();
			(LogManager as any).config = null;

			const logger = LogManager.getLogger("test");

			// Should not throw error
			expect(() => {
				logger.info("test message");
			}).not.toThrow();

			// Restore configuration
			if (originalConfig) {
				LogManager.configure(originalConfig);
			}
		});

		it("should handle missing transports gracefully", () => {
			LogManager.configure({
				level: LogLevel.INFO,
				transports: [], // No transports
			});

			const logger = LogManager.getLogger("test");

			// Should not throw error
			expect(() => {
				logger.info("test message");
			}).not.toThrow();
		});
	});

	describe("performance optimizations", () => {
		it("should skip log processing when level is below effective level", () => {
			const expensiveTransport: Transport = {
				log: vi.fn().mockImplementation(() => {
					// Simulate expensive operation
					throw new Error("Should not be called");
				}),
			};

			LogManager.configure({
				level: LogLevel.WARN,
				transports: [expensiveTransport],
			});

			const logger = LogManager.getLogger("test");

			// Should not call transport because DEBUG < WARN
			expect(() => {
				logger.debug("debug message");
			}).not.toThrow();

			expect(expensiveTransport.log).not.toHaveBeenCalled();
		});
	});

	describe("utility methods", () => {
		it("should provide isConfigured method", () => {
			expect(LogManager.isConfigured()).toBe(true); // Configured in beforeEach

			(LogManager as any).config = null;
			expect(LogManager.isConfigured()).toBe(false);
		});

		it("should provide getConfiguration method", () => {
			const config: LoggerConfiguration = {
				level: LogLevel.DEBUG,
				transports: [mockTransport],
			};

			LogManager.configure(config);
			expect(LogManager.getConfiguration()).toEqual(config);
		});

		it("should provide clearCaches method", () => {
			LogManager.configure({
				level: LogLevel.INFO,
				levels: { test: LogLevel.DEBUG },
				transports: [mockTransport],
			});

			// Populate cache
			const logger = LogManager.getLogger("test.component");
			logger.debug("test");

			// Clear caches
			LogManager.clearCaches();

			// Cache should be cleared (this is tested implicitly through behavior)
			expect(() => LogManager.clearCaches()).not.toThrow();
		});
	});
});
